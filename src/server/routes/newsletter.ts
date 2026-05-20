import { Router } from "express";
import { getOpenAI } from "../utils/openai";
import { normalizeChannel } from "../utils/channels";
import {
  getModulePrompts,
  renderPrompt
} from "../../../lib/prompts";
import {
  CampaignResultSchema
} from "../../types/newsletter.ts";

const router = Router();

router.post("/api/campaign-detect", async (req, res) => {
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

router.post("/api/newsletter", async (req, res) => {
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
        requestedChannels.map(
          (requestedId: string) => {

            // TRY FIND MATCHING CHANNEL

            const found =
              (rawData.channels || [])
                .find((ch: any) => {

                  const normalized =
                    normalizeChannel(
                      ch.id ||
                      ch.channel ||
                      ch.type ||
                      ""
                    );

                  return (
                    normalized ===
                    requestedId
                  );
                });

            const c =
              found?.content || {};

            let fixedCTA =
              c.cta;

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
              id: requestedId,

              active: true,

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
                  c.imageUrl ||
                  null,

                formatting:
                  c.formatting ||
                  {}
              }
            };
          }
        ),

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

export default router;
