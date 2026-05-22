// ============================================
// FILE: src/services/newsletter/generateChannelContent.ts
// ============================================

import { OpenAI } from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// ============================================
// CHANNEL PROMPTS
// ============================================

function buildChannelPrompt(
  channel: string
): string {

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
// CONTENT GENERATION
// ============================================

export async function generateChannelContent({
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
}): Promise<any> {

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

  const client = getOpenAI();
  const completion =
    await client.chat.completions.create({
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

  let parsed: any = {};

  try {

    parsed =
      JSON.parse(content);

  } catch (err) {

    console.error(
      '[JSON PARSE ERROR]',
      content
    );

    throw new Error(
      'AI returned invalid JSON'
    );
  }

  console.log(
    `[CONTENT] SUCCESS ${channel}`
  );

  if (!parsed.imagePrompt || typeof parsed.imagePrompt !== "string" || !parsed.imagePrompt.trim()) {
    const fallbackPrompts: Record<string, string> = {
      email: `Professional editorial email campaign visual about "${topic || "business concept"}", premium commercial newsletter aesthetic, sleek graphic design, clean layout, no text`,
      telegram: `High-quality engaging cinematic visual for Telegram post about "${topic || "lifestyle and business"}", modern editorial photography, vibrant colors, no text, premium wallpaper`,
      vk: `Friendly engaging storytelling visual for VKontakte post about "${topic || "events and community"}", warm atmosphere, interactive layout, realistic photography, no text`
    };
    parsed.imagePrompt = fallbackPrompts[channel] || `Professional high-quality digital illustration about "${topic || "news"}", premium artistic style, no text, no watermark`;
    console.log(`[CONTENT] Created fallback imagePrompt for ${channel}: ${parsed.imagePrompt}`);
  }

  return parsed;
}
