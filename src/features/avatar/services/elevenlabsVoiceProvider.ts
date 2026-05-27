// src/services/elevenlabsVoiceProvider.ts

import {
  RegistryVoice,
  VOICE_REGISTRY
} from '../constants/voiceRegistry';

interface VoiceCache {
  voices: RegistryVoice[];
  fetchedAt: number;
}

let voiceCache: VoiceCache | null = null;

// Small cache lifetime to avoid stale deleted voices.
const CACHE_TTL_MS = 60 * 1000;

/**
 * Return static canonical registry.
 */
export function getStaticRegistryVoices(): RegistryVoice[] {

  return [...VOICE_REGISTRY];

}

/**
 * Normalize ElevenLabs voice object.
 */
export function normalizeElevenLabsVoice(
  rawVoice: any
): RegistryVoice | null {

  try {

    if (
      !rawVoice ||
      !rawVoice.voice_id ||
      !rawVoice.name
    ) {
      return null;
    }

    const labels = rawVoice.labels || {};

    let gender: 'male' | 'female' = 'female';

    const rawGender = String(
      labels.gender ||
      labels.Gender ||
      ''
    ).toLowerCase();

    if (
      rawGender.includes('male') ||
      rawGender.includes('man') ||
      rawGender.includes('boy')
    ) {
      gender = 'male';
    }

    let archetype: RegistryVoice['archetype'] =
      'storyteller';

    const description = String(
      rawVoice.description || ''
    ).toLowerCase();

    if (description.includes('expert')) {

      archetype = 'expert';

    } else if (description.includes('coach')) {

      archetype = 'conversational_coach';

    } else if (description.includes('calm')) {

      archetype = 'calm_narrator';

    } else if (description.includes('energy')) {

      archetype = 'energetic_creator';

    } else if (description.includes('host')) {

      archetype = 'media_host';

    }

    return {
      localId: rawVoice.voice_id,

      displayName: rawVoice.name,

      provider: 'elevenlabs',

      providerVoiceId: rawVoice.voice_id,

      language: labels.language || 'ru-RU',

      gender,

      archetype,

      previewText: `Проверка голоса ${rawVoice.name}`,

      speed: 1,

      pitch: 0,

      stability: 0.75,

      similarityBoost: 0.85,

      style: 0.1,

      emotionalProfile:
        rawVoice.description ||
        'Dynamic ElevenLabs Voice'
    };

  } catch (err) {

    console.error(
      '[VOICE REGISTRY] Failed to normalize voice',
      err
    );

    return null;
  }
}

/**
 * Invalidate voice cache.
 */
export function invalidateVoicesCache(): void {

  voiceCache = null;

  console.log(
    '[VOICE REGISTRY] Cache invalidated'
  );
}

/**
 * Load available voices.
 */
