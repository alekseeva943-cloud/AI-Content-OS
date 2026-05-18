// File: api/planner.ts

import { OpenAI } from "openai";
import { z } from "zod";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPlannerPrompts } from "../lib/prompts.js";

const PlannerItemSchema = z.object({
  id: z.string(),
  day: z.string(),
  time: z.string(),
  channel: z.enum(["telegram", "email", "vk"]),
  topic: z.string(),

  description: z.string().optional().default(""),
  type: z.string().optional().default("Пост"),
  purpose: z.string().optional().default("Вовлечение"),
  goal: z.string().optional().default("Активность"),
  angle: z.string().optional().default(""),
  rationale: z.string().optional().default(""),
  hashtags: z.array(z.string()).optional().default([])
});

const PlannerResultSchema = z.object({
  title: z.string(),
  summary: z.string(),
  items: z.array(PlannerItemSchema)
});

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

function normalizeItems(items: any[]) {
  return items.map((item, index) => ({
    id: item.id || `item-${index + 1}`,
    day: item.day || "День 1",
    time: item.time || "12:00",
    channel: ["telegram", "vk", "email"].includes(item.channel)
      ? item.channel
      : "telegram",

    topic: item.topic || "Без названия",

    description: item.description || "",
    type: item.type || "Пост",
    purpose: item.purpose || "Вовлечение",
    goal: item.goal || "Активность",
    angle: item.angle || "",
    rationale: item.rationale || "",
    hashtags: Array.isArray(item.hashtags)
      ? item.hashtags
      : []
  }));
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log("[Planner API] Request started", {
    method: req.method,
    url: req.url,
    cwd: process.cwd()
  });

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  try {
    const {
      topic,
      context,
      period,
      channels,
      sharedMemory,
      advanced
    } = req.body;

    if (!topic || !period || !channels?.length) {
      console.warn("[Planner API] Missing required fields", { topic, period, channels });
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    console.log("[Planner API] Loading prompts...");
    let promptData;
    try {
      promptData = getPlannerPrompts({
        topic,
        context,
        period,
        channels,
        sharedMemory,
        advanced
      });
      console.log("[Planner API] Prompts loaded successfully");
    } catch (promptError: any) {
      console.error("[Planner API] Failed to load prompts:", promptError.message);
      return res.status(500).json({
        error: "Failed to load prompts archive",
        details: promptError.message
      });
    }

    const { system, user } = promptData;

    console.log("[Planner API] Calling OpenAI...");
    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 4000,
        response_format: {
          type: "json_object"
        },
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
      console.error("[Planner API] Empty AI response");
      throw new Error("Empty AI response");
    }

    const cleaned = cleanJsonResponse(raw);
    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (jsonError) {
      console.error("[Planner API] JSON Parse Error", { jsonError, raw: cleaned });

      return res.status(500).json({
        error: "AI returned invalid JSON",
        raw: cleaned
      });
    }

    parsed.items = normalizeItems(parsed.items || []);

    const validated =
      PlannerResultSchema.parse(parsed);

    console.log("[Planner API] Request completed successfully", {
      itemCount: validated.items.length
    });

    return res.status(200).json({
      ...validated,
      debug: {
        model: "gpt-4o",
        itemCount: validated.items.length,
        success: true
      }
    });

  } catch (error: any) {
    console.error("[Planner API] Fatal Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return res.status(500).json({
      error:
        error?.message ||
        "Planner synthesis failed",
      details: error?.errors || null,
      debug_cwd: process.cwd()
    });
  }
}
