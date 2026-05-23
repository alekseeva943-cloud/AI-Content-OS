// File: lib/prompts.ts

import fs from "fs";
import path from "path";

type PromptVariables = Record<string, any>;

const promptCache = new Map<string, string>();

const PLATFORM_FALLBACK = "telegram";

const SUPPORTED_PLATFORMS = [
  "telegram",
  "vk",
  "email"
];

function getPromptPath(
  group: string,
  fileName: string
) {
  const cwd = process.cwd();
  const filePath = path.join(
    cwd,
    "prompts",
    group,
    fileName
  );
  
  console.log(`[PromptLoader] Resolving path:`, {
    cwd,
    group,
    fileName,
    resolvedPath: filePath
  });

  return filePath;
}

const EMBEDDED_FALLBACKS: Record<string, string> = {
  "shared/russian-style.txt": "Вы всегда пишите на русском языке в естественном, грамотном и современном стиле.",
  "shared/anti-ai.txt": "Запрещено использовать типичные ИИ-клише и штампы. Речь должна быть 'живой' и очеловеченной.",
  "shared/creator-tone.txt": "Тональность ваших материалов — вовлекающая, профессиональная и харизматичная.",
  "video-avatar/system.txt": "Вы — expert video presenter и ИИ-диктор. Создавайте сценарии, оптимизированные для устного произношения (spoken delivery) с естественным темпом.",
  "video-avatar/generation.txt": "Создайте сценарий для видеопрезентации по теме: {{topic}}.\nКонтекст: {{context}}.\nВерните строго валидный JSON с ключами: title, description, summary, hook, scenes, captionStyles.",
  "longreads/system.txt": "Вы — senior tech journalist и мастер сторителлинга. Создавайте увлекательные статьи с глубокой проработкой.",
  "longreads/generation.txt": "Создайте статью по теме: {{topic}}.\nКонтекст: {{context}}.\nВерните строго валидный JSON с ключами: title, subtitle, readingTime, content, outline, callouts, socialSummary.",
  "podcast/system.txt": "Вы — senior podcast producer. Создавайте увлекательные разговорные выпуски с живой динамикой.",
  "podcast/generation.txt": "Создайте сценарий подкаста по теме: {{topic}}.\nКонтекст: {{context}}.\nВерните строго валидный JSON с ключами: episode_title, hook, intro, segments, guest_questions, final_takeaway, cta.",
  "planner/system.txt": "Вы — эксперт-медиапланер контента.",
  "planner/generation.txt": "Создайте медиаплан контента по теме: {{topic}}.\nКонтекст: {{context}}.\nВерните строго валидный JSON.",
  "newsletter/system.txt": "Вы — эксперт по email-рассылкам.",
  "newsletter/generation.txt": "Создайте email-рассылку по теме: {{topic}}.\nКонтекст: {{context}}.\nВерните строго валидный JSON.",
  "newsletter/detect.txt": "Определите параметры рассылки.",
  "post/telegram/system.txt": "Вы — автор Telegram-канала. Пишите кратко, емко, с вовлекающими абзацами и структурированными мыслями.",
  "post/telegram/generation.txt": "Создайте Telegram-пост по теме: {{topic}}.\nКонтекст: {{context}}.\nВерните текст поста.",
  "post/vk/system.txt": "Вы — автор паблика ВКонтакте.",
  "post/vk/generation.txt": "Создайте пост ВКонтакте по теме: {{topic}}.\nКонтекст: {{context}}.",
  "post/email/system.txt": "Вы — автор email-рассылок.",
  "post/email/generation.txt": "Создайте email по теме: {{topic}}.\nКонтекст: {{context}}."
};

