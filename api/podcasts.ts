
import { OpenAI } from "openai";
import { z } from "zod";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getModulePrompts } from "../lib/prompts.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { topic, context, advanced } = req.body;
    const { system, user } = getModulePrompts("podcasts", { topic, context });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices[0].message.content;
    console.log("[Podcasts API] RAW AI OUTPUT:", rawContent);
    const rawData = JSON.parse(rawContent || "{}");

    const result = {
      topic: rawData.topic || topic,
      intro: rawData.intro || rawData.hook || "",
      structure: Array.isArray(rawData.structure) ? rawData.structure.map((s: any) => ({
        id: s.id || Math.random().toString(36).substr(2, 9),
        title: s.title || "Сегмент",
        duration: s.duration || "2:00",
        points: Array.isArray(s.points) ? s.points : [s.content || s.description].filter(Boolean),
        talkingPoints: s.talkingPoints || []
      })) : [],
      guestQuestions: Array.isArray(rawData.guestQuestions) ? rawData.guestQuestions : [],
      outro: rawData.outro || rawData.conclusion || "",
      cta: rawData.cta || ""
    };

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[Podcasts API] Error:", error);
    return res.status(500).json({ error: error.message || "Podcast synthesis failed" });
  }
}
