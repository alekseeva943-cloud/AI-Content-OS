import { AIModule, AIRequestConfig, AIResponse, AIStatus } from '@/src/types/ai';
import { openAIClient } from './openaiClient';
import { ResponseParser } from './parsers';
import { aiMemory } from './memory';
import { useDebugStore } from '@/src/stores/useDebugStore';
import { getModulePrompts, getPlannerPrompts, getPostPrompts } from '@/lib/prompts';

export class AIOrchestrator {
  private static instance: AIOrchestrator;
  
  private constructor() {}

  static getInstance(): AIOrchestrator {
    if (!AIOrchestrator.instance) {
      AIOrchestrator.instance = new AIOrchestrator();
    }
    return AIOrchestrator.instance;
  }

  async runModuleTask<T>(
    moduleId: AIModule | string,
    data: any,
    config: AIRequestConfig = {}
  ): Promise<AIResponse<T>> {
    const debug = useDebugStore.getState();
    
    debug.addLog({
      module: moduleId,
      type: 'request',
      message: `Initiating generation for ${moduleId}`,
      data: { config, input: data }
    });

    try {
      // 1. Prepare Context from AI Memory
      const context = aiMemory.getRelevantContext(JSON.stringify(data));
      
      // 2. Build Prompts using unified library
      let system = '';
      let user = '';

      if (moduleId === 'planner') {
        const prompts = getPlannerPrompts(data);
        system = prompts.system;
        user = prompts.user;
      } else if (moduleId === 'post') {
        const prompts = getPostPrompts(data);
        system = prompts.system;
        user = prompts.user;
      } else {
        // Generic module routing
        const prompts = getModulePrompts(moduleId, data);
        system = prompts.system;
        user = prompts.user;
      }

      // 3. Execute with OpenAI
      const response = await openAIClient.generateStructured<T>(
        { system, user },
        { ...config, responseFormat: 'json' }
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // 4. Parse & Validate
      const parsedData = ResponseParser.parse<T>(moduleId, response.data);

      // 5. Store in Memory if successful
      aiMemory.saveAsset({
        moduleId: moduleId as any,
        type: 'generation_output',
        content: parsedData,
        tags: [moduleId, ...(data.tags || [])]
      });

      debug.addLog({
        module: moduleId,
        type: 'response',
        message: `Successfully generated content for ${moduleId}`,
        data: { latency: response.latency, tokens: response.tokens }
      });

      return {
        ...response,
        data: parsedData
      };
    } catch (error: any) {
      debug.addLog({
        module: moduleId,
        type: 'error',
        message: `Task failed: ${error.message}`
      });

      return {
        error: error.message,
        latency: 0
      };
    }
  }
}

export const aiOrchestrator = AIOrchestrator.getInstance();
