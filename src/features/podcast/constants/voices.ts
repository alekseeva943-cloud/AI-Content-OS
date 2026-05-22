export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface VoiceProfile {
  pitch: number;
  rate: number;
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
  energy_curve: 'dynamic' | 'flat' | 'heavy' | 'light' | 'expressive' | 'subtle';
  punctuation_behavior: 'natural' | 'dramatic' | 'snappy' | 'soft';
  pause_density: 'sparse' | 'medium' | 'dense';
  emotionality: number;
  cadence: 'steady' | 'rapid' | 'melodious' | 'deep' | 'conversational';
  modelId: string;
}

export interface VoiceInfo {
  id: string;
  name: string;
  gender: 'male' | 'female';
  tags: string[];
  shortDesc: string;
  fallbackPitch: number;
  fallbackRate: number;
  previewText: string;
  settings: VoiceSettings;
  voiceProfile: VoiceProfile;
}

export const HUMAN_VOICE_LIBRARY: Record<string, VoiceInfo> = {
  // ==========================================
  // HOSTS (6 Voices: 3 Male, 3 Female)
  // ==========================================
  'pNInz6obpgdq5TaqLwtY': {
    id: 'pNInz6obpgdq5TaqLwtY',
    name: 'Adam',
    gender: 'male',
    tags: ['Mature Deep Expert', 'Premium', 'Deep'],
    shortDesc: 'Интеллектуальный, глубокий эксперт с низким тембром.',
    fallbackPitch: 0.85,
    fallbackRate: 0.90,
    previewText: 'Сегодня мы спокойно обсудим, как искусственный интеллект реально перестраивает ландшафт современного бизнеса. Без лишнего хайпа, разберем фундаментальные подходы…',
    settings: {
      stability: 0.55,
      similarity_boost: 0.82,
      style: 0.40,
      use_speaker_boost: true
    },
    voiceProfile: {
      pitch: 0.85,
      rate: 0.90,
      stability: 55,
      similarity_boost: 82,
      style: 40,
      use_speaker_boost: true,
      energy_curve: 'heavy',
      punctuation_behavior: 'natural',
      pause_density: 'dense',
      emotionality: 35,
      cadence: 'deep',
      modelId: 'eleven_multilingual_v2'
    }
  },
  'TxGEqn7nUaNZTRmsh7M3': {
    id: 'TxGEqn7nUaNZTRmsh7M3',
    name: 'Josh',
    gender: 'male',
    tags: ['Energetic Startup Host', 'Friendly', 'Modern'],
    shortDesc: 'Энергичный, быстрый и яркий утренний драйв.',
    fallbackPitch: 1.0,
    fallbackRate: 1.15,
    previewText: 'Всем огромный привет! Сегодня у нас нереально космическая и живая тема! Мы просто раскатаем этот вопрос по полочкам прямо сейчас, погнали!',
    settings: {
      stability: 0.35,
      similarity_boost: 0.70,
      style: 0.75,
      use_speaker_boost: true
    },
    voiceProfile: {
      pitch: 1.0,
      rate: 1.15,
      stability: 35,
      similarity_boost: 70,
      style: 75,
      use_speaker_boost: true,
      energy_curve: 'expressive',
      punctuation_behavior: 'snappy',
      pause_density: 'sparse',
      emotionality: 82,
      cadence: 'rapid',
      modelId: 'eleven_turbo_v2_5'
    }
  },
  'onwK4e9ZLuTAKqWW03F9': {
    id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel',
    gender: 'male',
    tags: ['Calm Documentary Narrator', 'Deep', 'Baritone'],
    shortDesc: 'Глубокий бархатный кинематографичный баритон рассказчика.',
    fallbackPitch: 0.75,
    fallbackRate: 0.85,
    previewText: 'Давайте вглядимся глубже. В этой тишине кроется нечто большее... Самое интересное кроется в деталях малых элементов новой механики...',
    settings: {
      stability: 0.65,
      similarity_boost: 0.85,
      style: 0.30,
      use_speaker_boost: true
    },
    voiceProfile: {
      pitch: 0.75,
      rate: 0.85,
      stability: 65,
      similarity_boost: 85,
      style: 30,
      use_speaker_boost: true,
      energy_curve: 'flat',
      punctuation_behavior: 'dramatic',
      pause_density: 'dense',
      emotionality: 25,
      cadence: 'steady',
      modelId: 'eleven_multilingual_v2'
    }
  },
  '21m00Tcm4TlvDq8ikWAM': {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    gender: 'female',
    tags: ['Warm Female Interviewer', 'Warm', 'Soft'],
    shortDesc: 'Мягкий, вовлеченный и доверительный женский интервьюер.',
    fallbackPitch: 1.05,
    fallbackRate: 0.98,
    previewText: 'Рада вас слышать. Мне кажется, самые интересные открытия совершаются именно тогда, когда мы готовы слушать голос разума и сердца.',
    settings: {
      stability: 0.45,
      similarity_boost: 0.80,
      style: 0.55,
      use_speaker_boost: true
    },
    voiceProfile: {
      pitch: 1.05,
      rate: 0.98,
      stability: 45,
      similarity_boost: 80,
      style: 55,
      use_speaker_boost: true,
      energy_curve: 'light',
      punctuation_behavior: 'soft',
      pause_density: 'medium',
      emotionality: 60,
      cadence: 'melodious',
      modelId: 'eleven_multilingual_v2'
    }
  },
  'EXAVITQu4vr4xnSDxMaL': {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    gender: 'female',
    tags: ['Emotional Media Presenter', 'Open', 'Expressive'],
    shortDesc: 'Позитивный, эмоциональный, открытый медийный тембр.',
    fallbackPitch: 1.15,
    fallbackRate: 1.10,
    previewText: 'Слушайте, это же просто потрясающе! Я так вдохновлена нашей сегодняшней беседой, давайте прямо сейчас поглубже нырнем в детали!',
    settings: {
      stability: 0.32,
      similarity_boost: 0.72,
      style: 0.85,
      use_speaker_boost: true
    },
    voiceProfile: {
      pitch: 1.15,
      rate: 1.10,
      stability: 32,
      similarity_boost: 72,
      style: 85,
      use_speaker_boost: true,
      energy_curve: 'expressive',
      punctuation_behavior: 'snappy',
      pause_density: 'sparse',
      emotionality: 88,
      cadence: 'conversational',
      modelId: 'eleven_turbo_v2_5'
    }
  },
  'MF3m7JQbZ6gM6O8f0pBO': {
    id: 'MF3m7JQbZ6gM6O8f0pBO',
    name: 'Elli',
    gender: 'female',
    tags: ['Premium Luxury Podcast Voice', 'Confident', 'Media'],
    shortDesc: 'Уверенный, шелковистый премиальный женский голос.',
    fallbackPitch: 0.95,
    fallbackRate: 0.92,
    previewText: 'Сегодня мы проведим профессиональный аудит эффективности технологических трендов. Посмотрим на реальные коммерческие цифры и факты.',
    settings: {
      stability: 0.60,
      similarity_boost: 0.85,
      style: 0.45,
      use_speaker_boost: true
    },
    voiceProfile: {
      pitch: 0.95,
      rate: 0.92,
      stability: 60,
      similarity_boost: 85,
      style: 45,
      use_speaker_boost: true,
      energy_curve: 'subtle',
      punctuation_behavior: 'soft',
      pause_density: 'medium',
      emotionality: 40,
      cadence: 'steady',
      modelId: 'eleven_multilingual_v2'
    }
  },

  // ==========================================
  // GUEST VOICES (6 Voices: 3 Male, 3 Female)
  // ==========================================
  'ErXwobaYiN019PkySvjV': {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    gender: 'male',
    tags: ['Analytical Professor', 'Deep', 'Expressive'],
    shortDesc: 'Вдумчивый профессор, харизматичный голос науки с паузами.',
    fallbackPitch: 0.82,
    fallbackRate: 0.94,
    previewText: 'В этой поразительной теории есть одна особенная деталь... Именно она переворачивает наше представление о технологическом прогрессе.',
    settings: {
      stability: 0.48,
      similarity_boost: 0.78,
      style: 0.42,
      use_speaker_boost: true
    },
    voiceProfile: {
      pitch: 0.82,
      rate: 0.94,
      stability: 48,
      similarity_boost: 78,
      style: 42,
      use_speaker_boost: true,
      energy_curve: 'heavy',
      punctuation_behavior: 'natural',
      pause_density: 'dense',
      emotionality: 42,
      cadence: 'deep',
      modelId: 'eleven_turbo_v2_5'
    }
  },
  'VR6A4Yg7msuSfOIyxS9n': {
    id: 'VR6A4Yg7msuSfOIyxS9n',
    name: 'Arnold',
    gender: 'male',
    tags: ['Confident CEO', 'Expert', 'Direct'],
    shortDesc: 'Твердый, прагматичный, лидерский голос руководителя.',
    fallbackPitch: 0.90,
    fallbackRate: 1.02,
    previewText: 'Давай смотреть фактам в лицо. Цифры никогда не врут, и если мы продолжим масштабировать старую базу данных, система просто рухнет.',
    settings: {
      stability: 0.50,
      similarity_boost: 0.80,
      style: 0.45,
      use_speaker_boost: true
    },
    voiceProfile: {
      pitch: 0.90,
      rate: 1.02,
      stability: 50,
      similarity_boost: 80,
      style: 45,
      use_speaker_boost: true,
      energy_curve: 'flat',
      punctuation_behavior: 'snappy',
      pause_density: 'sparse',
      emotionality: 48,
      cadence: 'steady',
      modelId: 'eleven_multilingual_v2'
    }
  },
  'yoZ06aPfZBIalHBgC3vY': {
    id: 'yoZ06aPfZBIalHBgC3vY',
    name: 'Sam',
    gender: 'male',
    tags: ['Friendly Engineer', 'Analytical', 'Modern'],
    shortDesc: 'Дружелюбный, технический и живой ИТ-специалист.',
    fallbackPitch: 0.95,
    fallbackRate: 1.05,
    previewText: 'Тут важно понимать, как устроен микросервис изнутри. На самом деле, решение лежит прямо на стыке кэширования и быстрых вызовов...',
    settings: {
      stability: 0.40,
      similarity_boost: 0.74,
      style: 0.50,
      use_speaker_boost: true
    },
    voiceProfile: {
      pitch: 0.95,
      rate: 1.05,
      stability: 40,
      similarity_boost: 74,
      style: 50,
      use_speaker_boost: true,
      energy_curve: 'light',
      punctuation_behavior: 'natural',
      pause_density: 'medium',
      emotionality: 55,
      cadence: 'conversational',
      modelId: 'eleven_turbo_v2_5'
    }
  },
  'AZnzlk1XvdvUeBnXmlld': {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    gender: 'female',
    tags: ['Calm Female Scientist', 'Restrained', 'Calm'],
    shortDesc: 'Академическая дикция, выдержанный сдержанный тон ученого.',
    fallbackPitch: 0.92,
    fallbackRate: 0.90,
    previewText: 'Для корректного осмысления предложенной парадигмы обратимся к академическим исследованиям, эмпирическим данным и мировой статистике.',
    settings: {
      stability: 0.62,
      similarity_boost: 0.84,
      style: 0.35,
      use_speaker_boost: true
    },
    voiceProfile: {
      pitch: 0.92,
      rate: 0.90,
      stability: 62,
      similarity_boost: 84,
      style: 35,
      use_speaker_boost: true,
      energy_curve: 'flat',
      punctuation_behavior: 'natural',
      pause_density: 'dense',
      emotionality: 30,
      cadence: 'steady',
      modelId: 'eleven_multilingual_v2'
    }
  },
  'oWAO1QbY6v9no9S868NZ': {
    id: 'oWAO1QbY6v9no9S868NZ',
    name: 'Grace',
    gender: 'female',
    tags: ['Emotional Storyteller', 'Warm', 'Bright'],
    shortDesc: 'Заботливый, мягкий и невероятно чувственный словесный рассказ.',
    fallbackPitch: 1.10,
    fallbackRate: 1.05,
    previewText: 'Ой, как здорово! Вы затронули невероятно важную струну в моей душе. Это действительно вызывает отклик у миллионов простых людей.',
    settings: {
      stability: 0.30,
      similarity_boost: 0.68,
      style: 0.88,
      use_speaker_boost: true
    },
    voiceProfile: {
      pitch: 1.10,
      rate: 1.05,
      stability: 30,
      similarity_boost: 68,
      style: 88,
      use_speaker_boost: true,
      energy_curve: 'expressive',
      punctuation_behavior: 'dramatic',
      pause_density: 'medium',
      emotionality: 90,
      cadence: 'melodious',
      modelId: 'eleven_turbo_v2_5'
    }
  },
  'piTKgcLEGmPEeBI4tUfc': {
    id: 'piTKgcLEGmPEeBI4tUfc',
    name: 'Nicole',
    gender: 'female',
    tags: ['Young Media Personality', 'Media', 'Bright'],
    shortDesc: 'Молодежный, динамичный и напористый медийный трендсеттер.',
    fallbackPitch: 1.08,
    fallbackRate: 1.12,
    previewText: 'Определенно! Сфера медиа трещит по швам от натиска нейросеток, но я абсолютно уверена: человеческое внимание по-прежнему останется главной валютой!',
    settings: {
      stability: 0.38,
      similarity_boost: 0.72,
      style: 0.70,
      use_speaker_boost: true
    },
    voiceProfile: {
      pitch: 1.08,
      rate: 1.12,
      stability: 38,
      similarity_boost: 72,
      style: 70,
      use_speaker_boost: true,
      energy_curve: 'light',
      punctuation_behavior: 'snappy',
      pause_density: 'sparse',
      emotionality: 75,
      cadence: 'conversational',
      modelId: 'eleven_multilingual_v2'
    }
  }
};

export const CENTRAL_VOICES = HUMAN_VOICE_LIBRARY;

export const HOST_VOICE_IDS = [
  'pNInz6obpgdq5TaqLwtY', // Adam (Male)
  'TxGEqn7nUaNZTRmsh7M3', // Josh (Male)
  'onwK4e9ZLuTAKqWW03F9', // Daniel (Male)
  '21m00Tcm4TlvDq8ikWAM', // Rachel (Female)
  'EXAVITQu4vr4xnSDxMaL', // Bella (Female)
  'MF3m7JQbZ6gM6O8f0pBO'  // Elli (Female)
];

export const GUEST_VOICE_IDS = [
  'ErXwobaYiN019PkySvjV', // Antoni (Male)
  'VR6A4Yg7msuSfOIyxS9n', // Arnold (Male)
  'yoZ06aPfZBIalHBgC3vY', // Sam (Male)
  'AZnzlk1XvdvUeBnXmlld', // Domi (Female)
  'oWAO1QbY6v9no9S868NZ', // Grace (Female)
  'piTKgcLEGmPEeBI4tUfc'  // Nicole (Female)
];
