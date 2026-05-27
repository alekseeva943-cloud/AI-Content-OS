// src/features/avatar/constants/voices.ts

export interface VoiceCadence {
  pauseFrequency: number;
  fillerInsertionChance: number;
  preferredFillers: string[];
  pitchShift: number;
  speechRateMultiplier: number;
  breaths: boolean;
}

export interface AppVoice {
  id: string;

  displayName: string;

  provider: 'elevenlabs' | 'heygen';

  language: string;

  gender: 'male' | 'female';

  role:
    | 'Host'
    | 'Narrator'
    | 'Energetic'
    | 'Calm'
    | 'Expert'
    | 'Teacher'
    | string;

  previewSupport: boolean;

  avatarCompatibility: string[];

  providerCompatibility: string[];

  mapping: {
    elevenlabsVoiceId: string;
    heygenVoiceId: string;
    previewVoiceId: string;
  };

  speakingStyle: string;

  emotionalProfile: string;

  previewText: string;

  cadence: VoiceCadence;
}

/**
 * IMPORTANT
 *
 * ONLY FREE / DEFAULT ELEVENLABS VOICES.
 *
 * No library voices.
 * No paid voices.
 * No premium voice marketplace IDs.
 *
 * Stable homework/demo configuration.
 */

export const APP_VOICES: AppVoice[] = [

  // =========================================================
  // MALE
  // =========================================================

  {
    id: 'alexei',

    displayName: 'Алексей',

    provider: 'elevenlabs',

    language: 'ru-RU',

    gender: 'male',

    role: 'Host',

    previewSupport: true,

    avatarCompatibility: ['all'],

    providerCompatibility: [
      'elevenlabs',
      'heygen'
    ],

    mapping: {

      // Adam
      elevenlabsVoiceId:
        'pNInz6obpgDQGcFmaJgB',

      heygenVoiceId:
        'ru-RU-DmitryNeural',

      previewVoiceId:
        'ru-RU'
    },

    speakingStyle:
      'Уверенный ведущий.',

    emotionalProfile:
      'Спокойный медиа-баритон.',

    previewText:
      'Здравствуйте. С вами Алексей. Сегодня мы посмотрим, как современные ИИ-аватары создают реалистичные видео.',

    cadence: {
      pauseFrequency: 0.45,

      fillerInsertionChance: 0.02,

      preferredFillers: [
        'Итак'
      ],

      pitchShift: 0.96,

      speechRateMultiplier: 1,

      breaths: false
    }
  },

  {
    id: 'dmitry',

    displayName: 'Дмитрий',

    provider: 'elevenlabs',

    language: 'ru-RU',

    gender: 'male',

    role: 'Narrator',

    previewSupport: true,

    avatarCompatibility: ['all'],

    providerCompatibility: [
      'elevenlabs',
      'heygen'
    ],

    mapping: {

      // Josh
      elevenlabsVoiceId:
        'TxGEqnHWrfWFTfGW9XjX',

      heygenVoiceId:
        'ru-RU-YaroslavNeural',

      previewVoiceId:
        'ru-RU'
    },

    speakingStyle:
      'Тёплый рассказчик.',

    emotionalProfile:
      'Спокойный и дружелюбный.',

    previewText:
      'Добро пожаловать. Меня зовут Дмитрий. Давайте вместе посмотрим возможности современной генерации контента.',

    cadence: {
      pauseFrequency: 0.55,

      fillerInsertionChance: 0.03,

      preferredFillers: [
        'Знаете'
      ],

      pitchShift: 1,

      speechRateMultiplier: 0.95,

      breaths: false
    }
  },

  {
    id: 'maxim',

    displayName: 'Максим',

    provider: 'elevenlabs',

    language: 'ru-RU',

    gender: 'male',

    role: 'Energetic',

    previewSupport: true,

    avatarCompatibility: ['all'],

    providerCompatibility: [
      'elevenlabs',
      'heygen'
    ],

    mapping: {

      // Arnold
      elevenlabsVoiceId:
        'VR6AewLTigWG4xSOukaG',

      heygenVoiceId:
        'ru-RU-DmitryNeural',

      previewVoiceId:
        'ru-RU'
    },

    speakingStyle:
      'Энергичный блогер.',

    emotionalProfile:
      'Быстрый и эмоциональный.',

    previewText:
      'Привет! Это Максим. Сейчас покажу, насколько быстро можно создавать AI-видео нового поколения.',

    cadence: {
      pauseFrequency: 0.3,

      fillerInsertionChance: 0.01,

      preferredFillers: [
        'Смотрите'
      ],

      pitchShift: 1.05,

      speechRateMultiplier: 1.08,

      breaths: false
    }
  },

  // =========================================================
  // FEMALE
  // =========================================================

  {
    id: 'anna',

    displayName: 'Анна',

    provider: 'elevenlabs',

    language: 'ru-RU',

    gender: 'female',

    role: 'Calm',

    previewSupport: true,

    avatarCompatibility: ['all'],

    providerCompatibility: [
      'elevenlabs',
      'heygen'
    ],

    mapping: {

      // Rachel
      elevenlabsVoiceId:
        '21m00Tcm4TlvDq8ikWAM',

      heygenVoiceId:
        'ru-RU-SvetlanaNeural',

      previewVoiceId:
        'ru-RU'
    },

    speakingStyle:
      'Мягкий спокойный голос.',

    emotionalProfile:
      'Тёплый расслабляющий тембр.',

    previewText:
      'Здравствуйте. Меня зовут Анна. Давайте спокойно разберём современные AI-инструменты.',

    cadence: {
      pauseFrequency: 0.7,

      fillerInsertionChance: 0.02,

      preferredFillers: [
        'Пожалуйста'
      ],

      pitchShift: 1.04,

      speechRateMultiplier: 0.92,

      breaths: false
    }
  },

  {
    id: 'viktoria',

    displayName: 'Виктория',

    provider: 'elevenlabs',

    language: 'ru-RU',

    gender: 'female',

    role: 'Expert',

    previewSupport: true,

    avatarCompatibility: ['all'],

    providerCompatibility: [
      'elevenlabs',
      'heygen'
    ],

    mapping: {

      // Bella
      elevenlabsVoiceId:
        'EXAVITQu4vr4xnSDXMaL',

      heygenVoiceId:
        'ru-RU-DariyaNeural',

      previewVoiceId:
        'ru-RU'
    },

    speakingStyle:
      'Структурированный эксперт.',

    emotionalProfile:
      'Уверенный деловой тон.',

    previewText:
      'Здравствуйте. Я Виктория. Представляю обзор возможностей искусственного интеллекта в современном производстве.',

    cadence: {
      pauseFrequency: 0.45,

      fillerInsertionChance: 0,

      preferredFillers: [],

      pitchShift: 1,

      speechRateMultiplier: 1,

      breaths: false
    }
  },

  {
    id: 'ekaterina',

    displayName: 'Екатерина',

    provider: 'elevenlabs',

    language: 'ru-RU',

    gender: 'female',

    role: 'Teacher',

    previewSupport: true,

    avatarCompatibility: ['all'],

    providerCompatibility: [
      'elevenlabs',
      'heygen'
    ],

    mapping: {

      // Elli
      elevenlabsVoiceId:
        'MF3mGyEYCl7XYWbV9V6O',

      heygenVoiceId:
        'ru-RU-SvetlanaNeural',

      previewVoiceId:
        'ru-RU'
    },

    speakingStyle:
      'Позитивный преподаватель.',

    emotionalProfile:
      'Дружелюбный объясняющий тон.',

    previewText:
      'Добрый день. Я Екатерина. Сегодня мы изучим основы генерации AI-аватаров и синтеза речи.',

    cadence: {
      pauseFrequency: 0.55,

      fillerInsertionChance: 0.03,

      preferredFillers: [
        'Итак'
      ],

      pitchShift: 1.02,

      speechRateMultiplier: 0.96,

      breaths: false
    }
  }
];

/**
 * Lookup helper.
 */
export function getVoiceById(
  voiceIdOrInternalId: string
): AppVoice | undefined {

  const cleanId =
    voiceIdOrInternalId.trim();

  let match =
    APP_VOICES.find(
      (v) =>
        v.id.toLowerCase() ===
        cleanId.toLowerCase()
    );

  if (match) {
    return match;
  }

  match =
    APP_VOICES.find(
      (v) =>
        v.mapping
          .elevenlabsVoiceId ===
        cleanId
    );

  if (match) {
    return match;
  }

  match =
    APP_VOICES.find(
      (v) =>
        v.mapping
          .heygenVoiceId ===
        cleanId
    );

  if (match) {
    return match;
  }

  match =
    APP_VOICES.find(
      (v) =>
        v.displayName.toLowerCase() ===
        cleanId.toLowerCase()
    );

  return match;
}

/**
 * Stable fallback.
 */
export const DEFAULT_FALLBACK_VOICE =
  APP_VOICES[0];