export type AIProviderId = 'openai' | 'heygen' | 'elevenlabs';

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  description: string;
  isEnabled: boolean;
  requiresKey: boolean;
  documentationUrl: string;
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Основной интеллект системы для планирования и генерации смыслов.',
    isEnabled: true,
    requiresKey: true,
    documentationUrl: 'https://platform.openai.com/',
  },
  {
    id: 'heygen',
    name: 'HeyGen',
    description: 'Генерация видео-аватаров и фотореалистичного контента.',
    isEnabled: true,
    requiresKey: true,
    documentationUrl: 'https://www.heygen.com/',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'Синтез голоса и аудио-продакшн высшего качества.',
    isEnabled: true,
    requiresKey: true,
    documentationUrl: 'https://elevenlabs.io/',
  },
];
