// ============================================
// FILE: api/campaign-detect.ts
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

// ============================================
// NORMALIZE CHANNELS
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
// MAIN HANDLER
// ============================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {

  if (
    req.method !== "POST"
  ) {

    return res.status(405).json({
      error:
        "Method Not Allowed"
    });
  }

  try {

    const {
      topic,
      context
    } = req.body;

    // ============================================
    // VALIDATION
    // ============================================

    if (!topic) {

      return res.status(400).json({
        error:
          "Topic is required"
      });
    }

    // ============================================
    // SYSTEM PROMPT
    // ============================================

    const systemPrompt = `
Вы —
AI-система анализа контент-кампаний.

Ваша задача:

определить,
какие данные НУЖНЫ,
чтобы создать полностью готовую рассылку
БЕЗ placeholder'ов.

КРИТИЧЕСКИ ВАЖНО:

Никогда не оставляйте:
- [Имя]
- [Компания]
- [Ссылка]
- [Дата]
- [Цена]

Вместо этого:
определите,
какие переменные нужно запросить у пользователя заранее.

==================================================
ЧТО НУЖНО АНАЛИЗИРОВАТЬ
==================================================

- название компании
- имя автора
- продукт
- ссылка
- дата мероприятия
- цена
- дедлайн
- промокод
- город
- аудитория
- тариф
- бонус
- оффер
- название курса
- название вебинара
- имя эксперта
- контакты
- телефон
- сайт

==================================================
ПРАВИЛА
==================================================

- не добавляйте лишние поля
- не дублируйте поля
- используйте snake_case id
- labels только на русском языке
- description только на русском языке
- type:
  - text
  - url
  - number
  - date

- importance:
  - critical
  - optional

==================================================
КАНАЛЫ
==================================================

Также определите,
какие каналы лучше подходят:

- email
- telegram
- vk

==================================================
ФОРМАТ ОТВЕТА
==================================================

Верните СТРОГО JSON.

{
  "requirements": [
    {
      "id": "company_name",
      "label": "Название компании",
      "description": "Название бренда или компании",
      "type": "text",
      "importance": "critical"
    }
  ],

  "suggestedChannels": [
    "telegram",
    "vk"
  ]
}

Никакого текста вне JSON.
`;

    // ============================================
    // USER PROMPT
    // ============================================

    const userPrompt = `
ТЕМА:
${topic}

КОНТЕКСТ:
${context || "Нет дополнительного контекста"}

Проанализируйте:
какие данные нужны,
чтобы создать полностью готовую контент-кампанию.
`;

    // ============================================
    // OPENAI
    // ============================================

    const completion =
      await openai.chat.completions.create({
        model:
          "gpt-4o",

        temperature:
          0.3,

        response_format: {
          type:
            "json_object"
        },

        messages: [
          {
            role:
              "system",

            content:
              systemPrompt
          },

          {
            role:
              "user",

            content:
              userPrompt
          }
        ]
      });

    const content =
      completion.choices[0]
        .message.content;

    if (!content) {

      throw new Error(
        "Empty discovery response"
      );
    }

    // ============================================
    // PARSE
    // ============================================

    const parsed =
      JSON.parse(content);

    // ============================================
    // SAFE NORMALIZATION
    // ============================================

    const requirements =
      Array.isArray(
        parsed.requirements
      )
        ? parsed.requirements
            .map((r: any) => ({
              id:
                String(
                  r.id ||
                  ""
                )
                  .toLowerCase()
                  .trim()
                  .replace(
                    /\s+/g,
                    "_"
                  ),

              label:
                r.label ||
                "Поле",

              description:
                r.description ||
                "",

              type:
                [
                  "text",
                  "url",
                  "number",
                  "date"
                ].includes(r.type)
                  ? r.type
                  : "text",

              importance:
                r.importance ===
                "optional"
                  ? "optional"
                  : "critical"
            }))
            .filter(
              (r: any) =>
                r.id
            )
        : [];

    const suggestedChannels =
      normalizeChannels(
        parsed.suggestedChannels
      );

    // ============================================
    // DEFAULT VARIABLES
    // ============================================

    const hasCompany =
      requirements.some(
        (r: any) =>
          r.id ===
          "company_name"
      );

    if (!hasCompany) {

      requirements.unshift({
        id:
          "company_name",

        label:
          "Название компании",

        description:
          "Название бренда или компании",

        type:
          "text",

        importance:
          "critical"
      });
    }

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(200).json({
      requirements,
      suggestedChannels
    });

  } catch (error: any) {

    console.error(
      "[CAMPAIGN DETECT ERROR]",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Campaign detection failed"
    });
  }
}