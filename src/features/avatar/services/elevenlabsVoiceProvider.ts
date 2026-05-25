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