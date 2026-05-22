import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const reqStart = Date.now();
  console.log(`[VERCEL PODCAST ROUTE] Incoming request: ${req.method} ${req.url}`);

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      status: 405,
      error: "Method Not Allowed. Use POST."
    });
  }

  let outputText: string | undefined = undefined;

  try {
    const { topic, durationMinutes, guestEnabled, guest } = req.body;

    if (!topic) {
      console.warn("[VERCEL PODCAST ROUTE] High-level Validation Failure: topic missing.");
      return res.status(400).json({
        success: false,
        status: 400,
        stage: "collect_config",
        error: "Тема подкаста обязательна"
      });
    }

    const ai = getAI();
    const parsedDuration = Number(durationMinutes) || 5;

    const sysMessage = `Ты — лучший генератор сценариев для профессиональных подкастов на русском языке.
Твоя задача — составить подробный, реалистичный сценарий выпуска подкаста с таймингами, репликами и структурой.
Общая длительность выпуска: около ${parsedDuration} минут.
Гость активен: ${guestEnabled ? "Да" : "Нет"}.
${guestEnabled && guest ? `Информация о госте: Имя "${guest.name}", Экспертиза "${guest.expertise}", Стиль общения "${guest.speakingStyle || "обычный"}", Энергетика: ${guest.energyLevel}/10.` : ""}

Сценарий должен состоять из следующих секторов в хронологическом порядке:
1. hook (цепляющее начало)
2. intro (введение темы)
3. discussion (блоки обсуждения вопросов/тем)
4. questions (вопросы гостю, если гость включен)
5. transition (переходы между частями сценария)
6. outro (подведение итогов выпуска)
7. cta (призыв к действию)

Важно:
- Каждая реплика/сегмент должна иметь спикера: 'host' (ведущий) или 'guest' (гость, если включен).
- Каждая часть должна содержать интересную, глубокую и содержательную информацию на тему "${topic}".
- Длина сценария, глубина проработки и количество диалогов должны ЧЕТКО масштабироваться на ${parsedDuration} минут выпуска. Чем больше минут, тем глубже и длиннее раскрываются темы в сценарии.
- Верни ответ строго в формате JSON в соответствии с указанной схемой. Все текстовые поля заполняй на русском языке.`;

    const userPrompt = `Создай полноценный сценарий подкаста на тему "${topic}".
Гость: ${guestEnabled && guest ? `${guest.name} (${guest.expertise})` : "нет гостя, одиночный выпуск ведущего"}.
Целевая длительность выпуска: ${parsedDuration} мин.`;

    console.log(`[VERCEL PODCAST ROUTE] Dispatching Gemini-3.5-Flash generateContent API request...`);

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: sysMessage,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Привлекательное название выпуска подкаста"
              },
              description: {
                type: Type.STRING,
                description: "Краткое описание выпуска для слушателей"
              },
              summary: {
                type: Type.STRING,
                description: "Главный вывод или суть этой дискуссии"
              },
              script: {
                type: Type.ARRAY,
                description: "Последовательные смысловые сегменты подкаста",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: {
                      type: Type.STRING,
                      description: "Тип сегмента: 'hook', 'intro', 'discussion', 'transition', 'question', 'outro', 'cta'"
                    },
                    speaker: {
                      type: Type.STRING,
                      description: "Кто говорит: 'host' или 'guest'"
                    },
                    speakerName: {
                      type: Type.STRING,
                      description: "Отображаемое имя говорящего (например, Ведущий или имя Гостя)"
                    },
                    title: {
                      type: Type.STRING,
                      description: "Короткое название этой сцены/части"
                    },
                    text: {
                      type: Type.STRING,
                      description: "Полная реплика спикера для озвучки. Текст должен быть естественным, живым, без разметки и без скобочек"
                    },
                    durationSeconds: {
                      type: Type.INTEGER,
                      description: "Длительность реплики в секундах"
                    }
                  },
                  required: ["id", "type", "speaker", "speakerName", "title", "text", "durationSeconds"]
                }
              }
            },
            required: ["title", "description", "summary", "script"]
          }
        }
      });
    } catch (providerErr: any) {
      console.error("[VERCEL PODCAST ROUTE] [PROVIDER ERROR] Gemini Request Rejected:", providerErr);
      throw providerErr;
    }

    outputText = response.text;
    console.log(`[VERCEL PODCAST ROUTE] Gemini response received in ${Date.now() - reqStart}ms.`);

    if (!outputText) {
      console.error("[VERCEL PODCAST ROUTE] Provider empty response detected!");
      throw new Error("Empty AI response generated for podcast script (Empty Raw Response)");
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(outputText);
      console.log(`[VERCEL PODCAST ROUTE] Parsing successful! script elements: ${parsedJson.script?.length || 0}`);
    } catch (parseSyntaxErr: any) {
      console.error("[VERCEL PODCAST ROUTE] Syntax JSON parsing exception on text:", outputText);
      throw parseSyntaxErr;
    }

    res.status(200).json(parsedJson);

  } catch (err: any) {
    console.error("[VERCEL PODCAST ROUTE] Global exception caught:", err);

    let statusCode = 500;
    let finalErrorMessage = err.message || "Ошибка генерации куска сценария подкаста";
    let errorDetails = err.stack || err.toString();

    const lowerMsg = (err.message || "").toLowerCase();

    if (lowerMsg.includes("api_key") || lowerMsg.includes("api key") || lowerMsg.includes("unauthorized") || lowerMsg.includes("401")) {
      statusCode = 401;
      finalErrorMessage = "401 Unauthorized API Key: Ошибка авторизации Gemini API. Убедитесь, что ваш GEMINI_API_KEY настроен правильно на сервере.";
    } else if (lowerMsg.includes("quota") || lowerMsg.includes("429") || lowerMsg.includes("resource_exhausted") || lowerMsg.includes("rate limit")) {
      statusCode = 429;
      finalErrorMessage = "429 Rate Limit Exceeded / Overloaded: Достигнут лимит запросов или квота Gemini API. Попробуйте еще раз позже.";
    } else if (lowerMsg.includes("overloaded") || lowerMsg.includes("503") || lowerMsg.includes("unavailable") || lowerMsg.includes("timeout")) {
      statusCode = 503;
      finalErrorMessage = "503 Gemini Service Unavailable / Timeout: ИИ-провайдер временно перегружен или таймаут ожидания. Пожалуйста, отправьте запрос повторно через несколько секунд.";
    } else if (err instanceof SyntaxError) {
      statusCode = 422;
      finalErrorMessage = `MALFORMED_JSON (Unexpected token in JSON): Ошибка разбора возвращенного ИИ результата. ИИ сгенерировал невалидный JSON: ${err.message}`;
    } else if (lowerMsg.includes("empty ai response")) {
      statusCode = 502;
      finalErrorMessage = "Empty AI response: Провайдер вернул пустую строку в качестве результата сценария подкаста.";
    }

    res.status(statusCode).json({
      success: false,
      status: statusCode,
      stage: err instanceof SyntaxError ? "parse_structure" : "wait_response",
      error: finalErrorMessage,
      details: errorDetails,
      rawResponse: outputText || undefined,
      stack: err.stack || err.toString()
    });
  }
}
