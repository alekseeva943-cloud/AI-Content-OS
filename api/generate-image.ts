import { OpenAI } from "openai";
import type {
  VercelRequest,
  VercelResponse
} from "@vercel/node";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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

Стиль:
- современный
- cinematic
- атмосферный
- premium
- реалистичный
- визуально сильный
- без текста
- без watermark
- без логотипов
- без AI-artifacts
- без дешевого AI look

Изображение должно выглядеть
как работа сильного digital designer.
`;

  let platformStyle = "";

  if (normalized === "telegram") {
    platformStyle = `
Платформа: Telegram

Требования:
- сильный визуальный хук
- высокая контрастность
- mobile-first композиция
- эмоциональная подача
- cinematic lighting
- image-first storytelling
- хорошо смотрится в мобильной ленте
`;
  }

  if (normalized === "vk") {
    platformStyle = `
Платформа: VK

Требования:
- естественная сцена
- storytelling image
- эмоциональность
- дружелюбная атмосфера
- social-media aesthetic
- визуал для вовлечения
`;
  }

  if (normalized === "email") {
    platformStyle = `
Платформа: Email

Требования:
- editorial style
- premium minimalism
- clean composition
- focus point в центре
- спокойная композиция
- ощущение дорогого digital media
`;
  }

  return `
${baseStyle}

${platformStyle}

Контекст кампании:
${context || "Нет дополнительного контекста"}

Основная идея:
${prompt}

КРИТИЧЕСКИ ВАЖНО:
- никаких надписей
- никаких watermark
- никаких логотипов
- никаких текстовых элементов
- без AI distortions
- cinematic lighting
- high detail
- realistic composition
`;
}

function getImageSize(
  channel?: string
) {
  const normalized =
    normalizeChannel(channel);

  switch (normalized) {
    case "telegram":
      return "1024x1792";

    case "email":
      return "1792x1024";

    case "vk":
      return "1024x1024";

    default:
      return "1024x1024";
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method Not Allowed"
      });
    }

    const {
      prompt,
      channel,
      context
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required"
      });
    }

    const finalPrompt =
      buildPlatformPrompt({
        prompt,
        channel,
        context
      });

    console.log(
      "[IMAGE API] Channel:",
      channel
    );

    console.log(
      "[IMAGE API] Final Prompt:",
      finalPrompt
    );

    const response =
      await openai.images.generate({
        model: "gpt-image-1",

        prompt: finalPrompt,

        size: getImageSize(
          channel
        ),

        quality: "high"
      });

    const image =
      response.data?.[0];

    if (!image) {
      throw new Error(
        "No image returned"
      );
    }

    console.log(
      "[IMAGE API] Response:",
      JSON.stringify(
        image,
        null,
        2
      )
    );

    if (image.b64_json) {
      return res.status(200).json({
        success: true,

        type: "base64",

        imageBase64:
          image.b64_json,

        revisedPrompt:
          finalPrompt
      });
    }

    return res.status(200).json({
      success: true,

      type: "url",

      url: image.url || null,

      revisedPrompt:
        finalPrompt
    });

  } catch (error: any) {
    console.error(
      "[IMAGE API ERROR]",
      error
    );

    return res.status(500).json({
      success: false,

      error:
        error.message ||
        "Image generation failed"
    });
  }
}