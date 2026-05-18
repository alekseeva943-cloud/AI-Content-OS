import { z } from 'zod';
import { AIModule } from '@/src/types/ai';

// Planner Response Schema
export const PlannerSchema = z.object({
  title: z.string(),
  description: z.string(),
  milestones: z.array(z.object({
    day: z.number(),
    task: z.string(),
    deliverable: z.string()
  })),
  metadata: z.object({
    tokens: z.number().optional(),
    suggestedTags: z.array(z.string())
  })
});

// Newsletter Response Schema
export const NewsletterSchema = z.object({
  subject: z.string(),
  preheader: z.string(),
  body: z.string(),
  callToAction: z.string()
});

export const SCHEMAS: Record<AIModule, z.ZodTypeAny> = {
  planner: PlannerSchema,
  newsletters: NewsletterSchema, // Mapping to internal IDs from config
  podcasts: z.any(), // Placeholders
  avatars: z.any(),
  longreads: z.any()
} as any;

export class ResponseParser {
  static parse<T>(moduleId: string, data: any): T {
    const schema = (SCHEMAS as any)[moduleId];
    if (!schema) return data as T;
    
    return schema.parse(data) as T;
  }
}
