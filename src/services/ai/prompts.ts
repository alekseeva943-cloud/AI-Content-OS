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

export function buildPlannerPrompt(req: PlannerRequest, context: string[], advanced?: any): string {
  const advancedSection = advanced ? `
AI TONE & STYLE PARAMETERS (Strict adherence required):
- Tone Preset: ${advanced.preset}
- Goal: ${advanced.goal}
- Target Audience: ${advanced.audience}
- Preferred Tone: ${advanced.tone}
- Formality Level: ${advanced.formality}% (0=informal, 100=strictly formal)
- Emotional Intelligence: ${advanced.emotion}% (0=robotic, 100=highly emotional)
- Text Length: ${advanced.length}
- Complexity: ${advanced.complexity}
` : '';

  return `Generate a professional, high-impact content plan for: "${req.topic}"
Target Period: ${req.period}
Channels: ${req.channels.join(', ')}
${advancedSection}
Business Context / Shared Memory:
${context.length > 0 ? context.map(c => `- ${c}`).join('\n') : "No additional context available."}

Additional User Preferences:
${req.context || "None"}

OUTPUT SCHEMA:
{
  "title": "Creative and catchy title for this campaign (in Russian)",
  "summary": "Brief strategy overview of the content narrative. Why this plan works. (in Russian)",
  "items": [
    {
      "id": "item-1",
      "day": "Day label (e.g. День 1, Понедельник)",
      "time": "Recommended posting time (HH:MM)",
      "channel": "one of: telegram, email, vk",
      "topic": "Compelling headline or topic",
      "description": "Short internal brief explaining the content structure",
      "angle": "Specific creative hook or angle of this post (e.g. 'Закулисье', 'Экспертный разбор', 'Провокационный вопрос')",
      "rationale": "Short AI rationale: why we publish this exactly now and for this channel",
      "hashtags": ["list", "of", "relevant", "hashtags"]
    }
  ]
}

REFINED GUIDELINES:
- Ensure the tone is consistent with a "Creative AI Partner".
- Use modern, human-like Russian language. Avoid clichés like "В современном мире" or "Важно отметить".
- Make the 'angle' unique and the 'rationale' insightful.
- For longer periods, create a content arc: Introduction -> Deep Dive -> Social Proof/Trust -> Call to Action.
`;
}
