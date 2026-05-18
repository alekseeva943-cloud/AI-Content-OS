import { z } from 'zod';

export type AIModule = 'planner' | 'newsletter' | 'podcast' | 'avatar' | 'longread';

export type AIStatus = 'idle' | 'preparing' | 'generating' | 'parsing' | 'success' | 'error';

export interface AIResponse<T> {
  data?: T;
  error?: string;
  latency: number;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface AIRetryConfig {
  maxRetries: number;
  backoff: boolean;
}

export interface AIRequestConfig {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  responseFormat?: 'json' | 'text';
}

// Memory Types
export interface AIConsolvedAsset {
  id: string;
  moduleId: AIModule;
  type: string;
  content: any;
  timestamp: number;
  tags: string[];
}

// Base Prompt Builder Type
export interface IPromptBuilder {
  buildSystemPrompt(): string;
  buildUserPrompt(data: any): string;
}

// Zod schemas for structured responses will be defined in parsers or specific modules
