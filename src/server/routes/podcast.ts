import { Router } from "express";
import { GoogleGenAI, Type } from "@google/genai";

const router = Router();

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set on the server.");
    }
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

router.post("/api/podcast/generate", async (req, res) => {
  try {
    const { topic, durationMinutes, guestEnabled, guest } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Тема подкаста обязательна" });
    }

    const ai = getAI();
    
    // Adjust script segments and complexity according to duration
    let segmentsCount = 5;
    if (durationMinutes > 15) {
      segmentsCount = 10;
    } else if (durationMinutes > 5) {
      segmentsCount = 7;
    }

    const sysMessage = `Ты — лучший генератор сценариев для профессиональных подкастов на русском языке.
Твоя задача — составить подробный, реалистичный сценарий выпуска подкаста с таймингами, репликами и структурой.
Общая длительность выпуска: около ${durationMinutes} минут.
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
- Длина сценария, глубина проработки и количество диалогов должны ЧЕТКО масштабироваться на ${durationMinutes} минут выпуска. Чем больше минут, тем глубже и длиннее раскрываются темы в сценарии.
- Верни ответ строго в формате JSON в соответствии с указанной схемой. Все текстовые поля заполняй на русском языке.`;

    const userPrompt = `Создай полноценный сценарий подкаста на тему "${topic}".
Гость: ${guestEnabled && guest ? `${guest.name} (${guest.expertise})` : "нет гостя, одиночный выпуск ведущего"}.
Целевая длительность выпуска: ${durationMinutes} мин.`;

    console.log(`[PODCAST ROUTE] Generating podcast script for topic: "${topic}", duration: ${durationMinutes} mins.`);

    const response = await ai.models.generateContent({
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

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Empty AI response generated for podcast script");
    }

    const parsed = JSON.parse(outputText);
    res.json(parsed);

  } catch (err: any) {
    console.error("[PODCAST GENERATE ERROR]", err);
    res.status(500).json({ error: err.message || "Ошибка генерации куска сценария" });
  }
});

router.post("/api/podcast/synthesize", async (req, res) => {
  try {
    const { text, voiceId, apiKey } = req.body;

    if (!text || !voiceId) {
      return res.status(400).json({ error: "Missing required text or voiceId parameters" });
    }

    if (!apiKey) {
      return res.status(400).json({ error: "Адресный ключ ElevenLabs API не найден или пуст" });
    }

    console.log(`[PODCAST ROUTE] Proxying ElevenLabs synthesis for voice ID: ${voiceId}`);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[ElevenLabs synthesis HTTP error]", errText);
      return res.status(response.status).send(errText || "ElevenLabs synthesis failed");
    }

    // Set appropriate headers and pipe the stream to the client
    res.setHeader('Content-Type', 'audio/mpeg');
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);

  } catch (err: any) {
    console.error("[PODCAST SYNTHESIZE ERROR]", err);
    res.status(500).json({ error: err.message || "Synthesis error occurred" });
  }
});

export default router;
