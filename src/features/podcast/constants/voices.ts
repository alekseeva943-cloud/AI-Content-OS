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
  // Hosts
  'pNInz6obpgdq5TaqLwtY': {
    id: 'pNInz6obpgdq5TaqLwtY',
    name: 'Adam',
    gender: 'male',
    tags: ['Business', 'Premium', 'Deep'],
    shortDesc: 'Интеллектуальный, глубокий и размеренный эксперт.',
    fallbackPitch: 0.8,
    fallbackRate: 0.92,
    previewText: 'Сегодня мы обсудим, как искусственный интеллект меняет ландшафт современного бизнеса. Проверим фундаментальные научные подходы.',
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
    shortDesc: 'Живой стиль диалога, утренний приветливый тембр.',
    fallbackPitch: 0.98,
    fallbackRate: 1.15,
    previewText: 'Слушайте, всем пламенный привет! Сегодня у нас невероятно драйвовая и живая тема. Давайте раскатаем всё по полочкам прямо сейчас!',
    settings: {
      stability: 0.32,
      similarity_boost: 0.72,
      style: 0.72,
      use_speaker_boost: true
    }
  },
  '21m00Tcm4TlvDq8ikWAM': {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    gender: 'female',
    tags: ['Conversational', 'Calm', 'Expert'],
    shortDesc: 'Мягкий, вовлеченный и доверительный женский голос.',
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
  // Guests
  'ErXwobaYiN019PkySvjV': {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    gender: 'male',
    tags: ['Storytelling', 'Deep', 'Cinema'],
    shortDesc: 'Харизматичный повествовательный голос с бархатными паузами.',
    fallbackPitch: 0.75,
    fallbackRate: 0.85,
    previewText: 'В этой потрясающей истории есть одна ключевая деталь... Именно она перевернет всё наше представление о возможностях человека.',
    settings: {
      stability: 0.28,
      similarity_boost: 0.75,
      style: 0.80,
      use_speaker_boost: true
    }
  },
  'AZnzlk1XvdvUeBnXmlld': {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    gender: 'female',
    tags: ['Expert', 'Restrained', 'Calm'],
    shortDesc: 'Аналитическая дикция, выдержанный сдержанный тон.',
    fallbackPitch: 0.95,
    fallbackRate: 0.98,
    previewText: 'Для корректного осмысления предложенного кейса обратимся к академическим исследованиям, эмпирическим данным и мировой статистике.',
    settings: {
      stability: 0.52,
      similarity_boost: 0.83,
      style: 0.40,
      use_speaker_boost: true
    }
  },
  'EXAVITQu4vr4xnSDxMaL': {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    gender: 'female',
    tags: ['Friendly', 'Open', 'Expressive'],
    shortDesc: 'Позитивный, эмоциональный, открытый к беседе тембр.',
    fallbackPitch: 1.2,
    fallbackRate: 1.12,
    previewText: 'О боже, это же просто невероятно интересно! Я так воодушевлена нашей сегодняшней встречей, давайте поскорее начнем дискуссию!',
    settings: {
      stability: 0.36,
      similarity_boost: 0.74,
      style: 0.88,
      use_speaker_boost: true
    }
  }
};

export const CENTRAL_VOICES = HUMAN_VOICE_LIBRARY;

export const HOST_VOICE_IDS = ['pNInz6obpgdq5TaqLwtY', 'TxGEqn7nUaNZTRmsh7M3', '21m00Tcm4TlvDq8ikWAM'];
export const GUEST_VOICE_IDS = ['ErXwobaYiN019PkySvjV', 'AZnzlk1XvdvUeBnXmlld', 'EXAVITQu4vr4xnSDxMaL'];
