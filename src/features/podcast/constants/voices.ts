export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
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
}

export const HUMAN_VOICE_LIBRARY: Record<string, VoiceInfo> = {
  // ==========================================
  // HOSTS (6 Voices: 3 Male, 3 Female)
  // ==========================================
  'pNInz6obpgdq5TaqLwtY': {
    id: 'pNInz6obpgdq5TaqLwtY',
    name: 'Adam',
    gender: 'male',
    tags: ['Business', 'Premium', 'Deep'],
    shortDesc: 'Интеллектуальный, глубокий и размеренный эксперт.',
    fallbackPitch: 0.8,
    fallbackRate: 0.92,
    previewText: 'Сегодня мы спокойно обсудим, как искусственный интеллект реально перестраивает ландшафт современного бизнеса. Без лишнего хайпа, разберем фундаментальные подходы…',
    settings: {
      stability: 0.45,
      similarity_boost: 0.78,
      style: 0.55,
      use_speaker_boost: true
    }
  },
  'TxGEqn7nUaNZTRmsh7M3': {
    id: 'TxGEqn7nUaNZTRmsh7M3',
    name: 'Josh',
    gender: 'male',
    tags: ['Calm', 'Friendly', 'Energetic'],
    shortDesc: 'Энергичный, быстрый и яркий подростковый/утренний драйв.',
    fallbackPitch: 0.98,
    fallbackRate: 1.15,
    previewText: 'О боже, всем пламенный привет! Сегодня у нас нереально космическая и живая тема! Мы просто раскатаем этот вопрос по полочкам прямо сейчас, погнали!',
    settings: {
      stability: 0.32,
      similarity_boost: 0.72,
      style: 0.72,
      use_speaker_boost: true
    }
  },
  'onwK4e9ZLuTAKqWW03F9': {
    id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel',
    gender: 'male',
    tags: ['Cinematic', 'Deep', 'Baritone'],
    shortDesc: 'Глубокий бархатный кинематографичный баритон.',
    fallbackPitch: 0.70,
    fallbackRate: 0.82,
    previewText: 'Давайте вглядимся глубже. В этой тишине кроется нечто большее... Самое интересное кроется в деталях малых элементов новой механики...',
    settings: {
      stability: 0.35,
      similarity_boost: 0.85,
      style: 0.45,
      use_speaker_boost: true
    }
  },
  '21m00Tcm4TlvDq8ikWAM': {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    gender: 'female',
    tags: ['Conversational', 'Warm', 'Soft'],
    shortDesc: 'Мягкий, вовлеченный и доверительный женский тембр.',
    fallbackPitch: 1.1,
    fallbackRate: 1.05,
    previewText: 'Рада вас слышать. Мне кажется, самые интересные открытия совершаются именно тогда, когда мы готовы слушать голос разума и сердца.',
    settings: {
      stability: 0.40,
      similarity_boost: 0.82,
      style: 0.65,
      use_speaker_boost: true
    }
  },
  'EXAVITQu4vr4xnSDxMaL': {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    gender: 'female',
    tags: ['Friendly', 'Open', 'Expressive'],
    shortDesc: 'Позитивный, эмоциональный, открытый к беседе тембр.',
    fallbackPitch: 1.15,
    fallbackRate: 1.12,
    previewText: 'Слушайте, это же просто потрясающе! Я так вдохновлена нашей сегодняшней беседой, давайте прямо сейчас поглубже нырнем в детали!',
    settings: {
      stability: 0.36,
      similarity_boost: 0.74,
      style: 0.88,
      use_speaker_boost: true
    }
  },
  'MF3m7JQbZ6gM6O8f0pBO': {
    id: 'MF3m7JQbZ6gM6O8f0pBO',
    name: 'Elli',
    gender: 'female',
    tags: ['Premium', 'Confident', 'Media'],
    shortDesc: 'Уверенный и сильный премиальный женский голос.',
    fallbackPitch: 1.00,
    fallbackRate: 1.00,
    previewText: 'Сегодня мы проведем профессиональный аудит эффективности технологических трендов. Посмотрим на реальные коммерческие цифры и факты.',
    settings: {
      stability: 0.48,
      similarity_boost: 0.80,
      style: 0.50,
      use_speaker_boost: true
    }
  },

  // ==========================================
  // GUEST VOICES (6 Voices: 3 Male, 3 Female)
  // ==========================================
  'ErXwobaYiN019PkySvjV': {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    gender: 'male',
    tags: ['Storytelling', 'Deep', 'Expressive'],
    shortDesc: 'Харизматичный повествовательный голос с бархатными паузами.',
    fallbackPitch: 0.78,
    fallbackRate: 0.88,
    previewText: 'В этой поразительной истории есть одна особенная деталь... Именно она переворачивает наше представление о технологическом прогрессе.',
    settings: {
      stability: 0.28,
      similarity_boost: 0.75,
      style: 0.80,
      use_speaker_boost: true
    }
  },
  'VR6A4Yg7msuSfOIyxS9n': {
    id: 'VR6A4Yg7msuSfOIyxS9n',
    name: 'Arnold',
    gender: 'male',
    tags: ['Strong', 'Expert', 'Direct'],
    shortDesc: 'Твердый, мощный и прагматичный голос эксперта.',
    fallbackPitch: 0.82,
    fallbackRate: 0.95,
    previewText: 'Давай смотреть фактам в лицо. Цифры никогда не врут, и если мы продолжим масштабировать старую базу данных, система просто рухнет.',
    settings: {
      stability: 0.50,
      similarity_boost: 0.80,
      style: 0.45,
      use_speaker_boost: true
    }
  },
  'yoZ06aPfZBIalHBgC3vY': {
    id: 'yoZ06aPfZBIalHBgC3vY',
    name: 'Sam',
    gender: 'male',
    tags: ['Friendly', 'Analytical', 'Modern'],
    shortDesc: 'Дружелюбный, технический и вдумчивый аналитик.',
    fallbackPitch: 0.90,
    fallbackRate: 1.02,
    previewText: 'Тут важно понимать, как устроен микросервис изнутри. На самом деле, решение лежит прямо на стыке кэширования и быстрых вызовов...',
    settings: {
      stability: 0.42,
      similarity_boost: 0.74,
      style: 0.52,
      use_speaker_boost: true
    }
  },
  'AZnzlk1XvdvUeBnXmlld': {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    gender: 'female',
    tags: ['Expert', 'Restrained', 'Calm'],
    shortDesc: 'Академическая дикция, выдержанный сдержанный тон.',
    fallbackPitch: 0.95,
    fallbackRate: 0.95,
    previewText: 'Для корректного осмысления предложенной парадигмы обратимся к академическим исследованиям, эмпирическим данным и мировой статистике.',
    settings: {
      stability: 0.52,
      similarity_boost: 0.83,
      style: 0.40,
      use_speaker_boost: true
    }
  },
  'oWAO1QbY6v9no9S868NZ': {
    id: 'oWAO1QbY6v9no9S868NZ',
    name: 'Grace',
    gender: 'female',
    tags: ['Emotional', 'Warm', 'Bright'],
    shortDesc: 'Заботливый, мягкий и невероятно эмоциональный голос.',
    fallbackPitch: 1.10,
    fallbackRate: 1.05,
    previewText: 'Ой, как здорово! Вы затронули невероятно важную струну в моей душе. Это действительно вызывает отклик у миллионов простых пользователей.',
    settings: {
      stability: 0.36,
      similarity_boost: 0.72,
      style: 0.85,
      use_speaker_boost: true
    }
  },
  'piTKgcLEGmPEeBI4tUfc': {
    id: 'piTKgcLEGmPEeBI4tUfc',
    name: 'Nicole',
    gender: 'female',
    tags: ['Dynamic', 'Media', 'Bright'],
    shortDesc: 'Живой, динамичный и напористый медийный тембр.',
    fallbackPitch: 1.05,
    fallbackRate: 1.10,
    previewText: 'Определенно! Сфера медиа трещит по швам от натиска нейросеток, но я абсолютно уверена: человеческое внимание по-прежнему останется главной валютой!',
    settings: {
      stability: 0.40,
      similarity_boost: 0.76,
      style: 0.70,
      use_speaker_boost: true
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
