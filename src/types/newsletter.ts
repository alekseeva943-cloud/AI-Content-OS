import { z } from 'zod';

export const NewsletterResultSchema = z.object({
  subject: z.string(),
  preheader: z.string(),
  body: z.string(),
  cta: z.object({
    text: z.string(),
    link: z.string().optional()
  }).optional(),
  blocks: z.array(z.object({
    type: z.enum(['text', 'image', 'highlight']),
    content: z.string(),
    title: z.string().optional()
  })).optional()
});

export type NewsletterResult = z.infer<typeof NewsletterResultSchema>;

export interface NewsletterRequest {
  subject: string;
  insights: string;
  advanced?: any;
}
