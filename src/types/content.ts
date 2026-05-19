import { z } from 'zod';

export const LongreadResultSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  readingTime: z.number(), // in minutes
  content: z.string(), // Markdown content
  outline: z.array(z.object({
    id: z.string(),
    title: z.string(),
    level: z.number()
  })).optional(),
  callouts: z.array(z.string()).optional(),
  socialSummary: z.string().optional()
});

export type LongreadResult = z.infer<typeof LongreadResultSchema>;

export const PodcastResultSchema = z.object({
  topic: z.string(),
  intro: z.string(),
  structure: z.array(z.object({
    id: z.string(),
    title: z.string(),
    duration: z.string(), // e.g. "2:30"
    points: z.array(z.string()),
    talkingPoints: z.array(z.string()).optional()
  })),
  guestQuestions: z.array(z.string()).optional(),
  outro: z.string(),
  cta: z.string().optional()
});

export type PodcastResult = z.infer<typeof PodcastResultSchema>;

export const VideoAvatarResultSchema = z.object({
  hook: z.string(),
  scenes: z.array(z.object({
    id: z.string(),
    description: z.string(),
    narration: z.string(),
    gesture: z.string().optional(),
    emotion: z.string().optional(),
    visuals: z.string().optional()
  })),
  captionStyles: z.object({
    font: z.string(),
    color: z.string(),
    animation: z.string()
  }).optional()
});

export type VideoAvatarResult = z.infer<typeof VideoAvatarResultSchema>;
