import { Router } from "express";
import { getOpenAI } from "../utils/openai";
import { processPlannerItems } from "../utils/date";
import {
  getPlannerPrompts,
  getPostPrompts,
  renderPrompt
} from "../../../lib/prompts";
import {
  PlannerResultSchema,
  PlannerItemSchema
} from "../../types/planner.ts";

const router = Router();

router.post("/api/planner", async (req, res) => {
  try {
    const {
      topic,
      context,
      period,
      channels,
      sharedMemory,
      advanced,
      startDate
    } = req.body;

    if (
      !topic ||
      !period ||
      !channels
    ) {
      return res.status(400).json({
        error:
          "Missing required fields"
      });
    }

    const client = getOpenAI();

    const {
      system,
      user
    } = getPlannerPrompts({
      topic,
      context,
      period,
      channels,
      sharedMemory,
      advanced,
      startDate
    });

    const response =
      await client.chat.completions.create({
        model: "gpt-4o",

        messages: [
          {
            role: "system",
            content: system
          },

          {
            role: "user",
            content: user
          }
        ],

        response_format: {
          type: "json_object"
        }
      });

    const rawContent =
      response.choices[0].message.content;

    if (!rawContent) {
      throw new Error(
        "Empty AI response"
      );
    }

    const parsedData = JSON.parse(rawContent);
    parsedData.items = processPlannerItems(parsedData.items || [], channels, startDate);

    const validated = PlannerResultSchema.parse(parsedData);

    res.json(validated);

  } catch (error: any) {
    console.error(
      "[Planner API ERROR]",
      error
    );

    res.status(500).json({
      error:
        error.message ||
        "Planner synthesis failed",

      details:
        error.errors || null
    });
  }
});

router.post("/api/generate-post", async (req, res) => {
  try {
    const {
      item,
      context,
      advanced
    } = req.body;

    const client = getOpenAI();

    const {
      system,
      user
    } = getPostPrompts({
      item,
      context,
      advanced
    });

    const response =
      await client.chat.completions.create({
        model: "gpt-4o",

        messages: [
          {
            role: "system",
            content: system
          },

          {
            role: "user",
            content: user
          }
        ],

        temperature: 0.85
      });

    res.json({
      text:
        response.choices[0].message
          .content
    });

  } catch (error: any) {
    console.error(
      "[Generate Post ERROR]",
      error
    );

    res.status(500).json({
      error: error.message
    });
  }
});

router.post("/api/regenerate-item", async (req, res) => {
  try {
    const { item } = req.body;

    const client = getOpenAI();

    const userPrompt =
      renderPrompt(
        "planner",
        "regenerate.txt",
        {
          item: JSON.stringify(
            item
          )
        }
      );

    const response =
      await client.chat.completions.create({
        model: "gpt-4o",

        messages: [
          {
            role: "system",

            content:
              "Return ONLY valid JSON"
          },

          {
            role: "user",
            content: userPrompt
          }
        ],

        response_format: {
          type: "json_object"
        }
      });

    const content =
      response.choices[0].message.content;

    if (!content) {
      throw new Error(
        "Empty response"
      );
    }

    const parsed =
      PlannerItemSchema.parse(
        JSON.parse(content)
      );

    res.json(parsed);

  } catch (error: any) {
    console.error(
      "[Regenerate ERROR]",
      error
    );

    res.status(500).json({
      error: error.message
    });
  }
});

export default router;
