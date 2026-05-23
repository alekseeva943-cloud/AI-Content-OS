export interface VoiceCadence {
  pauseFrequency: number; // Frequency of pausing: 0 (none) to 1 (high)
  fillerInsertionChance: number; // Chance to inject fillers
  preferredFillers: string[];
  pitchShift: number; // Speech synthesis pitch adjust
  speechRateMultiplier: number; // Speed rate
  breaths: boolean; // Add sighing or micro-breaths
}

export interface AppVoice {
  id: string; // internal identifier (e.g. alexei, dmitry)
  displayName: string;
  provider: 'elevenlabs' | 'heygen';
  language: string;
  gender: 'male' | 'female';
  role: 'Host' | 'Narrator' | 'Energetic' | 'Calm' | 'Expert' | 'Teacher' | string;
  previewSupport: boolean;
  avatarCompatibility: string[]; // ['all'] or list of compatible avatar IDs
  providerCompatibility: string[]; // ['elevenlabs', 'heygen']

  // Central mapping layer (Requirement 2)
  mapping: {
    elevenlabsVoiceId: string;
    heygenVoiceId: string;
    previewVoiceId: string;
  };

  speakingStyle: string;
  emotionalProfile: string;
  previewText: string;

  // Custom Humanization V3 Cadence Config (Requirement 4 & 9)
  cadence: VoiceCadence;
}

