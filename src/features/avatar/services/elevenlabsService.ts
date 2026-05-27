// src/services/elevenlabsService.ts

import { RegistryVoice } from '../constants/voiceRegistry';

// Memory cache
const audioCache =
  new Map<string, Blob>();

/**
 * Generate stable cache key.
 */
function computeCacheKey(
  text: string,
  voiceId: string
): string {

  let hash = 0;

  const rawKey =
    `${voiceId}:${text}`;

  for (
    let i = 0;
    i < rawKey.length;
    i++
  ) {

    const char =
      rawKey.charCodeAt(i);

    hash =
      (hash << 5) -
      hash +
      char;

    hash |= 0;
  }

  return `cached_speech_${Math.abs(hash)}`;
}

/**
 * ElevenLabs synthesis.
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

  if (!text) {

    throw new Error(
      'Пустой текст для синтеза.'
    );

  }

  const cacheKey =
    computeCacheKey(
      text,
      voice.localId
    );

  const cachedBlob =
    audioCache.get(cacheKey);

  // CACHE HIT
  if (cachedBlob) {

    onLog?.({
      type: 'response',

      module:
        '[AUDIO GENERATION]',

      message:
        `[CACHE HIT] ${voice.displayName}`
    });

    return {
      audioBlob: cachedBlob,
      cacheHit: true
    };
  }

  // MOCK MODE
  if (
    !apiKey ||
    apiKey.trim().length < 10
  ) {

    throw new Error(
      'ElevenLabs API key missing.'
    );

  }

  const processedText =
    text;

  const startTime =
    Date.now();

  onLog?.({
    type: 'request',

    module:
      '[AUDIO GENERATION]',

    message:
      `ElevenLabs synthesis: ${voice.displayName}`,

    data: {
      voiceId:
        voice.providerVoiceId,

      model:
        'eleven_turbo_v2_5',

      settings: {
        stability: 0.42,
        similarity_boost: 0.72,
        style: 0.65,
        use_speaker_boost: false
      }
    }
  });

  const endpoint =
    `https://api.elevenlabs.io/v1/text-to-speech/${voice.providerVoiceId}`;

  const response =
    await fetch(endpoint, {

      method: 'POST',

      headers: {
        'xi-api-key': apiKey,

        'Content-Type':
          'application/json',

        'accept':
          'audio/mpeg'
      },

      body: JSON.stringify({

        text:
          processedText,

        model_id:
          'eleven_turbo_v2_5',

        voice_settings: {

          // Lower stability
          // = more human emotion
          stability: 0.42,

          // Lower similarity
          // = less cloned robotic tone
          similarity_boost: 0.72,

          // Higher style
          // = cinematic delivery
          style: 0.65,

          // IMPORTANT:
          // speaker boost creates
          // metallic artifacts.
          use_speaker_boost: false
        }
      })
    });

  const latencyMs =
    Date.now() -
    startTime;

  // ERROR
  if (!response.ok) {

    const errorText =
      await response.text();

    onLog?.({
      type: 'error',

      module:
        '[AUDIO GENERATION]',

      message:
        `ElevenLabs Error ${response.status}`,

      data: {
        errorText,
        latencyMs
      }
    });

    throw new Error(
      `ElevenLabs API Error (${response.status}): ${errorText}`
    );
  }

  const audioBlob =
    await response.blob();

  audioCache.set(
    cacheKey,
    audioBlob
  );

  onLog?.({
    type: 'response',

    module:
      '[AUDIO GENERATION]',

    message:
      `Voice generated successfully (${voice.displayName})`,

    data: {
      latencyMs,

      sizeKB:
        (
          audioBlob.size /
          1024
        ).toFixed(1),

      contentType:
        audioBlob.type
    }
  });

  return {
    audioBlob,
    cacheHit: false
  };
}

/**
 * Manual cache clear.
 */
export function clearSynthesisCache(): void {

  audioCache.clear();

}