import { z } from 'zod';

export const ContentChannelSchema = z.enum(['telegram', 'email', 'vk', 'youtube', 'linkedin']);
export type ContentChannel = z.infer<typeof ContentChannelSchema>;

export const PlanningPeriodSchema = z.enum(['today', '3days', '5days', 'week']);
export type PlanningPeriod = z.infer<typeof PlanningPeriodSchema>;

export const PostSettingsSchema = z.object({
  tone: z.string().optional(),
  length: z.string().optional(),
  hookIntensity: z.number().optional(),
  ctaStrength: z.number().optional(),
  emojiDensity: z.number().optional(),
  formattingStyle: z.string().optional(),
  aggressiveness: z.number().optional(),
  storytelling: z.number().optional(),
  educationalDepth: z.number().optional(),
});

export type PostSettings = z.infer<typeof PostSettingsSchema>;

export const PlannerItemSchema = z.object({
  id: z.string(),
  dayIndex: z.number(), // 0, 1, 2...
  day: z.string(), // e.g. "Понедельник"
  weekday: z.string().optional(), // Russian weekday e.g. "Вторник"
  publishDate: z.string().optional(), // ISO date e.g. "2026-05-20"
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
  aiSettings: PostSettingsSchema.optional(),
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
  startDate?: string;
  advanced?: any;
}
