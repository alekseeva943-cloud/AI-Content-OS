// ============================================
// FILE: api/newsletter.ts
// ============================================

import { OpenAI } from "openai";
import type {
  VercelRequest,
  VercelResponse
} from "@vercel/node";

import {
  CampaignResultSchema
} from "../src/types/newsletter.js";

const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY
});

function normalizeChannels(
  channels: any
): string[] {

  if (
    !Array.isArray(channels)
  ) {
    return ["telegram"];
  }

  return channels

    .map((c) =>
      String(c)
        .toLowerCase()
        .trim()
    )

    .filter((c) =>
      ["email", "telegram", "vk"]
        .includes(c)
    );
}

function buildChannelPrompt(
  channel: string
) {

  if (channel === "email") {

    return `
EMAIL:

- полноценное письмо
- subject обязателен
- preheader обязателен
- короткие абзацы
- живой русский язык
- никаких HTML тегов
- естественная подача
- без корпоративного тона
`;
  }

  if (channel === "telegram") {

    return `
TELEGRAM:

- короткие абзацы
- сильный хук
- умеренные эмодзи
- визуальный ритм
- допускается **жирный текст**
- conversational стиль
- естественная подача
`;
  }

  return `
VK:

- storytelling
- эмоциональная подача
- дружелюбный стиль
- вовлечение
- вопрос аудитории
- естественный русский язык
`;
}

async function generateChannelContent({
  topic,
  context,
  variables,
  tone,
  channel
}: {
  topic: string;
  context: string;
  variables: any;
  tone?: string;
  channel: string;
}) {

  const systemPrompt = `
Вы —
сильный редактор медиа
и контент-стратег.

КРИТИЧЕСКИ ВАЖНО:

- весь текст только на русском языке
- английский язык запрещен
- HTML запрещен
- никаких пояснений
- никаких комментариев
- никакого AI wording
- никакого corporate tone

${buildChannelPrompt(channel)}

Никогда не используйте:

- [Имя]
- [Компания]
- [Ссылка]

Если данных не хватает —
придумайте реалистичные значения.
`;

  const userPrompt = `
ТЕМА:
${topic}

КОНТЕКСТ:
${context}

ПЕРЕМЕННЫЕ:
${JSON.stringify(
  variables || {},
  null,
  2
)}

ТОН:
${tone || "Дружелюбный"}

Верните JSON.

СТРУКТУРА:

{
  "subject": "",
  "preheader": "",
  "body": "",
  "cta": {
    "text": "",
    "link": "#"
  },
  "imagePrompt": ""
}
`;

  const completion =
    await openai.chat.completions.create({
      model: "gpt-4o",

      temperature: 0.9,

      response_format: {
        type: "json_object"
      },

      messages: [
        {
          role: "system",
          content: systemPrompt
        },

        {
          role: "user",
          content: userPrompt
        }
      ]
    });

  const content =
    completion.choices[0]
      .message.content;

  if (!content) {
    throw new Error(
      `Empty ${channel} response`
    );
  }

  return JSON.parse(content);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error:
        "Method Not Allowed"
    });
  }

  try {

    const {
      topic,
      context,
      variables,
      advanced,
      channels
    } = req.body;

    const normalizedChannels =
      normalizeChannels(
        channels
      );

    console.log(
      "[Newsletter API] Channels:",
      normalizedChannels
    );

    const generatedChannels =
      await Promise.all(

        normalizedChannels.map(
          async (channel) => {

            const content =
              await generateChannelContent({
                topic,
                context,
                variables,
                tone:
                  advanced?.tone,
                channel
              });

            return {
              id: channel,

              active: true,

              content: {
                subject:
                  content.subject ||
                  "",

                preheader:
                  content.preheader ||
                  "",

                body:
                  content.body ||
                  "",

                cta: {
                  text:
                    content.cta?.text ||
                    "Подробнее",

                  link:
                    content.cta?.link ||
                    "#"
                },

                imagePrompt:
                  content.imagePrompt ||
                  ""
              }
            };
          }
        )
      );

    const finalResult = {
      id:
        `campaign_${Date.now()}`,

      name:
        topic ||
        "Контент-кампания",

      strategy:
        "Кампания адаптирована под особенности каждой площадки.",

      channels:
        generatedChannels,

      variables:
        variables || {}
    };

    const validated =
      CampaignResultSchema.parse(
        finalResult
      );

    return res.status(200).json(
      validated
    );

  } catch (error: any) {

    console.error(
      "[Newsletter API ERROR]",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Newsletter generation failed"
    });
  }
}