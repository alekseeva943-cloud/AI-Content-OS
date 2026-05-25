// src/services/generateAvatarVideo.ts

import { useDebugStore } from '@/src/stores/useDebugStore';
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

  const registryAvatar = getAvatarFromRegistry(req.avatar.id);

  validateRenderSetup(
    registryAvatar,
    activeVoice,
    30
  );

  const transcript = req.script.scenes
    .map((scene) => scene.narration)
    .join('\n\n');

  let audioBlob: Blob;

  try {
    const synth = await synthesizeElevenLabsAudio(
      transcript,
      activeVoice,
      elevenlabsApiKey,
      addLog
    );

    audioBlob = synth.audioBlob;
  } catch (err: any) {
    const raw = String(err?.message || err);

    // API-level fallback retry
    if (
      raw.includes('voice_not_found') ||
      raw.includes('404')
    ) {
      addLog({
        type: 'warning',
        module: 'VOICE RECOVERY',
        message: 'Voice deleted in ElevenLabs. Triggering recovery.'
      });

      invalidateVoicesCache();

      const freshVoices = await fetchAvailableVoices(
        elevenlabsApiKey
      );

      const fallbackVoice = findNearestCompatibleFallback(
        freshVoices,
        activeVoice.gender,
        activeVoice.archetype
      );

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

  req.onStageChange?.('Сопоставление аватара', 40);