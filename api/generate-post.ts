// File: api/generate-post.ts

import { OpenAI } from "openai";
import type {
  VercelRequest,
  VercelResponse
} from "@vercel/node";

import { getPostPrompts } from "../lib/prompts.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function cleanPost(text: string) {
  return text
    .replace(/^```markdown/gm, "")
    .replace(/^```/gm, "")
    .replace(/^\*\*Заголовок:\*\*/gm, "")
    .replace(/^Вот ваш пост:?/gm, "")
    .replace(/^Telegram Post:?/gm, "")
    .trim();
}

function normalizeSpacing(text: string) {
  return text
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function addTelegramRhythm(text: string) {
  const paragraphs = text
    .split("\n")
    .map(p => p.trim())
    .filter(Boolean);

  return paragraphs.join("\n\n");
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log("[Post API] Request started", {
    method: req.method,
    url: req.url,
    cwd: process.cwd()
  });

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  try {
    const {
      item,
      context,
      advanced
    } = req.body;

    if (!item) {
      console.warn("[Post API] Missing item details");
      return res.status(400).json({
        error: "Missing item details"
      });
    }

    console.log("[Post API] Loading prompts...");
    let promptData;
    try {
      promptData = getPostPrompts({
        item,
        context,
        advanced
      });
      console.log("[Post API] Prompts loaded successfully");
    } catch (promptError: any) {
      console.error("[Post API] Failed to load prompts:", promptError.message);
      return res.status(500).json({
        error: "Failed to load prompts archive",
        details: promptError.message
      });
    }

    const {
      system,
      user
    } = promptData;

    console.log("[Post API] Calling OpenAI...");
    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.85,
        max_tokens: 1800,
        frequency_penalty: 0.4,
        presence_penalty: 0.3,
        messages: [
          {
            role: "system",
            content: system
          },
          {
            role: "user",
            content: user
          }
        ]
      });

    const raw =
      completion.choices?.[0]?.message?.content;

    if (!raw) {
      console.error("[Post API] Empty AI response");
      throw new Error("Empty AI response");
    }

    let finalText = cleanPost(raw);
    finalText = normalizeSpacing(finalText);

    // Platform-specific formatting
    switch (item.channel) {
      case "telegram":
        finalText =
          addTelegramRhythm(finalText);
        break;
      case "vk":
        finalText =
          normalizeSpacing(finalText);
        break;
      case "email":
        finalText =
          normalizeSpacing(finalText);
        break;
      default:
        break;
    }

    console.log("[Post API] Request completed successfully");

    return res.status(200).json({
      text: finalText,
      meta: {
        channel: item.channel,
        type: item.type,
        goal: item.goal,
        generated: true
      }
    });

  } catch (error: any) {
    console.error("[Post API] Fatal Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return res.status(500).json({
      error:
        error?.message ||
        "Post generation failed",
      details: error?.errors || null,
      debug_cwd: process.cwd()
    });
  }
}
