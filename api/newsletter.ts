
import { OpenAI } from "openai";
import { z } from "zod";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { CampaignResultSchema } from "../src/types/newsletter.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { topic, context, variables, advanced } = req.body;

    const systemPrompt = `You are an Expert Campaign Strategist. Your goal is to synthesize a high-converting multi-channel campaign.
    
    CRITICAL:
    - NO placeholders like [Name], [Company], or [Link]. Use the provided variables.
    - If a variable is missing, invent a realistic value that fits the context, but NEVER leave brackets.
    - Adapt the message perfectly for each channel:
      - EMAIL: Professional, clear subject/preheader, formatted body, strong CTA.
      - TELEGRAM: Punchy hooks, bold text, emojis, short paragraphs, rhythmic flow.
      - VK: Storytelling approach, engaging tone, ends with a discussion-starting CTA.
    
    Provided Variables (Inject these):
    ${JSON.stringify(variables || {}, null, 2)}
    
    Tone: ${advanced?.tone || 'Expert & Engaging'}
    
    Return a JSON following the CampaignResultSchema:
    {
      "id": "campaign_id",
      "name": "Campaign Name",
      "strategy": "Brief overview of why this works",
      "channels": [
        {
          "id": "email",
          "active": true,
          "content": {
            "subject": "...",
            "preheader": "...",
            "body": "...",
            "cta": { "text": "...", "link": "..." },
            "imagePrompt": "Detailed DALL-E prompt for a campaign visual matching the brand tone"
          }
        },
        ... (repeat for telegram, vk)
      ]
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Topic: ${topic}\nContext: ${context}` }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Empty response from AI");

    const rawData = JSON.parse(content);
    
    // Ensure ID and timestamps
    rawData.id = rawData.id || `campaign_${Date.now()}`;
    
    const validated = CampaignResultSchema.parse(rawData);
    return res.status(200).json(validated);

  } catch (error: any) {
    console.error("[Campaign API] Error:", error);
    return res.status(500).json({ error: error.message || "Campaign synthesis failed" });
  }
}
