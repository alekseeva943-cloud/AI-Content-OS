// src/services/generateAvatarVideo.ts

import { useDebugStore } from '@/src/stores/useDebugStore';
import { useSettingsStore } from '@/src/stores/useSettingsStore';

import { Avatar, AvatarScript } from '../types/avatar.types';
import { getAvatarFromRegistry } from '../constants/avatarRegistry';

import {
  fetchAvailableVoices,
  validateVoiceExistsRuntime,
  findNearestCompatibleFallback,
  invalidateVoicesCache
} from './elevenlabsVoiceProvider';

import { synthesizeElevenLabsAudio } from './elevenlabsService';

import { resolveAndValidateAvatar } from './avatarResolver';

import {
  uploadAudioToHeyGen,
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
  let activeVoice = availableVoices.find(
    (voice) => voice.localId === req.voiceId
  );

  // HARD FALLBACK IF VOICE MISSING
  if (!activeVoice) {

    addLog({
      type: 'warning',
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

    addLog({
      type: 'warning',
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

  validateRenderSetup(
    registryAvatar,
    activeVoice,
    30
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

      addLog({
        type: 'warning',
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
  const audioUrl = await uploadAudioToHeyGen(
    audioBlob,
    req.heygenApiKey || '',
    addLog
  );

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

  return {
    success: true,
    videoId: render.videoId,
    rawResponse: render.rawResponse,
    provider: 'HeyGen + ElevenLabs'
  };
}