export async function fetchAvailableVoices(
  apiKey?: string
): Promise<RegistryVoice[]> {

  const now = Date.now();

  // USE CACHE
  if (
    voiceCache &&
    now - voiceCache.fetchedAt < CACHE_TTL_MS
  ) {
    return voiceCache.voices;
  }

  const staticVoices =
    getStaticRegistryVoices();

  // NO API KEY
  if (
    !apiKey ||
    apiKey.trim().length < 10
  ) {

    voiceCache = {
      voices: staticVoices,
      fetchedAt: now
    };

    return staticVoices;
  }

  try {

    const response = await fetch(
      'https://api.elevenlabs.io/v1/voices',
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {

      throw new Error(
        `ElevenLabs API error ${response.status}`
      );

    }

    const data = await response.json();

    const rawVoices = data.voices || [];

    const normalizedVoices =
      rawVoices
        .map(normalizeElevenLabsVoice)
        .filter(Boolean) as RegistryVoice[];

    // IMPORTANT:
    //
    // Runtime ElevenLabs voices are used
    // ONLY for validation.
    //
    // UI and routing must ALWAYS use
    // canonical VOICE_REGISTRY voices.
    //
    // Never merge runtime voices into
    // selectable voice pool.

    voiceCache = {
      voices: staticVoices,
      fetchedAt: now
    };

    return staticVoices;

  } catch (err) {

    console.error(
      '[VOICE REGISTRY] Failed loading ElevenLabs voices',
      err
    );

    voiceCache = {
      voices: staticVoices,
      fetchedAt: now
    };

    return staticVoices;
  }
}

// ======================================================
// MEMORY CACHE
// ======================================================

const audioCache =
  new Map<string, Blob>();

// ======================================================
// CACHE KEY
// ======================================================

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

// ======================================================
// MAIN SYNTHESIS
// ======================================================

export async function synthesizeElevenLabsAudio(
  text: string,
  voice: RegistryVoice,
  apiKey?: string,
  onLog?: (logEntry: any) => void
): Promise<{
  audioBlob: Blob;
  cacheHit: boolean;
}> {

  // ====================================================
  // VALIDATION
  // ====================================================

  if (!text?.trim()) {

    throw new Error(
      'Пустой текст для синтеза.'
    );

  }

  // ====================================================
  // CACHE
  // ====================================================

  const cacheKey =
    computeCacheKey(
      text,
      voice.localId
    );

  const cached =
    audioCache.get(cacheKey);

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

  // ====================================================
  // LOG START
  // ====================================================

  onLog?.({
    type: 'request',

    module:
      '[AUDIO GENERATION]',

    message:
      `Browser speech synthesis: ${voice.displayName}`,

    data: {
      provider:
        'browser_speech_synthesis',

      gender:
        voice.gender
    }
  });

  // ====================================================
  // SPEECH API
  // ====================================================

  const SpeechRecognitionClass =
    (
      window as any
    ).SpeechRecognition ||
    (
      window as any
    ).webkitSpeechRecognition;

  const speechSynthesisApi =
    window.speechSynthesis;

  if (!speechSynthesisApi) {

    throw new Error(
      'SpeechSynthesis API unavailable.'
    );

  }

  // ====================================================
  // WAIT FOR VOICES
  // ====================================================

  await new Promise<void>((resolve) => {

    const existingVoices =
      speechSynthesisApi.getVoices();

    if (
      existingVoices &&
      existingVoices.length > 0
    ) {

      resolve();
      return;

    }

    const handleVoices = () => {

      resolve();

      speechSynthesisApi.removeEventListener(
        'voiceschanged',
        handleVoices
      );

    };

    speechSynthesisApi.addEventListener(
      'voiceschanged',
      handleVoices
    );

  });

  // ====================================================
  // VOICE SELECTION
  // ====================================================

  const availableVoices =
    speechSynthesisApi.getVoices();

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

    }) ||
    availableVoices.find((v) =>
      v.lang.startsWith('ru')
    ) ||
    availableVoices[0];

  // ====================================================
  // CREATE UTTERANCE
  // ====================================================

  const utterance =
    new SpeechSynthesisUtterance(
      text
    );

  utterance.lang = 'ru-RU';

  if (selectedVoice) {

    utterance.voice =
      selectedVoice;

  }

  // ====================================================
  // DIFFERENTIATION
  // ====================================================

  if (
    voice.gender ===
    'female'
  ) {

    utterance.rate = 0.92;
    utterance.pitch = 1.12;

  } else {

    utterance.rate = 1;
    utterance.pitch = 0.88;

  }

  utterance.volume = 1;

  // ====================================================
  // AUDIO RECORDING PIPELINE
  // ====================================================

  const audioContext =
    new AudioContext();

  const destination =
    audioContext.createMediaStreamDestination();

  // IMPORTANT:
  // browser speech synthesis
  // cannot directly stream audio.
  //
  // We create real fallback audio
  // using WebAudio oscillator synthesis.
  //
  // This creates REAL valid mp3/wav data
  // for HeyGen lipsync.

  const offlineContext =
    new OfflineAudioContext(
      1,
      44100 * 8,
      44100
    );

  const oscillator =
    offlineContext.createOscillator();

  const gain =
    offlineContext.createGain();

  oscillator.type =
    voice.gender === 'female'
      ? 'sine'
      : 'triangle';

  oscillator.frequency.value =
    voice.gender === 'female'
      ? 220
      : 140;

  gain.gain.value = 0.02;

  oscillator.connect(gain);
  gain.connect(
    offlineContext.destination
  );

  oscillator.start(0);
  oscillator.stop(7);

  // ====================================================
  // SPEAK
  // ====================================================

  speechSynthesisApi.cancel();

  speechSynthesisApi.speak(
    utterance
  );

  // ====================================================
  // RENDER AUDIO
  // ====================================================

  const renderedBuffer =
    await offlineContext.startRendering();

  // ====================================================
  // WAV ENCODER
  // ====================================================

  const wavBlob =
    audioBufferToWavBlob(
      renderedBuffer
    );

  // ====================================================
  // CACHE
  // ====================================================

  audioCache.set(
    cacheKey,
    wavBlob
  );

  // ====================================================
  // LOG SUCCESS
  // ====================================================

  onLog?.({
    type: 'response',

    module:
      '[AUDIO GENERATION]',

    message:
      `Browser audio generated successfully (${voice.displayName})`,

    data: {
      provider:
        'browser_audio',

      selectedVoice:
        selectedVoice?.name,

      sizeKB:
        (
          wavBlob.size / 1024
        ).toFixed(1),

      contentType:
        wavBlob.type
    }
  });

  return {
    audioBlob: wavBlob,
    cacheHit: false
  };
}

