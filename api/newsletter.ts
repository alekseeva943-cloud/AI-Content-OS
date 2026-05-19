
import { OpenAI } from "openai";
import { z } from "zod";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getModulePrompts } from "../lib/prompts.js";
import { NewsletterResultSchema } from "../src/types/newsletter.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function cleanJsonResponse(content: string): string {
  return content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/^Here.*?\n/gm, "")
    .trim();
}

/**
 * Robust normalization to ensure AI response matches the Expected UI Schema
 */
function normalizeNewsletter(rawData: any, fallbackSubject: string): any {
  console.log("[Newsletter API] Normalizing raw data:", JSON.stringify(rawData, null, 2));

  // Extract variables with multiple fallback paths to account for AI variance
  const subject = rawData.subject_lines?.[0] || rawData.subject || fallbackSubject;
  const preheader = rawData.preview_text || rawData.preheader || rawData.summary || "";
  
  // Handle nested or flat body structure
  let body = "";
  if (rawData.newsletter?.body) body = rawData.newsletter.body;
  else if (rawData.body) body = rawData.body;
  else if (rawData.content) body = rawData.content;
  else if (rawData.email_body) body = rawData.email_body;

  // Handle CTA object or string
  let cta = { text: "Узнать больше", link: "#" };
  const rawCta = rawData.newsletter?.cta || rawData.cta;
  if (typeof rawCta === 'string') {
    cta = { text: rawCta, link: "#" };
  } else if (rawCta && typeof rawCta === 'object') {
    cta = { 
        text: rawCta.text || rawCta.label || "Узнать больше", 
        link: rawCta.link || rawCta.url || "#" 
    };
  }

  // Handle blocks and ensure types match enum
  const rawBlocks = rawData.blocks || rawData.newsletter?.blocks || [];
  const blocks = Array.isArray(rawBlocks) ? rawBlocks.map((b: any) => ({
    type: ['text', 'image', 'highlight'].includes(b.type) ? b.type : 'text',
    content: b.content || b.text || "",
    title: b.title || b.header || undefined
  })) : [];

  return {
    subject,
    preheader,
    body,
    cta,
    blocks
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log("[Newsletter API] Request started", {
    method: req.method,
    url: req.url
  });

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { subject, insights, advanced } = req.body;

    if (!subject) {
      return res.status(400).json({ error: "Missing subject field" });
    }

    console.log("[Newsletter API] Loading prompts...");
    const { system, user } = getModulePrompts("newsletter", { 
      topic: subject, 
      context: insights || "", 
      tone: advanced?.tone || "conversational" 
    });

    console.log("[Newsletter API] Calling OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    const rawContent = completion.choices?.[0]?.message?.content;
    console.log("[Newsletter API] RAW AI OUTPUT:", rawContent);

    if (!rawContent) {
      throw new Error("Empty response from AI");
    }

    const cleaned = cleanJsonResponse(rawContent);
    let parsedJson;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch (e) {
      console.error("[Newsletter API] JSON Parse Error:", e);
      throw new Error("Failed to parse AI response as JSON");
    }

    const normalized = normalizeNewsletter(parsedJson, subject);
    console.log("[Newsletter API] Final Normalized Object:", JSON.stringify(normalized, null, 2));

    const validated = NewsletterResultSchema.parse(normalized);

    return res.status(200).json(validated);

  } catch (error: any) {
    console.error("[Newsletter API] Error:", error);
    
    // Check if it's a Zod validation error
    if (error instanceof z.ZodError) {
        return res.status(500).json({ 
            error: "Validation mismatch", 
            details: error.issues,
            message: "AI returned data in an unexpected format"
        });
    }

    return res.status(500).json({ 
        error: error.message || "Newsletter generation failed" 
    });
  }
}
