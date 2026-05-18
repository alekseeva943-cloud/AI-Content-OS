import OpenAI from 'openai';
import { AIRequestConfig, AIResponse } from '@/src/types/ai';
import { useSettingsStore } from '@/src/stores/useSettingsStore';

export class OpenAIClient {
  private static instance: OpenAIClient;
  
  private constructor() {}

  static getInstance(): OpenAIClient {
    if (!OpenAIClient.instance) {
      OpenAIClient.instance = new OpenAIClient();
    }
    return OpenAIClient.instance;
  }

  private getClient(): OpenAI | null {
    const { openaiKey } = useSettingsStore.getState();
    const envKey = (import.meta as any).env.VITE_OPENAI_API_KEY;
    const finalKey = openaiKey || envKey;
    
    if (!finalKey) return null;

    return new OpenAI({
      apiKey: finalKey,
      dangerouslyAllowBrowser: true // Ideally proxied through server, but foundation allows this for now
    });
  }

  async generateStructured<T>(
    prompt: { system: string; user: string },
    config: AIRequestConfig = {}
  ): Promise<AIResponse<T>> {
    const client = this.getClient();
    const startTime = Date.now();

    if (!client) {
      throw new Error('OpenAI API Key not configured. Please check Settings.');
    }

    try {
      const response = await client.chat.completions.create({
        model: config.model || 'gpt-4o',
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens,
        response_format: config.responseFormat === 'json' ? { type: "json_object" } : undefined,
      });

      const latency = Date.now() - startTime;
      const content = response.choices[0].message.content;

      return {
        data: content ? JSON.parse(content) : undefined,
        latency,
        tokens: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0,
        }
      };
    } catch (error: any) {
      return {
        error: error.message || 'Unknown OpenAI Error',
        latency: Date.now() - startTime
      };
    }
  }
}

export const openAIClient = OpenAIClient.getInstance();
