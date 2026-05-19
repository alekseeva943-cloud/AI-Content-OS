import { z } from 'zod';

export const CampaignResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  strategy: z.string().optional(),
  channels: z.array(z.object({
    id: z.enum(['email', 'telegram', 'vk']),
    active: z.boolean().default(true),
    content: z.object({
      subject: z.string().optional().default(""),
      preheader: z.string().optional().default(""),
      body: z.string().optional().default(""),
      cta: z.object({
        text: z.string(),
        link: z.string()
      }).optional().default({ text: "Узнать больше", link: "#" }),
      imagePrompt: z.string().optional().default(""),
      imageUrl: z.string().optional(),
      formatting: z.object({
        emojis: z.boolean().optional(),
        boldHighlights: z.boolean().optional()
      }).optional()
    })
  })),
  variables: z.record(z.string(), z.string()).optional()
});

export type CampaignResult = z.infer<typeof CampaignResultSchema>;
export type NewsletterResult = CampaignResult;

export interface CampaignRequest {
  topic: string;
  context: string;
  channels: string[];
  variables?: Record<string, string>;
  advanced?: any;
}

export interface VariableRequirement {
  id: string;
  label: string;
  description: string;
  type: 'text' | 'url' | 'date' | 'number';
  importance: 'critical' | 'optional';
}
