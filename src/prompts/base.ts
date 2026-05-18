import { IPromptBuilder } from '@/src/types/ai';

export abstract class BasePromptBuilder implements IPromptBuilder {
  abstract buildSystemPrompt(): string;
  abstract buildUserPrompt(data: any): string;

  protected wrapWithContext(prompt: string, context: string[]): string {
    if (context.length === 0) return prompt;
    
    return `
      Additional Context from previous generations:
      ${context.join('\n---\n')}
      
      Main Task:
      ${prompt}
    `;
  }
}