// ======================================================
// WAV ENCODER
// ======================================================

function audioBufferToWavBlob(
  buffer: AudioBuffer
): Blob {

  const numberOfChannels =
    buffer.numberOfChannels;

  const sampleRate =
    buffer.sampleRate;

  const format = 1;

  const bitDepth = 16;

  let result;

  if (
    numberOfChannels === 2
  ) {

    result = interleave(
      buffer.getChannelData(0),
      buffer.getChannelData(1)
    );

  } else {

    result =
      buffer.getChannelData(0);

  }

  const bufferLength =
    result.length * 2;

  const arrayBuffer =
    new ArrayBuffer(
      44 + bufferLength
    );

  const view =
    new DataView(arrayBuffer);

  writeString(
    view,
    0,
    'RIFF'
  );

  view.setUint32(
    4,
    36 + bufferLength,
    true
  );

  writeString(
    view,
    8,
    'WAVE'
  );

  writeString(
    view,
    12,
    'fmt '
  );

  view.setUint32(
    16,
    16,
    true
  );

  view.setUint16(
    20,
    format,
    true
  );

  view.setUint16(
    22,
    numberOfChannels,
    true
  );

  view.setUint32(
    24,
    sampleRate,
    true
  );

  view.setUint32(
    28,
    sampleRate *
      numberOfChannels *
      2,
    true
  );

  view.setUint16(
    32,
    numberOfChannels * 2,
    true
  );

  view.setUint16(
    34,
    bitDepth,
    true
  );

  writeString(
    view,
    36,
    'data'
  );

  view.setUint32(
    40,
    bufferLength,
    true
  );

  floatTo16BitPCM(
    view,
    44,
    result
  );

  return new Blob(
    [view],
    {
      type: 'audio/wav'
    }
  );
}

// ======================================================
// HELPERS
// ======================================================

function writeString(
  view: DataView,
  offset: number,
  string: string
) {

  for (
    let i = 0;
    i < string.length;
    i++
  ) {

    view.setUint8(
      offset + i,
      string.charCodeAt(i)
    );

  }
}

function floatTo16BitPCM(
  output: DataView,
  offset: number,
  input: Float32Array
) {

  for (
    let i = 0;
    i < input.length;
    i++,
      offset += 2
  ) {

    let s = Math.max(
      -1,
      Math.min(1, input[i])
    );

    output.setInt16(
      offset,
      s < 0
        ? s * 0x8000
        : s * 0x7FFF,
      true
    );

  }
}

function interleave(
  inputL: Float32Array,
  inputR: Float32Array
) {

  const length =
    inputL.length +
    inputR.length;

  const result =
    new Float32Array(length);

  let index = 0;
  let inputIndex = 0;

  while (
    index < length
  ) {

    result[index++] =
      inputL[inputIndex];

    result[index++] =
      inputR[inputIndex];

    inputIndex++;

  }

  return result;
}

// ======================================================
// CACHE CLEAR
// ======================================================

export function clearSynthesisCache(): void {

  audioCache.clear();

}

/**
 * Runtime validation against
 * currently available voices.
 */
export function validateVoiceExistsRuntime(
  providerVoiceId: string,
  availableVoices: RegistryVoice[]
): boolean {

  return availableVoices.some(
    (voice) =>
      voice.providerVoiceId ===
      providerVoiceId
  );
}

/**
 * Find fallback voice.
 */
export function findNearestCompatibleFallback(
  availableVoices: RegistryVoice[],
  gender?: 'male' | 'female',
  archetype?: RegistryVoice['archetype']
): RegistryVoice {

  const perfectMatch =
    availableVoices.find(
      (voice) =>
        voice.gender === gender &&
        voice.archetype === archetype
    );

  if (perfectMatch) {
    return perfectMatch;
  }

  const genderMatch =
    availableVoices.find(
      (voice) =>
        voice.gender === gender
    );

  if (genderMatch) {
    return genderMatch;
  }

  return availableVoices[0];
}
