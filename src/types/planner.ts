import { z } from 'zod';

export const ContentChannelSchema = z.enum(['telegram', 'email', 'vk']);
export type ContentChannel = z.infer<typeof ContentChannelSchema>;

export const PlanningPeriodSchema = z.enum(['today', '3days', '5days', 'week']);
export type PlanningPeriod = z.infer<typeof PlanningPeriodSchema>;

export const PlannerItemSchema = z.object({
  id: z.string(),
  day: z.string(), // e.g. "Day 1", "Monday"
  time: z.string(), // e.g. "10:00"
  channel: ContentChannelSchema,
  topic: z.string(),
  description: z.string().optional(),
  type: z.string().optional(), // e.g. "Hook", "Educational", "Poll"
  purpose: z.string().optional(), // Publishing purpose
  goal: z.string().optional(), // Engagement goal
  angle: z.string().optional(), // The specific creative angle or hook
  rationale: z.string().optional(), // Why this post matters
  hashtags: z.array(z.string()).optional(),
});

export type PlannerItem = z.infer<typeof PlannerItemSchema>;

export const PlannerResultSchema = z.object({
  title: z.string(),
  items: z.array(PlannerItemSchema),
  summary: z.string(),
});

export type PlannerResult = z.infer<typeof PlannerResultSchema>;

export interface PlannerRequest {
  topic: string;
  context?: string;
  period: PlanningPeriod;
  channels: ContentChannel[];
  advanced?: any;
}