export function loadPrompt(
  group: string,
  fileName: string
): string {
  const startTime = Date.now();
  const cacheKey = `${group}/${fileName}`;

  if (promptCache.has(cacheKey)) {
    const cachedContent = promptCache.get(cacheKey)!;
    console.log(`[Prompt Diagnostics] ${cacheKey} | Memory Cache Hit | Size: ${cachedContent.length} chars | Latency: 0ms`);
    return cachedContent;
  }

  const filePath = getPromptPath(group, fileName);
  const exists = fs.existsSync(filePath);

  if (!exists) {
    console.warn(`[Prompt Loader Warning] ${cacheKey} is missing at ${filePath}. Using fallback embedded system prompt.`);
    
    // Check embedded fallback
    if (EMBEDDED_FALLBACKS[cacheKey]) {
      const fallbackContent = EMBEDDED_FALLBACKS[cacheKey];
      promptCache.set(cacheKey, fallbackContent);
      console.log(`[Prompt Diagnostics] ${cacheKey} | Fallback Loaded | Size: ${fallbackContent.length} chars | Latency: ${Date.now() - startTime}ms`);
      return fallbackContent;
    }

    // Platform-specific fallback
    if (group.startsWith("post/") && group !== `post/${PLATFORM_FALLBACK}`) {
      const fallbackGroup = `post/${PLATFORM_FALLBACK}`;
      const fallbackPath = getPromptPath(fallbackGroup, fileName);
      console.warn(`[PromptLoader] Attempting directory fallback for ${cacheKey} -> ${fallbackGroup}/${fileName}`);
      
      if (fs.existsSync(fallbackPath)) {
        const content = fs.readFileSync(fallbackPath, "utf8");
        promptCache.set(cacheKey, content);
        console.log(`[Prompt Diagnostics] ${cacheKey} | Platform Fallback Success | Size: ${content.length} chars | Latency: ${Date.now() - startTime}ms`);
        return content;
      }
    }

    // Ultimate backup fallback
    const ultimateFallback = `Вы — профессиональный ИИ-ассистент по направлению ${group}. Отвечайте строго на русском языке. При необходимости генерации JSON, верните валидный объект со всеми требуемыми ключами.`;
    promptCache.set(cacheKey, ultimateFallback);
    console.log(`[Prompt Diagnostics] ${cacheKey} | Ultimate Generic Fallback | Size: ${ultimateFallback.length} chars | Latency: ${Date.now() - startTime}ms`);
    return ultimateFallback;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");

    if (!content.trim()) {
      console.warn(`[Prompt Loader Warning] File is empty: ${filePath}. Using fallback.`);
      
      if (EMBEDDED_FALLBACKS[cacheKey]) {
        const fallbackContent = EMBEDDED_FALLBACKS[cacheKey];
        promptCache.set(cacheKey, fallbackContent);
        console.log(`[Prompt Diagnostics] ${cacheKey} | Empty File Fallback | Size: ${fallbackContent.length} chars | Latency: ${Date.now() - startTime}ms`);
        return fallbackContent;
      }

      if (group.startsWith("post/") && group !== `post/${PLATFORM_FALLBACK}`) {
         const fallbackGroup = `post/${PLATFORM_FALLBACK}`;
         const fallbackContent = loadPrompt(fallbackGroup, fileName);
         return fallbackContent;
      }

      const ultimateFallback = `Вы — профессиональный ИИ-ассистент по направлению ${group}. Отвечайте строго на русском языке.`;
      promptCache.set(cacheKey, ultimateFallback);
      console.log(`[Prompt Diagnostics] ${cacheKey} | Ultimate Generic Fallback | Size: ${ultimateFallback.length} chars | Latency: ${Date.now() - startTime}ms`);
      return ultimateFallback;
    }

    promptCache.set(cacheKey, content);
    console.log(`[Prompt Diagnostics] ${cacheKey} | File System Load Success | Size: ${content.length} chars | Latency: ${Date.now() - startTime}ms | Path: ${filePath}`);
    return content;
  } catch (error: any) {
    console.error(`[Prompt Loader Exception] Read error for ${filePath}: ${error.message}`);
    if (EMBEDDED_FALLBACKS[cacheKey]) {
      const fallbackContent = EMBEDDED_FALLBACKS[cacheKey];
      console.log(`[Prompt Diagnostics] ${cacheKey} | Exception Fallback | Size: ${fallbackContent.length} chars | Latency: ${Date.now() - startTime}ms`);
      return fallbackContent;
    }
    const errFallback = `Вы — профессиональный ИИ-ассистент по направлению ${group}.`;
    console.log(`[Prompt Diagnostics] ${cacheKey} | Exception Ultimate Fallback | Size: ${errFallback.length} chars | Latency: ${Date.now() - startTime}ms`);
    return errFallback;
  }
}

function sanitizeVariable(value: any): string {

  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (
    typeof value === "object"
  ) {

    try {
      return JSON.stringify(
        value,
        null,
        2
      );
    } catch {
      return "";
    }
  }

  return String(value);
}

