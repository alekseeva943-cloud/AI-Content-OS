// src/constants/voiceRegistry.ts

export interface RegistryVoice {
  localId: string;

  displayName: string;

  provider: 'elevenlabs';

  providerVoiceId: string;

  language: string;

  gender: 'male' | 'female';

  archetype:
    | 'expert'
    | 'storyteller'
    | 'media_host'
    | 'calm_narrator'
    | 'energetic_creator'
    | 'conversational_coach';

  previewText: string;

  speed: number;

  pitch: number;

  stability: number;

  similarityBoost: number;

  style: number;

  emotionalProfile: string;
}

/**
 * SINGLE SOURCE OF TRUTH.
 * Never use ElevenLabs IDs as app-level IDs.
 */

export const VOICE_REGISTRY: RegistryVoice[] = [
  {
    localId: 'alexei',

    displayName: 'Алексей',

    provider: 'elevenlabs',

    providerVoiceId: 'IKne3meq5aC27shg036e',

    language: 'ru-RU',

    gender: 'male',

    archetype: 'media_host',

    previewText: 'Приветствую! Это Алексей.',

    speed: 1,

    pitch: 0,

    stability: 0.75,

    similarityBoost: 0.85,

    style: 0.1,

    emotionalProfile: 'Уверенный медиа-баритон.'
  },

  {
    localId: 'dmitry',

    displayName: 'Дмитрий',

    provider: 'elevenlabs',

    providerVoiceId: 'IKne3meq5aC27shg036e',

    language: 'ru-RU',

    gender: 'male',

    archetype: 'storyteller',

    previewText: 'Это Дмитрий.',

    speed: 0.9,

    pitch: -0.05,

    stability: 0.85,

    similarityBoost: 0.8,

    style: 0.2,

    emotionalProfile: 'Кинематографичный рассказчик.'
  },

  {
    localId: 'anna',

    displayName: 'Анна',

    provider: 'elevenlabs',

    providerVoiceId: 'EXAVITQu4vr4xnSDXMaL',

    language: 'ru-RU',

    gender: 'female',

    archetype: 'calm_narrator',

    previewText: 'Здравствуйте. Это Анна.',

    speed: 0.85,

    pitch: 0.05,

    stability: 0.85,

    similarityBoost: 0.75,

    style: 0.15,

    emotionalProfile: 'Мягкий медитативный голос.'
  }
];

export const DEFAULT_VOICE_LOCAL_ID = 'alexei';

export function getVoiceFromRegistry(
  localId: string
): RegistryVoice | undefined {

  return VOICE_REGISTRY.find(
    (voice) => voice.localId === localId
  );
}