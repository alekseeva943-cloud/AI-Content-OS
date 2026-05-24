import { useDebugStore } from '@/src/stores/useDebugStore';
import { useSettingsStore } from '@/src/stores/useSettingsStore';
import { Avatar, AvatarScript } from '../types/avatar.types';
import { getAvatarFromRegistry } from '../constants/avatarRegistry';
import { routeVoice, preprocessTextForVoice } from './voiceRouter';
import { resolveAndValidateAvatar } from './avatarResolver';
import { synthesizeElevenLabsAudio } from './elevenlabsService';
import { uploadAudioToHeyGen, validateRenderSetup, dispatchHeyGenLipsyncRender } from './heygenAvatarService';

export interface GenerateVideoRequest {
  script: AvatarScript;
  avatar: Avatar;
  voiceId: string;
  voiceSettings?: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
  heygenApiKey?: string;
  onStageChange?: (stage: string, percent: number) => void;
}

export interface GenerateVideoResponse {
  success: boolean;
  videoId: string;
  videoUrl?: string;
  estimatedCost: number;
  durationSeconds: number;
  rawResponse?: any;
  httpStatus: number;
  latencyMs: number;
  providerName: string;
  voiceTrace?: {
    selectedVoice: string;
    provider: string;
    previewVoiceId: string;
    renderVoiceId: string;
    heygenVoiceId: string;
    language: string;
    model: string;
    cache: string;
    fallbackTriggered: boolean;
  };
}

// Global state mutex keeping rendering operations safely aligned
let isGenerating = false;
let lastGenerateTime = 0;
const COOLDOWN_MS = 5000;

/**
 * Backward compatible signature of Russian Speech Preprocessor
 */
export function preprocessRussianSpeechV3(text: string, voice: any): string {
  // Translate dummy call to the modular preprocessor
  return preprocessTextForVoice(text, voice);
}

export function preprocessRussianSpeech(text: string): string {
  // Use the standard fallback voice (Anna storyteller) for dummy transforms
  const matched = routeVoice('anna');
  return preprocessTextForVoice(text, matched.voice);
}

/**
 * High-performance End-to-End Avatar Video Generator.
 * Coordinates Text -> ElevenLabs Audio -> HeyGen Lipsync Render
 */
