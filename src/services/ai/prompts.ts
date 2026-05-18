import { PlannerRequest } from '@/src/types/planner';

export const SYSTEM_PROMPT = `You are an expert Content Strategy AI for "AI Content OS".
Your goal is to generate high-quality, professional, and engaging content plans for various channels.
You must speak natural, modern Russian (avoiding robotic "AI-speak").
You generate structured content that is practical, trend-aware, and valuable to the target audience.

CRITICAL RULES:
1. Return ONLY valid JSON.
2. No markdown, no conversational filler, no explanations.
3. The response must match the requested schema exactly.
4. Language: Russian (natural, modern).
`;

export function buildPlannerPrompt(req: PlannerRequest, context: string[]): string {
  return `Generate a content plan for: "${req.topic}"
Planning Period: ${req.period}
Channels: ${req.channels.join(', ')}

Business Context/Shared Memory:
${context.length > 0 ? context.map(c => `- ${c}`).join('\n') : "No additional context available."}

Additional User Requirements:
${req.context || "None"}

Output Schema Requirements:
{
  "title": "Creative title of the plan",
  "summary": "Brief strategy overview in Russian",
  "items": [
    {
      "id": "unique-id-1",
      "day": "Day identifier (e.g. Day 1, Monday)",
      "time": "Recommended time (HH:MM)",
      "channel": "one of: telegram, email, vk",
      "topic": "Concise but catchy topic",
      "description": "Short internal brief about the post",
      "hashtags": ["list", "of", "relevant", "hashtags"]
    }
  ]
}

Make sure topics are specific, not generic. Group items by day. 
For 3+ days, ensure a logical progression in the content narrative.
`;
}
