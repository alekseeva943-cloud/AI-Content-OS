import { OpenAI } from "openai";
import { z } from "zod";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Define Schema for validation (Matching project types in src/types/planner.ts)
const PlannerItemSchema = z.object({
  id: z.string(),
  day: z.string(),
  time: z.string(),
  channel: z.enum(['telegram', 'email', 'vk']),
  topic: z.string(),
  description: z.string().optional(),
  angle: z.string().optional(),
  rationale: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
});

const PlannerResultSchema = z.object({
  title: z.string(),
  items: z.array(PlannerItemSchema),
  summary: z.string(),
});

const buildPlannerPrompt = (req: any, memory: string[], advanced: any) => {
  return `Generate a comprehensive content plan for: ${req.topic}.
Context: ${req.context || "No extra context"}.
Period: ${req.period}.
Channels: ${req.channels.join(", ")}.
Advanced Settings: ${JSON.stringify(advanced)}.
Shared Memory: ${memory.join("\n")}.

Return ONLY a valid JSON object matching this structure:
{
  "title": "A compelling title for the plan",
  "summary": "A brief overview of the strategy",
  "items": [
    {
      "id": "item-1",
      "day": "Day 1",
      "time": "10:00",
      "channel": "telegram",
      "topic": "Post Title",
      "description": "Post body or detail",
      "angle": "Educational / Curated / Storytelling",
      "rationale": "Why this works for the audience",
      "hashtags": ["tag1", "tag2"]
    }
  ]
}`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { topic, context, period, channels, sharedMemory, advanced } = req.body;

    if (!topic || !period || !channels) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    }

    const openai = new OpenAI({ apiKey });
    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert content strategist." },
        { role: "user", content: buildPlannerPrompt({ topic, context, period, channels }, sharedMemory || [], advanced) }
      ],
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices[0].message.content;
    if (!rawContent) throw new Error("Empty AI response");

    const validated = PlannerResultSchema.parse(JSON.parse(rawContent));
    const duration = Date.now() - startTime;

    return res.status(200).json({ 
      ...validated, 
      debug: { duration, model: "gpt-4o" } 
    });

  } catch (error: any) {
    console.error("[API Error]", error);
    return res.status(500).json({ 
      error: error.message || "Synthesis failed",
      details: error.errors
    });
  }
}
