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

  // =========================================
  // MALE VOICES
  // =========================================

  {
    localId: 'alexei',

    displayName: 'Алексей',

    provider: 'elevenlabs',

    // Ivan - energetic russian male
    providerVoiceId: 'JKtNvDNrWu33P1xzttP2',

    language: 'ru-RU',

    gender: 'male',

    archetype: 'media_host',

    previewText:
      'Приветствую. Это Алексей.',

    speed: 1,

    pitch: 0,

    stability: 0.72,

    similarityBoost: 0.85,

    style: 0.18,

    emotionalProfile:
      'Энергичный медиа-ведущий.'
  },

  {
    localId: 'dmitry',

    displayName: 'Дмитрий',

    provider: 'elevenlabs',

    // Marat - warm storyteller
    providerVoiceId: 'vQxSi2EuaRWwBw3nn6dK',

    language: 'ru-RU',

    gender: 'male',

    archetype: 'storyteller',

    previewText:
      'Это Дмитрий. Начинаем.',

    speed: 0.92,

    pitch: -0.04,

    stability: 0.82,

    similarityBoost: 0.8,

    style: 0.28,

    emotionalProfile:
      'Тёплый кинематографичный рассказчик.'
  },

  {
    localId: 'maksim',

    displayName: 'Максим',

    provider: 'elevenlabs',

    // Maxim - neutral professional
    providerVoiceId: 'HcaxAsrhw4ByUo4CBCBN',

    language: 'ru-RU',

    gender: 'male',

    archetype: 'expert',

    previewText:
      'Здравствуйте. Говорит Максим.',

    speed: 0.96,

    pitch: -0.02,

    stability: 0.88,

    similarityBoost: 0.84,

    style: 0.12,

    emotionalProfile:
      'Спокойный профессиональный эксперт.'
  },

  // =========================================
  // FEMALE VOICES
  // =========================================

  {
    localId: 'anna',

    displayName: 'Анна',

    provider: 'elevenlabs',

    // Ekaterina
    providerVoiceId: 'GN4wbsbejSnGSa1AzjH5',

    language: 'ru-RU',

    gender: 'female',

    archetype: 'calm_narrator',

    previewText:
      'Здравствуйте. Это Анна.',

    speed: 0.9,

    pitch: 0.05,

    stability: 0.84,

    similarityBoost: 0.76,

    style: 0.15,

    emotionalProfile:
      'Мягкий спокойный женский голос.'
  },

  {
    localId: 'nadia',

    displayName: 'Надежда',

    provider: 'elevenlabs',

    // Ariana energetic female
    providerVoiceId: 'xyu8HSCv1JYrhLx4m8UG',

    language: 'ru-RU',

    gender: 'female',

    archetype: 'energetic_creator',

    previewText:
      'Привет! С вами Надежда.',

    speed: 1.02,

    pitch: 0.08,

    stability: 0.7,

    similarityBoost: 0.83,

    style: 0.35,

    emotionalProfile:
      'Энергичная эмоциональная подача.'
  },

  {
    localId: 'marina',

    displayName: 'Марина',

    provider: 'elevenlabs',

    // Soft warm female
    providerVoiceId: 'X0jd19oPQ0cVJcbpmAuX',

    language: 'ru-RU',

    gender: 'female',

    archetype: 'conversational_coach',

    previewText:
      'Добро пожаловать. Я Марина.',

    speed: 0.94,

    pitch: 0.03,

    stability: 0.86,

    similarityBoost: 0.82,

    style: 0.14,

    emotionalProfile:
      'Тёплый разговорный коуч.'
  }
];

export const DEFAULT_VOICE_LOCAL_ID =
  'alexei';

export function getVoiceFromRegistry(
  localId: string
): RegistryVoice | undefined {

  return VOICE_REGISTRY.find(
    (voice) =>
      voice.localId === localId
  );
}