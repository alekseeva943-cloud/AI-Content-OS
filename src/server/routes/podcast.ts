import { Router } from "express";
import { OpenAI } from "openai";

const router = Router();

// Lazy initialization of OpenAI
let openaiClient: OpenAI | null = null;
function getOpenAI() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("OPENAI_API_KEY is not set on the server.");
    }
    openaiClient = new OpenAI({
      apiKey: apiKey || ""
    });
  }
  return openaiClient;
}

router.post("/api/podcast/generate", async (req, res) => {
  const reqStart = Date.now();
  console.log(`[SERVER PODCAST ROUTE] [1/5] Incoming request at ${new Date().toISOString()}`);
  console.log(`[SERVER PODCAST ROUTE] Body configurations -> Topic: "${req.body.topic}", Duration: ${req.body.durationMinutes} mins, Guest: ${req.body.guestEnabled}`);

  let outputText: string | undefined = undefined;
  try {
    const { topic, durationMinutes, guestEnabled, guest } = req.body;

    if (!topic) {
      console.warn("[SERVER PODCAST ROUTE] High-level Validation Failure: topic missing.");
      return res.status(400).json({ status: 400, success: false, stage: "collect_config", error: "Тема подкаста обязательна" });
    }

    const ai = getOpenAI();
    
    // Adjust script segments and complexity according to duration
    let segmentsCount = 5;
    if (durationMinutes > 15) {
      segmentsCount = 10;
    } else if (durationMinutes > 5) {
      segmentsCount = 7;
    }

    const sysMessage = `Ты — лучший генератор сценариев для профессиональных подкастов на русском языке.
Твоя задача — составить подробный, реалистичный сценарий выпуска подкаста с таймингами, репликами и структурой в формате JSON.
Общая длительность выпуска: около ${durationMinutes} минут.
Гость активен: ${guestEnabled ? "Да" : "нет"}.
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
- Сценарий должен быть СВЕРХ-ЕСТЕСТВЕННЫМ и ЖИВЫМ. Это устная речь, а не учебник! Пожалуйста, используй живой разговорный русский язык (conversational Russian), короткие паузы ("...", "—"), уместные перебивания и незаконченные мысли.
- Обязательно добавляй маркеры устной речи и реакции: "угу", "слушай", "хм...", "слушай, а ведь интересно", "да-да, абсолютно", "вот это важно!", "смотри", "погоди, но ведь...". Сделай так, чтобы диалог звучал как беседа двух по-настоящему увлеченных людей, а не роботов.
- Избегай академической сухости, канцелярского стиля и шаблонного обмена длинными идеальными абзацами.
- Верни ответ СТРОГО в формате JSON. Все текстовые поля заполняй на русском языке.

Схема JSON, которую ТЫ ДОЛЖЕН СТРОГО вернуть:
{
  "title": "Привлекательное название выпуска подкаста",
  "description": "Краткое описание выпуска для слушателей",
  "summary": "Главный вывод или суть этой дискуссии",
  "script": [
    {
      "id": "строка с уникальным id",
      "type": "тип сегмента: 'hook', 'intro', 'discussion', 'transition', 'question', 'outro', 'cta'",
      "speaker": "кто говорит: 'host' или 'guest'",
      "speakerName": "отображаемое имя говорящего (например, Ведущий или имя Гостя)",
      "title": "короткое название этой сцены/части",
      "text": "полная реплика спикера для озвучки. Текст должен быть естественным, живым, без разметки и без скобочек",
      "durationSeconds": целое число в секундах
    }
  ]
}`;

    const userPrompt = `Создай полноценный сценарий подкаста на тему "${topic}".
Гость: ${guestEnabled && guest ? `${guest.name} (${guest.expertise})` : "нет гостя, одиночный выпуск ведущего"}.
Целевая длительность выпуска: ${durationMinutes} мин.`;

    console.log("[OPENAI CONFIG]");
    console.log({
      hasKey: !!process.env.OPENAI_API_KEY,
      keyPrefix: process.env.OPENAI_API_KEY?.slice(0, 7),
    });

    console.log(`[SERVER PODCAST ROUTE] [2/5] Dispatching OpenAI Chat Completion (GPT-4o) request...`);
    console.log(`[SERVER PODCAST ROUTE] System Instruction Wordcount: ${sysMessage.split(' ').length}, User Prompt Length: ${userPrompt.length}`);

    let response;
    try {
      response = await ai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.75,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: sysMessage },
          { role: "user", content: userPrompt }
        ]
      });
    } catch (providerErr: any) {
      console.error("[SERVER PODCAST ROUTE] [PROVIDER ERROR] OpenAI Request Rejected:", providerErr);
      console.error({
        status: providerErr?.status,
        statusCode: providerErr?.statusCode,
        code: providerErr?.code,
        type: providerErr?.type,
        message: providerErr?.message,
        headers: providerErr?.headers || providerErr?.response?.headers
      });
      throw providerErr;
    }

    outputText = response.choices[0]?.message?.content || "";
    console.log(`[SERVER PODCAST ROUTE] [3/5] OpenAI Provider response received in ${Date.now() - reqStart}ms.`);
    console.log(`[SERVER PODCAST ROUTE] Output text length: ${outputText ? outputText.length : 0} bytes.`);

    if (!outputText) {
      console.error("[SERVER PODCAST ROUTE] Provider empty response detected!");
      throw new Error("Empty AI response generated for podcast script (Empty Raw Response)");
    }

    console.log(`[SERVER PODCAST ROUTE] [4/5] Parsing returned raw output text via JSON.parse ...`);
    let parsedJson;
    try {
      parsedJson = JSON.parse(outputText);
      console.log(`[SERVER PODCAST ROUTE] [5/5] Parsing successful! Dispatched script elements: ${parsedJson.script?.length || 0}`);
    } catch (parseSyntaxErr: any) {
      console.error("[SERVER PODCAST ROUTE] Syntax JSON parsing exception on text:", outputText);
      throw parseSyntaxErr;
    }

    const duration = Date.now() - reqStart;
    const promptLength = sysMessage.length + userPrompt.length;
    const responseLength = outputText ? outputText.length : 0;

    const promptTokens = response?.usage?.prompt_tokens || Math.ceil(promptLength * 0.45);
    const completionTokens = response?.usage?.completion_tokens || Math.ceil(responseLength * 0.45);
    const totalTokens = response?.usage?.total_tokens || (promptTokens + completionTokens);
    const estimatedCost = (promptTokens * 0.0000025) + (completionTokens * 0.0000100);

    const trigger = req.body.trigger || "manual_generate";
    const sessionId = req.body.sessionId || "podcast_studio";
    
    // Pure checksum of request content as request hash
    let requestHash = "unknown";
    try {
      const crypto = require("crypto");
      requestHash = crypto.createHash("md5")
        .update(`${topic}-${durationMinutes}-${guestEnabled}-${JSON.stringify(guest || {})}`)
        .digest("hex")
        .substring(0, 12);
    } catch {
      requestHash = String(topic.length) + String(durationMinutes);
    }

    console.log(`
┌────────────────────────────────────────────────────────┐
│ [OPENAI REQUEST]
├────────────────────────────────────────────────────────┤
│ route:             /api/podcast/generate
│ model:             gpt-4o
│ inputTokens:       ${promptTokens}
│ outputTokens:      ${completionTokens}
│ totalTokens:       ${totalTokens}
│ estimatedCost:     $${estimatedCost.toFixed(5)}
│ duration:          ${duration}ms
│ trigger:           ${trigger}
│ requestHash:       ${requestHash}
│ session:           ${sessionId}
└────────────────────────────────────────────────────────┘
    `);

    if (parsedJson && typeof parsedJson === "object") {
      parsedJson.usage = {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        estimatedCost: estimatedCost,
        durationMs: duration,
        requestHash: requestHash,
        requestId: "req_" + Math.random().toString(36).substring(2, 11),
        timestamp: new Date().toLocaleTimeString('ru-RU')
      };
    }

    res.json(parsedJson);

  } catch (err: any) {
    console.error("[SERVER PODCAST ROUTE] Thrown global exception caught:", err);
    
    let statusCode = 500;
    let finalErrorMessage = err.message || "Ошибка генерации куска сценария подкаста";
    let errorDetails = err.stack || err.toString();

    const lowerMsg = (err.message || "").toLowerCase();

    // Trace error classification & categorization
    if (lowerMsg.includes("api_key") || lowerMsg.includes("api key") || lowerMsg.includes("unauthorized") || lowerMsg.includes("401")) {
      statusCode = 401;
      finalErrorMessage = "401 Unauthorized API Key: Ошибка авторизации OpenAI API. Убедитесь, что ваш OPENAI_API_KEY настроен правильно на сервере.";
    } else if (
      err.status === 429 || 
      err.statusCode === 429 || 
      err.code === "insufficient_quota" || 
      err.type === "insufficient_quota" || 
      lowerMsg.includes("insufficient_quota") || 
      lowerMsg.includes("quota_exceeded") || 
      lowerMsg.includes("quota exceeded")
    ) {
      statusCode = 429;
      finalErrorMessage = "Баланс OpenAI API исчерпан";
    } else if (
      lowerMsg.includes("rate_limit") || 
      lowerMsg.includes("rate limit") || 
      err.code === "rate_limit_exceeded" || 
      lowerMsg.includes("429") || 
      lowerMsg.includes("resource_exhausted")
    ) {
      statusCode = 429;
      finalErrorMessage = "Слишком много запросов, попробуйте через несколько секунд";
    } else if (lowerMsg.includes("overloaded") || lowerMsg.includes("503") || lowerMsg.includes("unavailable") || lowerMsg.includes("timeout")) {
      statusCode = 503;
      finalErrorMessage = "503 OpenAI Service Unavailable / Timeout: ИИ-провайдер временно перегружен или таймаут ожидания. Пожалуйста, отправьте запрос повторно через несколько секунд.";
    } else if (err instanceof SyntaxError) {
      statusCode = 422;
      finalErrorMessage = `MALFORMED_JSON (Unexpected token in JSON): Ошибка разбора возвращенного ИИ результата. ИИ сгенерировал невалидный JSON: ${err.message}`;
    } else if (lowerMsg.includes("empty ai response")) {
      statusCode = 502;
      finalErrorMessage = "Empty AI response: Провайдер вернул пустую строку в качестве результата сценария подкаста.";
    }

    console.error(`[SERVER PODCAST ROUTE] Custom response dispatched with status ${statusCode}. Error: "${finalErrorMessage}"`);

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
});

