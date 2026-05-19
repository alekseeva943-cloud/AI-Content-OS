
import { OpenAI } from "openai";
import { z } from "zod";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getModulePrompts } from "../lib/prompts.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { topic, context, advanced } = req.body;
    const { system, user } = getModulePrompts("longreads", { topic, context, tone: advanced?.tone });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices[0].message.content;
    console.log("[Longreads API] RAW AI OUTPUT:", rawContent);
    const rawData = JSON.parse(rawContent || "{}");

    const result = {
      title: rawData.title || rawData.article?.title || topic,
      subtitle: rawData.subtitle || rawData.meta?.subtitle || "",
      readingTime: rawData.readingTime || rawData.meta?.readingTime || Math.ceil((rawData.content || "").split(' ').length / 200) || 5,
      content: rawData.content || rawData.article?.body || "",
      outline: Array.isArray(rawData.outline) ? rawData.outline : [],
      callouts: Array.isArray(rawData.callouts) ? rawData.callouts : [],
      socialSummary: rawData.socialSummary || rawData.meta?.summary || ""
    };

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[Longreads API] Error:", error);
    return res.status(500).json({ error: error.message || "Longread synthesis failed" });
  }
}
