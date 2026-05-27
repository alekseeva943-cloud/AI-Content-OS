// src/services/elevenlabsService.ts

import { RegistryVoice } from '../constants/voiceRegistry';

// Simple in-memory cache
const audioCache =
  new Map<string, Blob>();

/**
 * Stable cache key.
 */
function computeCacheKey(
  text: string,
  voiceId: string
): string {

  let hash = 0;

  const raw =
    `${voiceId}:${text}`;

  for (
    let i = 0;
    i < raw.length;
    i++
  ) {

    const chr =
      raw.charCodeAt(i);

    hash =
      (hash << 5) -
      hash +
      chr;

    hash |= 0;
  }

  return `browser_tts_${Math.abs(hash)}`;
}

/**
 * Browser speech synthesis →
 * audio placeholder blob.
 *
 * IMPORTANT:
 * We FULLY DISABLE ElevenLabs API.
 *
 * Homework / demo mode only.
 */
export async function synthesizeElevenLabsAudio(
  text: string,
  voice: RegistryVoice,
  apiKey?: string,
  onLog?: (logEntry: any) => void
): Promise<{
  audioBlob: Blob;
  cacheHit: boolean;
}> {

  if (!text?.trim()) {

    throw new Error(
      'Пустой текст для синтеза.'
    );

  }

  const cacheKey =
    computeCacheKey(
      text,
      voice.localId
    );

  const cached =
    audioCache.get(cacheKey);

  // CACHE
  if (cached) {

    onLog?.({
      type: 'response',

      module:
        '[AUDIO GENERATION]',

      message:
        `[CACHE HIT] ${voice.displayName}`
    });

    return {
      audioBlob: cached,
      cacheHit: true
    };
  }

  // ======================================================
  // BROWSER TTS
  // ======================================================

  const synth =
    window.speechSynthesis;

  if (!synth) {

    throw new Error(
      'Browser SpeechSynthesis недоступен.'
    );

  }

  onLog?.({
    type: 'request',

    module:
      '[AUDIO GENERATION]',

    message:
      `Browser TTS synthesis: ${voice.displayName}`,

    data: {
      provider:
        'browser_speech_synthesis',

      gender:
        voice.gender
    }
  });

  // Wait voices load
  await new Promise<void>((resolve) => {

    const voices =
      synth.getVoices();

    if (voices.length > 0) {
      resolve();
      return;
    }

    const handler = () => {
      resolve();
      synth.removeEventListener(
        'voiceschanged',
        handler
      );
    };

    synth.addEventListener(
      'voiceschanged',
      handler
    );
  });

  const utterance =
    new SpeechSynthesisUtterance(
      text
    );

  utterance.lang = 'ru-RU';

  // Different voice routing
  const availableVoices =
    synth.getVoices();

  const selectedVoice =
    availableVoices.find((v) => {

      const name =
        v.name.toLowerCase();

      if (
        voice.gender ===
        'female'
      ) {

        return (
          name.includes('irina') ||
          name.includes('zira') ||
          name.includes('female')
        );
      }

      return (
        name.includes('pavel') ||
        name.includes('david') ||
        name.includes('male')
      );

    });

  if (selectedVoice) {

    utterance.voice =
      selectedVoice;

  }

  // Different cadence
  if (
    voice.gender ===
    'female'
  ) {

    utterance.rate = 0.92;
    utterance.pitch = 1.12;

  } else {

    utterance.rate = 1;
    utterance.pitch = 0.92;

  }

  utterance.volume = 1;

  // Speak preview
  synth.cancel();
  synth.speak(utterance);

  // ======================================================
  // IMPORTANT
  //
  // Browser speech synthesis
  // CANNOT export audio.
  //
  // So for homework/demo mode
  // we create a tiny placeholder mp3 blob.
  //
  // HeyGen accepts external URL later.
  // ======================================================

  const fakeAudioBlob =
    new Blob(
      ['demo-browser-tts'],
      {
        type: 'audio/mpeg'
      }
    );

  audioCache.set(
    cacheKey,
    fakeAudioBlob
  );

  onLog?.({
    type: 'response',

    module:
      '[AUDIO GENERATION]',

    message:
      `Browser TTS generated successfully (${voice.displayName})`,

    data: {
      provider:
        'browser_speech_synthesis',

      contentType:
        fakeAudioBlob.type
    }
  });

  return {
    audioBlob:
      fakeAudioBlob,

    cacheHit: false
  };
}

/**
 * Manual cache clear.
 */
export function clearSynthesisCache(): void {

  audioCache.clear();

}