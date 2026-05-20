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

// ============================================
// CHANNEL NORMALIZATION
// ============================================

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

// ============================================
// CHANNEL PROMPTS
// ============================================

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

// ============================================
// IMAGE SIZE
// ============================================

function getImageSize(

  // ============================================
  // CONTENT GENERATION
  // ============================================

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

Также создайте imagePrompt
для генерации изображения.

ImagePrompt должен:

- быть на английском языке
- быть подробным
- cinematic style
- realistic
- no text
- no watermark
- premium composition
- platform aware
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

  console.log(
    `[CONTENT] GENERATING ${channel}`
  );

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

  const parsed =
    JSON.parse(content);

  console.log(
    `[CONTENT] SUCCESS ${channel}`
  );

  return parsed;
}

// ============================================
// IMAGE GENERATION
// ============================================

async function generateImage({
  prompt,
  channel
}: {
  prompt: string;
  channel: string;
}) {

  try {

    console.log(
      `[IMAGE] GENERATING ${channel}`
    );

    const response =
      await openai.images.generate({
        model: "gpt-image-1",

        prompt,

        size:
          getImageSize(
            channel
          ),

        quality: "high"
      });

    const image =
      response.data?.[0];

    if (!image) {

      console.error(
        `[IMAGE] EMPTY ${channel}`
      );

      return "";
    }

    // ============================================
    // BASE64 RESPONSE
    // ============================================

    if (image.b64_json) {

      console.log(
        `[IMAGE] BASE64 SUCCESS ${channel}`
      );

      return `data:image/png;base64,${image.b64_json}`;
    }

    // ============================================
    // URL RESPONSE
    // ============================================

    if (image.url) {

      console.log(
        `[IMAGE] URL SUCCESS ${channel}`
      );

      return image.url;
    }

    return "";

  } catch (err) {

    console.error(
      `[IMAGE ERROR ${channel}]`,
      err
    );

    return "";
  }
}

// ============================================
// MAIN HANDLER
// ============================================

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

    // ============================================
    // GENERATE CHANNELS
    // ============================================

    const generatedChannels =
      await Promise.all(

        normalizedChannels.map(
          async (channel) => {

            // ============================================
            // CONTENT
            // ============================================

            const content =
              await generateChannelContent({
                topic,
                context,
                variables,
                tone:
                  advanced?.tone,
                channel
              });

            // ============================================
            // IMAGE
            // ============================================

            let imageUrl = "";

            if (
              content.imagePrompt
            ) {

              imageUrl =
                await generateImage({
                  prompt:
                    content.imagePrompt,

                  channel
                });
            }

            // ============================================
            // RETURN
            // ============================================

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
                  "",

                imageUrl:
                  imageUrl || ""
              }
            };
          }
        )
      );

    // ============================================
    // FINAL RESULT
    // ============================================

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

    console.log(
      "[NEWSLETTER] SUCCESS"
    );

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