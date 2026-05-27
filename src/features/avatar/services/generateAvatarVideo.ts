// src/services/generateAvatarVideo.ts

import { useDebugStore } from '@/src/stores/useDebugStore';
import { useSettingsStore } from '@/src/stores/useSettingsStore';

import { Avatar, AvatarScript } from '../types/avatar.types';
import { getAvatarFromRegistry } from '../constants/avatarRegistry';
import { routeVoice, preprocessTextForVoice } from './voiceRouter';

import {
  fetchAvailableVoices,
  validateVoiceExistsRuntime,
  findNearestCompatibleFallback,
  invalidateVoicesCache
} from './elevenlabsVoiceProvider';

import { synthesizeElevenLabsAudio } from './elevenlabsService';

import { resolveAndValidateAvatar } from './avatarResolver';

import {

  validateRenderSetup,
  dispatchHeyGenLipsyncRender
} from './heygenAvatarService';

export interface GenerateVideoRequest {
  script: AvatarScript;
  avatar: Avatar;
  voiceId: string;
  heygenApiKey?: string;
  onStageChange?: (stage: string, percent: number) => void;
}

export interface GenerateVideoResponse {
  success: boolean;
  videoId: string;
  rawResponse?: any;
  provider: string;
  estimatedCost: number;
  durationSeconds: number;
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

/**
 * Backward compatible signature of Russian Speech Preprocessor
 */
export function preprocessRussianSpeechV3(text: string, voice: any): string {
  return preprocessTextForVoice(text, voice);
}

export function preprocessRussianSpeech(text: string): string {
  const matched = routeVoice('anna');
  return preprocessTextForVoice(text, matched.voice);
}

export async function generateAvatarVideo(
  req: GenerateVideoRequest
): Promise<GenerateVideoResponse> {

  const addLog = useDebugStore.getState().addLog;

  const elevenlabsApiKey =
    useSettingsStore.getState().elevenlabsKey;

  req.onStageChange?.('Загрузка голосов', 10);

  // LOAD AVAILABLE VOICES
  const availableVoices = await fetchAvailableVoices(
    elevenlabsApiKey
  );

  // FIND ACTIVE VOICE
  const routedVoice = routeVoice(
    req.voiceId
  );

  let activeVoice =
    routedVoice.voice;

  let fallbackTriggered = false;

  // HARD FALLBACK IF VOICE MISSING
  if (!activeVoice) {
    fallbackTriggered = true;
    addLog({
      type: 'info',
      module: 'VOICE FALLBACK',
      message: `Voice ${req.voiceId} not found. Using fallback.`
    });

    activeVoice = findNearestCompatibleFallback(
      availableVoices,
      'male',
      'storyteller'
    );
  }

  // RUNTIME VALIDATION AGAINST REAL ELEVENLABS LIST
  const existsRuntime = validateVoiceExistsRuntime(
    activeVoice.providerVoiceId,
    availableVoices
  );

  // IF VOICE DELETED IN ELEVENLABS
  if (!existsRuntime) {
    fallbackTriggered = true;
    addLog({
      type: 'info',
      module: 'VOICE VALIDATION',
      message: `Voice ${activeVoice.providerVoiceId} missing in ElevenLabs runtime.`
    });

    activeVoice = findNearestCompatibleFallback(
      availableVoices,
      activeVoice.gender,
      activeVoice.archetype
    );
  }

  // VALIDATE AVATAR
  const registryAvatar = getAvatarFromRegistry(
    req.avatar.id
  );

  const estimatedDurationSeconds = req.script.scenes.reduce((acc, s) => acc + (s.durationSeconds || 10), 0) + 5;
  const estimatedCost = parseFloat(((estimatedDurationSeconds / 60) * 0.40).toFixed(4));

  validateRenderSetup(
    registryAvatar,
    activeVoice,
    estimatedDurationSeconds
  );

  // BUILD TRANSCRIPT
  const transcript = req.script.scenes
    .map((scene) => scene.narration)
    .join('\n\n');

  let audioBlob: Blob;

  // SYNTHESIZE AUDIO
  try {

    const synth = await synthesizeElevenLabsAudio(
      transcript,
      activeVoice,
      elevenlabsApiKey,
      addLog
    );

    audioBlob = synth.audioBlob;

  } catch (err: any) {

    const raw = String(
      err?.message || err
    );

    // HANDLE DELETED VOICES
    if (
      raw.includes('voice_not_found') ||
      raw.includes('404')
    ) {
      fallbackTriggered = true;
      addLog({
        type: 'info',
        module: 'VOICE RECOVERY',
        message: 'Voice deleted in ElevenLabs. Starting recovery.'
      });

      // CLEAR CACHE
      invalidateVoicesCache();

      // RELOAD FRESH VOICES
      const freshVoices = await fetchAvailableVoices(
        elevenlabsApiKey
      );

      // SELECT FALLBACK
      const fallbackVoice =
        findNearestCompatibleFallback(
          freshVoices,
          activeVoice.gender,
          activeVoice.archetype
        );

      // RETRY SYNTHESIS
      const retry = await synthesizeElevenLabsAudio(
        transcript,
        fallbackVoice,
        elevenlabsApiKey,
        addLog
      );

      audioBlob = retry.audioBlob;
      activeVoice = fallbackVoice;

    } else {

      throw err;

    }
  }

  req.onStageChange?.(
    'Сопоставление аватара',
    40
  );

  // RESOLVE HEYGEN AVATAR
  const resolvedAvatar =
    await resolveAndValidateAvatar(
      req.avatar.id,
      req.heygenApiKey,
      addLog
    );

  req.onStageChange?.(
    'Загрузка аудио',
    60
  );

  // UPLOAD AUDIO
  // CREATE TEMP AUDIO URL
  const audioFile = new File(
    [audioBlob],
    'speech.mp3',
    {
      type: 'audio/mpeg'
    }
  );

  const formData = new FormData();

  formData.append(
    'file',
    audioFile
  );

  addLog({
    type: 'request',
    module: '[TEMP AUDIO]',
    message: 'Uploading temporary audio file'
  });

  const uploadResp = await fetch(
    'https://tmpfiles.org/api/v1/upload',
    {
      method: 'POST',
      body: formData
    }
  );

  const uploadJson =
    await uploadResp.json();

  if (
    !uploadResp.ok ||
    !uploadJson?.data?.url
  ) {
    throw new Error(
      'Temporary audio upload failed'
    );
  }

  // TMPFiles returns preview URL.
  // Convert to direct file URL.
  const audioUrl =
    uploadJson.data.url
      .replace(
        'https://tmpfiles.org/',
        'https://tmpfiles.org/dl/'
      );

  addLog({
    type: 'response',
    module: '[TEMP AUDIO]',
    message:
      'Temporary audio URL created',
    data: {
      audioUrl
    }
  });

  req.onStageChange?.(
    'Рендер HeyGen',
    80
  );

  // START RENDER
  const render =
    await dispatchHeyGenLipsyncRender(
      resolvedAvatar.heygenAvatarId,
      req.avatar.avatarStyle || 'normal',
      audioUrl,
      req.heygenApiKey || '',
      addLog
    );

  req.onStageChange?.(
    'Готово',
    100
  );

  const voiceTrace = {
    selectedVoice: activeVoice.displayName,
    provider: activeVoice.provider,
    previewVoiceId: activeVoice.providerVoiceId,
    renderVoiceId: activeVoice.providerVoiceId,
    heygenVoiceId: 'synced-audio-lipsync',
    language: activeVoice.language,
    model: 'eleven_multilingual_v2',
    cache: 'MISS',
    fallbackTriggered: fallbackTriggered
  };

  return {
    success: true,
    videoId: render.videoId,
    rawResponse: render.rawResponse,
    provider: 'HeyGen + ElevenLabs',
    estimatedCost,
    durationSeconds: estimatedDurationSeconds,
    voiceTrace
  };
}