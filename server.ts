import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { OpenAI } from "openai";
import dotenv from "dotenv";

import {
  getPlannerPrompts,
  getPostPrompts,
  getModulePrompts,
  renderPrompt
} from "./lib/prompts";

import {
  PlannerResultSchema,
  PlannerItemSchema
} from "./src/types/planner.ts";

import {
  CampaignResultSchema
} from "./src/types/newsletter.ts";

dotenv.config();

const app = express();

const PORT = 3000;

app.use((req, res, next) => {
  console.log(
    `[Request] ${new Date().toISOString()} ${req.method} ${req.url}`
  );

  next();
});

app.use(cors());

app.use(express.json({
  limit: "20mb"
}));

let openaiClient: OpenAI | null =
  null;

function getOpenAI() {
  if (!openaiClient) {
    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Missing OPENAI_API_KEY"
      );
    }

    openaiClient =
      new OpenAI({
        apiKey
      });
  }

  return openaiClient;
}

function normalizeChannel(
  value?: string
) {
  const v =
    String(value || "")
      .toLowerCase()
      .trim();

  if (
    v === "telegram" ||
    v === "tg"
  ) {
    return "telegram";
  }

  if (
    v === "vk" ||
    v === "vkontakte"
  ) {
    return "vk";
  }

  if (
    v === "email" ||
    v === "mail"
  ) {
    return "email";
  }

  return v;
}

