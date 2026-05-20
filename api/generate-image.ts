// ============================================
// FILE: api/generate-image.ts
// ============================================

import { OpenAI } from "openai";

import type {
  VercelRequest,
  VercelResponse
} from "@vercel/node";

const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY
});

function normalizeChannel(
  channel?: string
) {

  const value =
    String(channel || "")
      .toLowerCase()
      .trim();

  if (
    value === "telegram" ||
    value === "tg"
  ) {
    return "telegram";
  }

  if (
    value === "vk" ||
    value === "vkontakte"
  ) {
    return "vk";
  }

  if (
    value === "email" ||
    value === "mail"
  ) {
    return "email";
  }

  return "telegram";
}

function getImageSize(
  channel?: string
) {

  const normalized =
    normalizeChannel(channel);

  switch (normalized) {

    // MOBILE VERTICAL
    case "telegram":
      return "1024x1536";

    // WIDE BANNER
    case "email":
      return "1536x1024";

    // SOCIAL SQUARE
    case "vk":
      return "1024x1024";

    default:
      return "1024x1024";
  }
}

function buildPlatformPrompt({
  prompt,
  channel,
  context
}: {
  prompt: string;
  channel?: string;
  context?: string;
}) {

  const normalized =
    normalizeChannel(channel);

  const baseStyle = `
Создай профессиональное изображение
для контент-кампании.

КРИТИЧЕСКИ ВАЖНО:

- без текста
- без логотипов
- без watermark
- без интерфейсов
- без коллажей
- без дешевого AI look
- без искажений лица
- без лишних деталей
- без typography

Стиль:

- cinematic
- premium
- realistic
- atmospheric
- visually strong
- clean composition
- high detail
- realistic lighting

Изображение должно выглядеть
как работа сильного digital designer
и premium media studio.
`;

  let platformStyle = "";

  // ============================================
  // TELEGRAM
  // ============================================

  if (
    normalized === "telegram"
  ) {

    platformStyle = `
ПЛАТФОРМА: TELEGRAM

ТРЕБОВАНИЯ:

- вертикальная композиция
- mobile-first визуал
- сильный визуальный хук
- эмоциональная сцена
- высокая контрастность
- cinematic lighting
- image-first storytelling
- фокус на одном главном объекте
- хорошо смотрится в мобильной ленте
`;
  }

  // ============================================
  // VK
  // ============================================

  if (
    normalized === "vk"
  ) {

    platformStyle = `
ПЛАТФОРМА: VK

ТРЕБОВАНИЯ:

- storytelling image
- естественная сцена
- дружелюбная атмосфера
- эмоциональность
- social-media aesthetic
- реалистичная композиция
- визуал для вовлечения
`;
  }

  // ============================================
  // EMAIL
  // ============================================

  if (
    normalized === "email"
  ) {

    platformStyle = `
ПЛАТФОРМА: EMAIL

ТРЕБОВАНИЯ:

- editorial style
- premium newsletter aesthetic
- clean composition
- focus point в центре
- дорогой визуальный стиль
- минимализм
- wide banner composition
- спокойная cinematic сцена
`;
  }

  return `
${baseStyle}

${platformStyle}

КОНТЕКСТ КАМПАНИИ:

${context || "Нет дополнительного контекста"}

ОСНОВНАЯ ИДЕЯ:

${prompt}

ФИНАЛЬНЫЕ ТРЕБОВАНИЯ:

- realistic composition
- premium quality
- cinematic lighting
- ultra detailed
- modern visual language
- photorealistic
- visually clean
`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {

  try {

    if (
      req.method !== "POST"
    ) {

      return res
        .status(405)
        .json({
          success: false,
          error:
            "Method Not Allowed"
        });
    }

    const {
      prompt,
      channel,
      context
    } = req.body;

    if (!prompt) {

      return res
        .status(400)
        .json({
          success: false,
          error:
            "Prompt is required"
        });
    }

    const normalizedChannel =
      normalizeChannel(
        channel
      );

    const imageSize =
      getImageSize(
        normalizedChannel
      );

    const finalPrompt =
      buildPlatformPrompt({
        prompt,
        channel:
          normalizedChannel,
        context
      });

    console.log(
      "[IMAGE API] CHANNEL:",
      normalizedChannel
    );

    console.log(
      "[IMAGE API] SIZE:",
      imageSize
    );

    console.log(
      "[IMAGE API] PROMPT:",
      finalPrompt
    );

    // ============================================
    // OPENAI IMAGE GENERATION
    // ============================================

    const response =
      await openai.images.generate({
        model:
          "gpt-image-1",

        prompt:
          finalPrompt,

        size:
          imageSize,

        quality:
          "high"
      });

    const image =
      response.data?.[0];

    if (!image) {

      throw new Error(
        "No image returned from OpenAI"
      );
    }

    console.log(
      "[IMAGE API] SUCCESS"
    );

    // ============================================
    // BASE64 MODE
    // ============================================

    if (
      image.b64_json
    ) {

      return res
        .status(200)
        .json({
          success: true,

          type:
            "base64",

          imageBase64:
            image.b64_json,

          revisedPrompt:
            finalPrompt,

          channel:
            normalizedChannel,

          size:
            imageSize
        });
    }

    // ============================================
    // URL MODE
    // ============================================

    return res
      .status(200)
      .json({
        success: true,

        type:
          "url",

        url:
          image.url || null,

        revisedPrompt:
          finalPrompt,

        channel:
          normalizedChannel,

        size:
          imageSize
      });

  } catch (error: any) {

    console.error(
      "[IMAGE API ERROR]",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        error:
          error?.message ||
          "Image generation failed"
      });
  }
}