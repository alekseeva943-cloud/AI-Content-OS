import { OpenAI } from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { topic, context } = req.body;

    const systemPrompt = `You are a Campaign Discovery AI. Your task is to analyze a campaign topic and context, and identify EXACTLY what specific data is missing to make this campaign "ready-to-send" without any placeholders like [Name] or [Company].
    
    Standard variables like 'companyName', 'authorName', 'website' are always useful, but look for specific ones like 'webinarDate', 'discountCode', 'productPrice', 'earlyBirdDeadline', etc.
    
    Return a JSON object with:
    1. "requirements": Array of objects { id, label, description, type, importance }
    2. "suggestedChannels": Array of strings (email, telegram, vk)
    
    Example:
    {
      "requirements": [
        { "id": "companyName", "label": "Название компании", "description": "Для подписи и бренда", "type": "text", "importance": "critical" },
        { "id": "discountCode", "label": "Промокод", "description": "Скидка для читателей", "type": "text", "importance": "optional" }
      ],
      "suggestedChannels": ["email", "telegram"]
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
    return res.status(200).json(JSON.parse(content || "{}"));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