router.post("/api/podcast/synthesize", async (req, res) => {
  try {
    const { text, voiceId, apiKey, modelId, voiceSettings, speaker, voiceName } = req.body;

    if (!text || !voiceId) {
      return res.status(400).json({ error: "Missing required text or voiceId parameters" });
    }

    if (!apiKey) {
      return res.status(400).json({ error: "Адресный ключ ElevenLabs API не найден или пуст" });
    }

    const finalModelId = modelId || 'eleven_multilingual_v2';
    const finalSettings = {
      stability: typeof voiceSettings?.stability === 'number' ? voiceSettings.stability : 0.45,
      similarity_boost: typeof voiceSettings?.similarity_boost === 'number' ? voiceSettings.similarity_boost : 0.75,
      style: typeof voiceSettings?.style === 'number' ? voiceSettings.style : 0.45,
      use_speaker_boost: typeof voiceSettings?.use_speaker_boost === 'boolean' 
        ? voiceSettings.use_speaker_boost 
        : (typeof voiceSettings?.speaker_boost === 'boolean' ? voiceSettings.speaker_boost : true)
    };

    // Deep diagnostics logging block as requested by Requirement 1 and 4
    console.log(`
┌────────────────────────────────────────────────────────┐
│ [VOICE ENGINE] Proxying ElevenLabs synthesis
├────────────────────────────────────────────────────────┤
│ Speaker:          ${speaker || 'unknown'}
│ Voice Name:       ${voiceName || 'unknown'}
│ Voice ID:         ${voiceId}
│ Model ID:         ${finalModelId}
│ Stability:        ${finalSettings.stability}
│ Similarity Boost: ${finalSettings.similarity_boost}
│ Style:            ${finalSettings.style}
│ Speaker Boost:    ${finalSettings.use_speaker_boost}
│ Text length:      ${text.length} characters
└────────────────────────────────────────────────────────┘
    `);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: finalModelId,
        voice_settings: finalSettings
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

router.get("/api/system/health", async (req, res) => {
  let openaiStatus = "unknown";
  let elevenlabsStatus = "unknown";
  let podcastApiStatus = "ok";
  
  // 1. Check OpenAI
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    openaiStatus = "missing_key";
  } else {
    try {
      const ai = getOpenAI();
      // Simple models.list to check authentication and quota
      await ai.models.list();
      openaiStatus = "ok";
    } catch (err: any) {
      console.error("[HEALTH CHECK] OpenAI error:", err);
      const lower = (err.message || "").toLowerCase();
      if (err.status === 429 || lower.includes("quota") || lower.includes("limit")) {
        openaiStatus = "quota_exceeded";
      } else if (err.status === 401 || lower.includes("auth") || lower.includes("key")) {
        openaiStatus = "invalid_key";
      } else {
        openaiStatus = "error: " + (err.message || "Unknown error");
      }
    }
  }

  // 2. Check ElevenLabs
  // ElevenLabs key is usually passed from frontend settings store to /api/podcast/synthesize.
  // We check if it is explicitly configured in process.env or passed as query param, or check domain reachability.
  const xiKey = process.env.ELEVENLABS_API_KEY || (req.query.apiKey as string) || "";
  if (!xiKey) {
    // If no key is set yet, verify connectivity to the endpoint
    try {
      const resp = await fetch(`https://api.elevenlabs.io/v1/voices`);
      if (resp.status === 200 || resp.status === 401) {
        elevenlabsStatus = "missing_key_but_api_reachable";
      } else {
        elevenlabsStatus = "endpoint_error_code_" + resp.status;
      }
    } catch (err: any) {
      elevenlabsStatus = "unreachable: " + (err.message || "Network error");
    }
  } else {
    try {
      const resp = await fetch("https://api.elevenlabs.io/v1/models", {
        headers: { "xi-api-key": xiKey }
      });
      if (resp.ok) {
        elevenlabsStatus = "ok";
      } else {
        const text = await resp.text();
        if (resp.status === 401) {
          elevenlabsStatus = "invalid_key";
        } else {
          elevenlabsStatus = `error_code_${resp.status}: ${text.substring(0, 100)}`;
        }
      }
    } catch (err: any) {
      elevenlabsStatus = "unreachable: " + (err.message || "Network error");
    }
  }

  res.json({
    openai: openaiStatus,
    elevenlabs: elevenlabsStatus,
    podcast_api: podcastApiStatus
  });
});

export default router;
