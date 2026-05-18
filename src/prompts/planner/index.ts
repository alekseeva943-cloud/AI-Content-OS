import { BasePromptBuilder } from '../base';

export class PlannerPromptBuilder extends BasePromptBuilder {
  buildSystemPrompt(): string {
    return `You are a Senior Content Strategist for AI Content OS.
    Your task is to decompose a vague topic into a structured execution roadmap.
    You prioritize viral potential and SEO optimization.
    Output must be strictly JSON.`;
  }

  buildUserPrompt(data: { topic: string; duration: string }): string {
    return `Topic: ${data.topic}
    Duration: ${data.duration}
    Guidelines: Focus on actionable steps and unique angles.`;
  }
}