export function composePrompt(
  basePrompt: string,
  variables: PromptVariables
): string {

  let composed = basePrompt;

  Object.entries(variables)
    .forEach(([key, value]) => {

      const placeholder =
        `{{${key}}}`;

      composed =
        composed.replaceAll(
          placeholder,
          sanitizeVariable(value)
        );
    });

  return composed.trim();
}

export function renderPrompt(
  group: string,
  fileName: string,
  variables: PromptVariables = {}
) {

  const base =
    loadPrompt(group, fileName);

  return composePrompt(
    base,
    variables
  );
}

function buildSharedSystemLayer() {

  const layers = [
    loadPrompt(
      "shared",
      "russian-style.txt"
    ),

    loadPrompt(
      "shared",
      "anti-ai.txt"
    ),

    loadPrompt(
      "shared",
      "creator-tone.txt"
    )
  ];

  return layers.join("\n\n");
}

function resolvePlatform(
  platform?: string
) {
  // Normalize platform string
  const normalized = String(platform || "").toLowerCase().trim();
  
  console.log(`[Platform Routing] Resolving platform:`, { 
    original: platform, 
    normalized 
  });

  // Check if it's in our supported list AND the directory exists
  const hasFiles = fs.existsSync(path.join(process.cwd(), "prompts", "post", normalized));

  if (
    normalized &&
    SUPPORTED_PLATFORMS.includes(normalized) &&
    hasFiles
  ) {
    console.log(`[Platform Routing] Route matched: ${normalized}`);
    return normalized;
  }

  console.warn(
    `[Platform Routing] Unsupported or missing platform "${platform}" (normalized: "${normalized}"), using fallback "${PLATFORM_FALLBACK}"`
  );

  return PLATFORM_FALLBACK;
}

export function getModulePrompts(
  moduleId: string,
  data: PromptVariables
) {

  const systemBase =
    renderPrompt(
      moduleId,
      "system.txt"
    );

  const generation =
    renderPrompt(
      moduleId,
      "generation.txt",
      data
    );

  const shared =
    buildSharedSystemLayer();

  const system =
    [
      systemBase,
      shared
    ].join("\n\n");

  console.log(
    `[PromptComposer] Module "${moduleId}" loaded`
  );

  return {
    system,
    user: generation,

    debug: {
      moduleId,
      sharedLayers: [
        "russian-style",
        "anti-ai",
        "creator-tone"
      ]
    }
  };
}

export function getPlannerPrompts(
  data: PromptVariables
) {
  const startDate = data.startDate || new Date().toISOString().split('T')[0];
  const today = new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return getModulePrompts(
    "planner",
    {
      topic: data.topic,

      context:
        data.context ||
        "Нет дополнительного контекста",

      period:
        data.period ||
        data.duration,

      startDate,
      today,

      channels:
        Array.isArray(data.channels)
          ? data.channels.map((c: string) => String(c).toLowerCase().trim()).join(", ")
          : String(data.channels || "telegram").toLowerCase().trim(),

      advanced:
        data.advanced || {},

      memory:
        Array.isArray(data.sharedMemory)
          ? data.sharedMemory.join("\n")
          : "Пусто"
    }
  );
}

export function getPostPrompts(
  data: PromptVariables
) {

  const platform =
    resolvePlatform(
      data.item?.channel ||
      data.channel
    );

  console.log("[Platform]", platform);

  const systemBase =
    renderPrompt(
      `post/${platform}`,
      "system.txt"
    );

  const generationBase =
    renderPrompt(
      `post/${platform}`,
      "generation.txt",
      {
        topic:
          data.item?.topic ||
          data.topic,

        type:
          data.item?.type ||
          "Пост",

        goal:
          data.item?.goal ||
          "Вовлечение",

        description:
          data.item?.description ||
          "",

        angle:
          data.item?.angle ||
          "",

        rationale:
          data.item?.rationale ||
          "",

        context:
          data.context ||
          "",

        tone:
          data.item?.aiSettings?.tone ||
          data.advanced?.tone ||
          "Естественный",

        aiSettings:
          data.item?.aiSettings ||
          data.advanced ||
          {}
      }
    );

  const shared =
    buildSharedSystemLayer();

  const system =
    [
      systemBase,
      shared
    ].join("\n\n");

  console.log(
    `[PromptComposer] Platform "${platform}" loaded`
  );

  return {
    system,
    user: generationBase,

    debug: {
      platform,
      fallback:
        platform ===
        PLATFORM_FALLBACK,

      sharedLayers: [
        "russian-style",
        "anti-ai",
        "creator-tone"
      ]
    }
  };
}

