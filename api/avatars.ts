
import { OpenAI } from "openai";
import { z } from "zod";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getModulePrompts } from "../lib/prompts.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { topic, context, advanced } = req.body;
    const { system, user } = getModulePrompts("video-avatar", { topic, context });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices[0].message.content;
    console.log("[Avatars API] RAW AI OUTPUT:", rawContent);
    const rawData = JSON.parse(rawContent || "{}");

    const result = {
      hook: rawData.hook || rawData.opening || "",
      scenes: Array.isArray(rawData.scenes) ? rawData.scenes.map((s: any) => ({
        id: s.id || Math.random().toString(36).substr(2, 9),
        description: s.description || s.visuals || "",
        narration: s.narration || s.text || "",
        gesture: s.gesture || s.action || "neutral",
        emotion: s.emotion || "natural",
        visuals: s.visuals || s.description || ""
      })) : [],
      captionStyles: rawData.captionStyles || { font: "Inter", color: "#FFFFFF", animation: "fade" }
    };

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[Avatars API] Error:", error);
    return res.status(500).json({ error: error.message || "Avatar synthesis failed" });
  }
}
