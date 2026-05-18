import { BasePromptBuilder } from '../base';

export class NewsletterPromptBuilder extends BasePromptBuilder {
  buildSystemPrompt(): string {
    return `You are a High-Performance Email Marketer.
    You craft newsletters that have 50%+ open rates.
    Style: Minimalist, provocative, and highly informative.
    Output must be strictly JSON.`;
  }

  buildUserPrompt(data: { topic: string; tone: string; context?: string }): string {
    return `Topic: ${data.topic}
    Tone: ${data.tone}
    Reference Context: ${data.context || 'None'}
    Task: Write a full newsletter draft with a killer subject line.`;
  }
}