export async function generateAvatarVideo(req: GenerateVideoRequest): Promise<GenerateVideoResponse> {
  const addLog = useDebugStore.getState().addLog;
  const elevenlabsApiKey = useSettingsStore.getState().elevenlabsKey;
  const startTime = Date.now();

  // 1. Concurrency Check
  if (isGenerating) {
    throw new Error('Процесс генерации уже запущен. Пожалуйста, подождите завершения.');
  }

  const now = Date.now();
  if (now - lastGenerateTime < COOLDOWN_MS) {
    const elapsedSecs = Math.ceil((COOLDOWN_MS - (now - lastGenerateTime)) / 1000);
    throw new Error(`Пожалуйста, сделайте паузу между рендерами в ${elapsedSecs} сек.`);
  }

  isGenerating = true;
  lastGenerateTime = now;

  try {
    req.onStageChange?.('[VOICE ROUTING] Подготовка параметров', 10);

    // Calculate metadata
    const estimatedDurationSeconds = req.script.scenes.reduce((acc, s) => acc + (s.durationSeconds || 10), 0) + 5;
    const estimatedCost = parseFloat(((estimatedDurationSeconds / 60) * 0.40).toFixed(4));
    
    // 2. Validate and Retrieve Registry Objects
    const routedVoice = routeVoice(req.voiceId);
    const registryAvatar = getAvatarFromRegistry(req.avatar.id);

    // Check config details safely showing human diagnostics instead of raw crashes
    req.onStageChange?.('[VALIDATION] Проверка настроек', 20);
    const diagnostics = validateRenderSetup(registryAvatar, routedVoice.voice, estimatedDurationSeconds);

    if (diagnostics.criticalIssues.length > 0) {
      addLog({
        type: 'error',
        module: 'AI-Render-Diagnostics',
        message: 'При проверке конфигурации обнаружены критические ошибки.',
        data: diagnostics
      });
      // Fallback or bubble clear descriptive error to client UI
      throw new Error(`Проверка параметров провалена: ${diagnostics.criticalIssues.join(' | ')}`);
    }

    // Print warning diagnostics if any
    diagnostics.infoMessages.forEach(msg => {
      addLog({
        type: 'info',
        module: 'AI-Render-Diagnostics',
        message: msg
      });
    });

    // 3. Resolve Real Heygen Avatar
    req.onStageChange?.('[AVATAR ROUTING] Сопоставление цифрового двойника', 30);
    const resolvedAvatar = await resolveAndValidateAvatar(
      req.avatar.id,
      req.heygenApiKey,
      addLog
    );

    // 4. Preprocess Humanized Speech Transcript
    const scriptCombined = `${req.script.hook}\n\n` + req.script.scenes.map(s => s.narration).join('\n\n');
    const humanizedTranscript = preprocessTextForVoice(scriptCombined, routedVoice.voice);

    // 5. Synthesize Audio via ElevenLabs
    req.onStageChange?.('[AUDIO GENERATION] Запуск синтеза ElevenLabs V2...', 45);
    const { audioBlob, cacheHit } = await synthesizeElevenLabsAudio(
      humanizedTranscript,
      routedVoice.voice,
      elevenlabsApiKey,
      addLog
    );

    // Set trace mapping
    const voiceTrace = {
      selectedVoice: routedVoice.voice.displayName,
      provider: routedVoice.voice.provider,
      previewVoiceId: routedVoice.voice.providerVoiceId,
      renderVoiceId: routedVoice.voice.providerVoiceId,
      heygenVoiceId: 'synced-audio-lipsync',
      language: routedVoice.voice.language,
      model: 'eleven_multilingual_v2',
      cache: cacheHit ? 'HIT' : 'MISS',
      fallbackTriggered: routedVoice.isFallback
    };

    // 6. Check if we have active key to request real render
    if (req.heygenApiKey && req.heygenApiKey.trim().length > 10) {
      // Live Render Flow
      req.onStageChange?.('[LIPSYNC RENDER] Загрузка аудиодорожки в Assets...', 65);
      const audioUrl = await uploadAudioToHeyGen(audioBlob, req.heygenApiKey, addLog);

      req.onStageChange?.('[LIPSYNC RENDER] Постановка видео на рендеринг...', 85);
      const renderResult = await dispatchHeyGenLipsyncRender(
        resolvedAvatar.heygenAvatarId,
        req.avatar.avatarStyle || 'normal',
        audioUrl,
        req.heygenApiKey,
        addLog
      );

      isGenerating = false;
      req.onStageChange?.('Готово', 100);

      const latencyMs = Date.now() - startTime;
      return {
        success: true,
        videoId: renderResult.videoId,
        estimatedCost,
        durationSeconds: estimatedDurationSeconds,
        rawResponse: renderResult.rawResponse,
        httpStatus: renderResult.httpStatus,
        latencyMs,
        providerName: 'HeyGen (ElevenLabs Audio LipSync)',
        voiceTrace
      };

    } else {
      // Simulated Render Flow
      req.onStageChange?.('[SIMULATOR] Симуляция загрузки lipsync...', 70);
      const latencyMs = Math.round(Math.random() * 300 + 1000);
      await new Promise(resolve => setTimeout(resolve, latencyMs));

      addLog({
        type: 'response',
        module: 'AI-Avatar-Render-Sim',
        message: `Успешная симуляция Lipsync рендера! Динамически назначен: ${resolvedAvatar.heygenAvatarId}`,
        data: {
          avatarId: req.avatar.id,
          resolvedAvatar,
          voiceTrace,
          duration: estimatedDurationSeconds,
          cost: estimatedCost
        }
      });

      isGenerating = false;
      req.onStageChange?.('Готово', 100);

      return {
        success: true,
        videoId: `sim_heygen_${req.avatar.id}_${Math.random().toString(36).substring(2, 11)}`,
        estimatedCost,
        durationSeconds: estimatedDurationSeconds,
        httpStatus: 200,
        latencyMs: Date.now() - startTime,
        providerName: 'HeyGen (Simulated Audio LipSync)',
        voiceTrace
      };
    }

  } catch (err: any) {
    isGenerating = false;
    const latencyErrorMs = Date.now() - startTime;

    // Log diagnostic failure trace details directly into public debug log
    addLog({
      type: 'error',
      module: 'AI-Avatar-Render-Failure',
      message: `Во время выполнения конвейера произошел сбой: ${err.message || err}`,
      data: {
        httpStatus: err.status || 500,
        rawResponse: err.stack || String(err),
        latencyMs: latencyErrorMs,
        providerName: 'ElevenLabs + HeyGen Pipeline'
      }
    });

    throw err;
  }
}