app.post("/api/planner", async (req, res) => {
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

    const validated =
      PlannerResultSchema.parse(
        JSON.parse(rawContent)
      );

    const startObj = startDate
      ? new Date(startDate)
      : new Date();

    validated.items =
      validated.items.map((item) => {
        const itemDate =
          new Date(startObj);

        itemDate.setDate(
          startObj.getDate() +
            (item.dayIndex || 0)
        );

        const weekday =
          itemDate.toLocaleDateString(
            "ru-RU",
            {
              weekday: "long"
            }
          );

        return {
          ...item,

          publishDate:
            itemDate
              .toISOString()
              .split("T")[0],

          weekday:
            weekday.charAt(0).toUpperCase() +
            weekday.slice(1)
        };
      });

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

app.post("/api/campaign-detect", async (req, res) => {
  try {
    const {
      topic,
      context
    } = req.body;

    const client = getOpenAI();

    const { system } =
      getModulePrompts(
        "newsletter",
        {
          topic,
          context
        }
      );

    const detectPrompt =
      renderPrompt(
        "newsletter",
        "detect.txt",
        {
          topic:
            topic || "Без темы",

          context:
            context ||
            "Нет контекста"
        }
      );

    const response =
      await client.chat.completions.create({
        model: "gpt-4o",

        messages: [
          {
            role: "system",

            content:
              system +
              "\n\nВесь ответ только на русском языке."
          },

          {
            role: "user",
            content: detectPrompt
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
        "Empty AI response"
      );
    }

    res.json(JSON.parse(content));

  } catch (error: any) {
    console.error(
      "[Campaign Detect ERROR]",
      error
    );

    res.status(500).json({
      error: error.message
    });
  }
});

app.post("/api/newsletter", async (req, res) => {
  try {
    const {
      topic,
      context,
      variables,
      channels,
      advanced
    } = req.body;

    const requestedChannels =
      Array.isArray(channels) &&
      channels.length > 0
        ? channels.map(
            normalizeChannel
          )
        : ["telegram"];

    console.log(
      "[Newsletter API] Requested channels:",
      requestedChannels
    );

    const client = getOpenAI();

    const {
      system,
      user
    } = getModulePrompts(
      "newsletter",
      {
        topic:
          topic || "Без темы",

        context:
          context ||
          "Нет дополнительного контекста",

        variables: JSON.stringify(
          variables || {}
        ),

        channels:
          requestedChannels.join(
            ", "
          ),

        tone:
          advanced?.tone ||
          "natural"
      }
    );

    const response =
      await client.chat.completions.create({
        model: "gpt-4o",

        messages: [
          {
            role: "system",

            content:
              system +
              `

КРИТИЧЕСКИ ВАЖНО:

- Весь текст только на русском языке
- Английский язык запрещен
- HTML запрещен
- Никаких <p>, <br>, <div>
- Только JSON
- channels должен содержать только запрошенные каналы
`
          },

          {
            role: "user",
            content: user
          }
        ],

        response_format: {
          type: "json_object"
        },

        temperature: 0.9
      });

    const rawContent =
      response.choices[0].message.content;

    if (!rawContent) {
      throw new Error(
        "OpenAI returned empty response"
      );
    }

    console.log(
      "[Newsletter API] RAW:",
      rawContent
    );

    const rawData =
      JSON.parse(rawContent);

    if (!rawData.channels) {
      rawData.channels = [];

      if (rawData.email) {
        rawData.channels.push({
          id: "email",
          active: true,
          content: rawData.email
        });
      }

      if (rawData.telegram) {
        rawData.channels.push({
          id: "telegram",
          active: true,
          content:
            rawData.telegram
        });
      }

      if (rawData.vk) {
        rawData.channels.push({
          id: "vk",
          active: true,
          content: rawData.vk
        });
      }
    }

    const transformed = {
      id:
        rawData.id ||
        `campaign-${Date.now()}`,

      name:
        rawData.name ||
        topic ||
        "Новая кампания",

      strategy:
        rawData.strategy || "",

      channels:
        (rawData.channels || [])

          .map((ch: any) => {
            const channelId =
              normalizeChannel(
                ch.id ||
                  ch.channel ||
                  ch.type ||
                  ""
              );

            console.log(
              "[Newsletter API] Channel:",
              channelId
            );

            if (
              !requestedChannels.includes(
                channelId
              )
            ) {
              return null;
            }

            const c =
              ch.content || {};

            let fixedCTA = c.cta;

            if (
              typeof fixedCTA ===
              "string"
            ) {
              fixedCTA = {
                text: fixedCTA,
                link: "#"
              };
            }

            if (
              !fixedCTA ||
              typeof fixedCTA !==
                "object"
            ) {
              fixedCTA = {
                text: "Подробнее",
                link: "#"
              };
            }

            return {
              id: channelId,

              active:
                ch.active ?? true,

              content: {
                subject:
                  c.subject || "",

                preheader:
                  c.preheader || "",

                body: String(
                  c.body || ""
                ).trim(),

                cta: {
                  text:
                    fixedCTA.text ||
                    "Подробнее",

                  link:
                    fixedCTA.link ||
                    "#"
                },

                imagePrompt:
                  c.imagePrompt ||
                  "",

                imageUrl:
                  c.imageUrl || null,

                formatting:
                  c.formatting || {}
              }
            };
          })

          .filter(Boolean),

      variables:
        rawData.variables || {}
    };

    console.log(
      "[Newsletter API] FINAL:",
      JSON.stringify(
        transformed,
        null,
        2
      )
    );

    const validated =
      CampaignResultSchema.parse(
        transformed
      );

    res.json(validated);

  } catch (error: any) {
    console.error(
      "[Newsletter API ERROR]",
      error
    );

    res.status(500).json({
      error:
        error.message ||
        "Newsletter synthesis failed",

      details:
        error.errors || null
    });
  }
});

app.post("/api/generate-post", async (req, res) => {
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

app.post("/api/regenerate-item", async (req, res) => {
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

app.all("/api/*", (req, res) => {
  res.status(404).json({
    error:
      "API Endpoint not found",

    received: {
      method: req.method,
      path: req.url
    }
  });
});

async function startServer() {
  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    const vite =
      await createViteServer({
        server: {
          middlewareMode: true
        },

        appType: "spa"
      });

    app.use(vite.middlewares);

  } else {
    const distPath =
      path.join(
        process.cwd(),
        "dist"
      );

    app.use(
      express.static(distPath)
    );

    app.get("*", (req, res) => {
      res.sendFile(
        path.join(
          distPath,
          "index.html"
        )
      );
    });
  }

  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `[Server] Running on ${PORT}`
      );
    }
  );
}

startServer();