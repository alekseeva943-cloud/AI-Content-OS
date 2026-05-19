import { z } from 'zod';

export const CampaignResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  strategy: z.string().optional(),
  channels: z.array(z.object({
    id: z.enum(['email', 'telegram', 'vk']),
    active: z.boolean(),
    content: z.object({
      subject: z.string().optional(),
      preheader: z.string().optional(),
      body: z.string(),
      cta: z.object({
        text: z.string(),
        link: z.string()
      }),
      imagePrompt: z.string().optional(),
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
