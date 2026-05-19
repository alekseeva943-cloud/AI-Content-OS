import { OpenAI } from "openai";
import type {
  VercelRequest,
  VercelResponse
} from "@vercel/node";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function buildPlatformPrompt({
  prompt,
  channel,
  context
}: {
  prompt: string;
  channel?: string;
  context?: string;
}) {
  const baseStyle = `
Создай профессиональное изображение
для контент-кампании.

Стиль:
- современный,
- cinematic,
- атмосферный,
- premium,
- реалистичный,
- визуально сильный,
- без текста на изображении,
- без watermark,
- без AI-artifacts,
- без дешевого AI look.

Изображение должно выглядеть:
как работа сильного digital designer.
`;

  const telegramStyle = `
Платформа: Telegram

Требования:
- сильный визуальный хук,
- высокая контрастность,
- эмоциональная композиция,
- image-first storytelling,
- хорошо смотрится в мобильной ленте,
- вертикальный визуальный акцент,
- clean composition.
`;

  const vkStyle = `
Платформа: VK

Требования:
- более социальный стиль,
- storytelling image,
- эмоциональность,
- естественные сцены,
- дружелюбная атмосфера,
- визуал для вовлечения аудитории.
`;

  const emailStyle = `
Платформа: Email

Требования:
- editorial style,
- clean marketing visual,
- premium newsletter aesthetic,
- спокойная композиция,
- focus point в центре,
- минимализм,
- ощущение дорогого digital media.
`;

  let platformBlock = emailStyle;

  if (channel === "telegram") {
    platformBlock = telegramStyle;
  }

  if (channel === "vk") {
    platformBlock = vkStyle;
  }

  return `
${baseStyle}

${platformBlock}

Контекст кампании:
${context || "Нет дополнительного контекста"}

Основная идея:
${prompt}

КРИТИЧЕСКИ ВАЖНО:
- никаких надписей,
- никаких логотипов,
- никаких watermark,
- никакого текста внутри изображения,
- без AI distortions,
- без лишних деталей,
- cinematic lighting,
- high quality composition.
`;
}

function getImageSize(channel?: string) {
  switch (channel) {
    case "telegram":
      return "1024x1792";

    case "vk":
      return "1024x1024";

    case "email":
      return "1792x1024";

    default:
      return "1024x1024";
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  try {
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
      "[Image API] Channel:",
      channel
    );

    console.log(
      "[Image API] Final prompt:",
      finalPrompt
    );

    const response =
      await openai.images.generate({
        model: "gpt-image-1",

        prompt: finalPrompt,

        size: getImageSize(channel),

        quality: "high"
      });

    const image =
      response.data?.[0];

    if (!image) {
      throw new Error(
        "No image returned"
      );
    }

    return res.status(200).json({
      url: image.url || null,

      revisedPrompt:
        finalPrompt
    });

  } catch (error: any) {
    console.error(
      "[Image API ERROR]",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Image generation failed"
    });
  }
}