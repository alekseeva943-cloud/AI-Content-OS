// File: src/services/ai/parsers.ts

import { z } from "zod";

import { AIModule } from "@/src/types/ai";

/* ==================================================
   PLANNER
================================================== */

export const PlannerItemSchema =
  z.object({

    id: z.string(),

    day: z.string(),

    time: z.string(),

    channel: z.enum([
      "telegram",
      "vk",
      "email"
    ]),

    topic: z.string(),

    description:
      z.string().optional(),

    type:
      z.string().optional(),

    purpose:
      z.string().optional(),

    goal:
      z.string().optional(),

    angle:
      z.string().optional(),

    rationale:
      z.string().optional(),

    hashtags:
      z.array(z.string())
        .optional()
  });

export const PlannerSchema =
  z.object({

    title: z.string(),

    summary: z.string(),

    items:
      z.array(
        PlannerItemSchema
      )
  });

/* ==================================================
   NEWSLETTER
================================================== */

export const NewsletterSchema =
  z.object({

    subject_lines:
      z.array(z.string()),

    preview_text:
      z.string(),

    newsletter:
      z.object({

        title:
          z.string(),

        body:
          z.string(),

        cta:
          z.string()
      })
  });

/* ==================================================
   PODCAST
================================================== */

export const PodcastSchema =
  z.object({

    episode_title:
      z.string(),

    hook:
      z.string(),

    intro:
      z.string(),

    segments:
      z.array(
        z.object({

          title:
            z.string(),

          goal:
            z.string(),

          talking_points:
            z.array(
              z.string()
            ),

          transition:
            z.string()
        })
      ),

    guest_questions:
      z.array(
        z.string()
      ),

    final_takeaway:
      z.string(),

    cta:
      z.string()
  });

/* ==================================================
   FALLBACK
================================================== */

export const GenericSchema =
  z.record(z.string(), z.any());

/* ==================================================
   REGISTRY
================================================== */

export const SCHEMAS:
  Record<
    AIModule,
    z.ZodTypeAny
  > = {

    planner:
      PlannerSchema,

    newsletter:
      NewsletterSchema,

    podcast:
      PodcastSchema,

    avatar:
      GenericSchema,

    longread:
      GenericSchema
  } as const;

/* ==================================================
   RESPONSE PARSER
================================================== */

export class ResponseParser {

  static parse<T>(
    moduleId: AIModule,
    data: any
  ): T {

    const schema =
      SCHEMAS[moduleId];

    if (!schema) {

      console.warn(
        `[Parser] No schema for module "${moduleId}"`
      );

      return data as T;
    }

    const result =
      schema.safeParse(data);

    if (!result.success) {

      console.error(
        `[Parser] Validation failed for "${moduleId}"`,
        result.error.flatten()
      );

      throw new Error(
        `Invalid AI response for module "${moduleId}"`
      );
    }

    console.log(
      `[Parser] "${moduleId}" validated successfully`
    );

    return result.data as T;
  }

  static tryRepairJson(
    raw: string
  ) {

    try {

      const cleaned =
        raw
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

      return JSON.parse(cleaned);

    } catch {

      return null;
    }
  }
}

