// src/services/elevenlabsVoiceProvider.ts

import { RegistryVoice, VOICE_REGISTRY } from '../constants/voiceRegistry';

interface VoiceCache {
  voices: RegistryVoice[];
  fetchedAt: number;
}

let voiceCache: VoiceCache | null = null;

// Reduced cache lifetime to avoid stale deleted voices.
const CACHE_TTL_MS = 60 * 1000;

/**
 * Returns canonical static registry.
 * Static registry is the SINGLE SOURCE OF TRUTH.
 */
export function getStaticRegistryVoices(): RegistryVoice[] {
  return [...VOICE_REGISTRY];
}

/**
 * Safely normalize dynamic ElevenLabs voices.
 */
export function normalizeElevenLabsVoice(rawVoice: any): RegistryVoice | null {
  try {
    if (!rawVoice?.voice_id || !rawVoice?.name) {
      return null;
    }

    const labels = rawVoice.labels || {};

    let gender: 'male' | 'female' = 'female';

    const rawGender = String(
      labels.gender || labels.Gender || ''
    ).toLowerCase();

    if (
      rawGender.includes('male') ||
      rawGender.includes('man') ||
      rawGender.includes('boy')
    ) {
      gender = 'male';
    }

    let archetype: RegistryVoice['archetype'] = 'storyteller';

    const description = String(rawVoice.description || '').toLowerCase();

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
        rawVoice.description || 'Dynamic ElevenLabs Voice'
    };

  } catch (err) {
    console.error(
      '[VOICE REGISTRY] Failed to normalize voice',
      err
    );

    return null;
  }
}