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
    description: 'Powering intelligence, text generation, and planning.',
    isEnabled: true,
    requiresKey: true,
    documentationUrl: 'https://platform.openai.com/',
  },
  {
    id: 'heygen',
    name: 'HeyGen',
    description: 'Video avatar generation and synthesis.',
    isEnabled: false,
    requiresKey: true,
    documentationUrl: 'https://www.heygen.com/',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'Premium AI voice synthesis.',
    isEnabled: false,
    requiresKey: true,
    documentationUrl: 'https://elevenlabs.io/',
  },
];