export const APP_VOICES: AppVoice[] = [
  {
    id: 'alexei',
    displayName: 'Алексей',
    provider: 'elevenlabs',
    language: 'ru-RU',
    gender: 'male',
    role: 'Host',
    previewSupport: true,
    avatarCompatibility: ['all'],
    providerCompatibility: ['elevenlabs', 'heygen'],
    mapping: {
      elevenlabsVoiceId: 'pqH6THCHvgSzSg3749S8',
      heygenVoiceId: 'ru-RU-DmitryNeural', // Fully valid, responsive HeyGen ID
      previewVoiceId: 'ru-RU'
    },
    speakingStyle: 'Глубокий бизнес-баритон, уверенный YouTube-ведущий',
    emotionalProfile: 'Интеллектуальный, авторитетный тембр с четким разделением мыслей',
    previewText: 'Приветствую! Мы разрабатываем новую веху в производстве видео со сверхреалистичными ИИ-аватарами. Мой голос идеально подходит для важных анонсов.',
    cadence: {
      pauseFrequency: 0.65,
      fillerInsertionChance: 0.05,
      preferredFillers: ['Итак', 'Знаете', 'Собственно'],
      pitchShift: 0.92, // deeeper
      speechRateMultiplier: 0.95, // deliberate pacing
      breaths: true
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
    providerCompatibility: ['elevenlabs', 'heygen'],
    mapping: {
      elevenlabsVoiceId: 'IKne3meq5aC27shg036e',
      heygenVoiceId: 'ru-RU-YaroslavNeural', // Fully valid, responsive HeyGen ID
      previewVoiceId: 'ru-RU'
    },
    speakingStyle: 'Бархатистый, теплый подкастер, интервьюер',
    emotionalProfile: 'Уютный, спокойный разговорный тон; высокая степень доверия и рефлексии',
    previewText: 'Рад услышать вас. Это Дмитрий. Медленные вдохи, вдумчивые акценты на словах делают наш подкаст по-настоящему кинематографичным.',
    cadence: {
      pauseFrequency: 0.85, // peaceful narrator mode
      fillerInsertionChance: 0.12, // conversational fillers
      preferredFillers: ['Видите ли', 'В целом', 'Конечно'],
      pitchShift: 1.0,
      speechRateMultiplier: 0.88, // calm storyteller rate
      breaths: true
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
    providerCompatibility: ['elevenlabs', 'heygen'],
    mapping: {
      elevenlabsVoiceId: 'g5CIjv2V06O0Bdf0xW6K', // Elevenlabs ID (fails if directly in Heygen raw)
      heygenVoiceId: 'ru-RU-DmitryNeural', // Valid HeyGen substitute prevents crash
      previewVoiceId: 'ru-RU'
    },
    speakingStyle: 'Динамичный ИТ-блогер, энергичный лектор презентаций',
    emotionalProfile: 'Бодрый, напористый, быстрый и технологичный молодежный ритм',
    previewText: 'Эй, салют! С вами Максим. Время бежит вперед, и мы вывели ИИ-генерацию на абсолютно безумную скорость! Включайтесь в процесс прямо сейчас.',
    cadence: {
      pauseFrequency: 0.4, // sparse pauses for high excitement speed
      fillerInsertionChance: 0.08,
      preferredFillers: ['Смотрите', 'Кстати', 'Давайте честно'],
      pitchShift: 1.12, // energetic young vibe
      speechRateMultiplier: 1.15, // fast pacing
      breaths: false
    }
  },
  {
    id: 'anna',
    displayName: 'Анна',
    provider: 'elevenlabs',
    language: 'ru-RU',
    gender: 'female',
    role: 'Calm',
    previewSupport: true,
    avatarCompatibility: ['all'],
    providerCompatibility: ['elevenlabs', 'heygen'],
    mapping: {
      elevenlabsVoiceId: 'EXAVITQu4vr4xnSDXMaL',
      heygenVoiceId: 'ru-RU-SvetlanaNeural',
      previewVoiceId: 'ru-RU'
    },
    speakingStyle: 'Мягкий, эмпатичный бьюти-влогер и медитативный гид',
    emotionalProfile: 'Светлые интонации, расслабляющий убаюкивающий тембр с улыбкой в голосе',
    previewText: 'Привет, мои дорогие! Это Аня. Давайте сделаем глубокий вдох... И наполним этот день гармонией и спокойствием. Наша речь должна течь плавно.',
    cadence: {
      pauseFrequency: 0.9,
      fillerInsertionChance: 0.03,
      preferredFillers: ['Пожалуйста', 'Вот так', 'Знаете'],
      pitchShift: 1.05,
      speechRateMultiplier: 0.82, // ultra slow breathing space
      breaths: true
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
    providerCompatibility: ['elevenlabs', 'heygen'],
    mapping: {
      elevenlabsVoiceId: 'ErXwobaYiN019PkySvjV',
      heygenVoiceId: 'ru-RU-DariyaNeural',
      previewVoiceId: 'ru-RU'
    },
    speakingStyle: 'Бизнес-консультант, строгая ведущая корпоративных новостей',
    emotionalProfile: 'Артикулированная, структурная речь, уверенный командный тон',
    previewText: 'Здравствуйте. Я Виктория. Представляю аналитический обзор рынка за второй квартал. Требуется соблюдение жесткой хронологии и чистоты изложения.',
    cadence: {
      pauseFrequency: 0.5,
      fillerInsertionChance: 0.01, // No fillers for professional expert style
      preferredFillers: [],
      pitchShift: 0.96, // corporate low tone
      speechRateMultiplier: 1.02, // corporate pace
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
    providerCompatibility: ['elevenlabs', 'heygen'],
    mapping: {
      elevenlabsVoiceId: 'LcfcDJNPlY75OxArInZp',
      heygenVoiceId: 'ru-RU-SvetlanaNeural',
      previewVoiceId: 'ru-RU'
    },
    speakingStyle: 'Понятный, вдохновляющий учитель онлайн-курсов',
    emotionalProfile: 'Приветливый, открытый тон, акцентирующий дидактические переходы',
    previewText: 'Добрый день! Я Екатерина. Давайте вместе изучим основы машинного обучения. Это намного проще, чем кажется на первый взгляд!',
    cadence: {
      pauseFrequency: 0.7,
      fillerInsertionChance: 0.06,
      preferredFillers: ['Смотрите', 'Итак', 'Посудите сами'],
      pitchShift: 1.0,
      speechRateMultiplier: 0.93,
      breaths: true
    }
  }
];

// Helper to look up a voice by ID (handles internal id OR ElevenLabs voice_id strings)
export function getVoiceById(voiceIdOrInternalId: string): AppVoice | undefined {
  const cleanId = voiceIdOrInternalId.trim();
  // Try exact lookup on internal ID first
  let match = APP_VOICES.find(v => v.id.toLowerCase() === cleanId.toLowerCase());
  if (match) return match;

  // Try finding by elevenlabs ID
  match = APP_VOICES.find(v => v.mapping.elevenlabsVoiceId === cleanId);
  if (match) return match;

  // Try finding by heygen voice ID
  match = APP_VOICES.find(v => v.mapping.heygenVoiceId === cleanId);
  if (match) return match;

  // Try finding by name
  match = APP_VOICES.find(v => v.displayName.toLowerCase() === cleanId.toLowerCase());
  return match;
}

// Fallback Voice Source of Truth (Requirement 7)
export const DEFAULT_FALLBACK_VOICE = APP_VOICES[0]; // Alexei / DmitryNeural
