export interface VoiceInfo {
  id: string;
  name: string;
  gender: 'male' | 'female';
  tags: string[];
  shortDesc: string;
  fallbackPitch: number;
  fallbackRate: number;
}

export const CENTRAL_VOICES: Record<string, VoiceInfo> = {
  // Hosts
  'pNInz6obpgdq5TaqLwtY': {
    id: 'pNInz6obpgdq5TaqLwtY',
    name: 'Adam',
    gender: 'male',
    tags: ['Business', 'Premium', 'Deep'],
    shortDesc: 'Размеренная, стабильная академическая подача.',
    fallbackPitch: 0.8,
    fallbackRate: 0.92
  },
  'TxGEqn7nUaNZTRmsh7M3': {
    id: 'TxGEqn7nUaNZTRmsh7M3',
    name: 'Josh',
    gender: 'male',
    tags: ['Calm', 'Friendly', 'Energetic'],
    shortDesc: 'Живой стиль диалога, утренний приветливый тембр.',
    fallbackPitch: 0.98,
    fallbackRate: 1.15
  },
  '21m00Tcm4TlvDq8ikWAM': {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    gender: 'female',
    tags: ['Conversational', 'Calm', 'Expert'],
    shortDesc: 'Мягкий, вовлеченный и доверительный женский голос.',
    fallbackPitch: 1.1,
    fallbackRate: 1.05
  },
  // Guests
  'ErXwobaYiN019PkySvjV': {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    gender: 'male',
    tags: ['Storytelling', 'Deep', 'Cinema'],
    shortDesc: 'Харизматичный повествовательный голос с бархатными паузами.',
    fallbackPitch: 0.75,
    fallbackRate: 0.85
  },
  'AZnzlk1XvdvUeBnXmlld': {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    gender: 'female',
    tags: ['Expert', 'Restrained', 'Calm'],
    shortDesc: 'Аналитическая дикция, выдержанный сдержанный тон.',
    fallbackPitch: 0.95,
    fallbackRate: 0.98
  },
  'EXAVITQu4vr4xnSDxMaL': {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    gender: 'female',
    tags: ['Friendly', 'Open', 'Expressive'],
    shortDesc: 'Позитивный, эмоциональный, открытый к беседе тембр.',
    fallbackPitch: 1.2,
    fallbackRate: 1.12
  }
};

export const HOST_VOICE_IDS = ['pNInz6obpgdq5TaqLwtY', 'TxGEqn7nUaNZTRmsh7M3', '21m00Tcm4TlvDq8ikWAM'];
export const GUEST_VOICE_IDS = ['ErXwobaYiN019PkySvjV', 'AZnzlk1XvdvUeBnXmlld', 'EXAVITQu4vr4xnSDxMaL'];
