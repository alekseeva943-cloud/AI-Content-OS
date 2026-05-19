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

export function loadPrompt(
  group: string,
  fileName: string
): string {

  const cacheKey =
    `${group}/${fileName}`;

  if (promptCache.has(cacheKey)) {
    return promptCache.get(cacheKey)!;
  }

  const filePath =
    getPromptPath(group, fileName);

  const exists = fs.existsSync(filePath);
  console.log(`[PromptLoader] File exists check:`, {
    filePath,
    exists
  });

  if (!exists) {
    const promptsDir = path.join(process.cwd(), "prompts");
    const promptsDirExists = fs.existsSync(promptsDir);
    let dirContents: string[] = [];
    if (promptsDirExists) {
      try {
        dirContents = fs.readdirSync(promptsDir);
      } catch (e) {}
    }

    console.error(
      `[PromptLoader] Missing prompt file: ${filePath}. prompts dir exists: ${promptsDirExists}, contents: ${dirContents.join(", ")}`
    );

    throw new Error(
      `Missing prompt file: ${cacheKey}`
    );
  }

  try {
    const content =
      fs.readFileSync(filePath, "utf8");

    if (!content.trim()) {
      console.warn(`[PromptLoader] File is empty: ${filePath}`);
      throw new Error(
        `Empty prompt file: ${cacheKey}`
      );
    }

    promptCache.set(cacheKey, content);
    console.log(`[PromptLoader] Successfully loaded: ${cacheKey}`);
    return content;
  } catch (error: any) {
    console.error(`[PromptLoader] Read error for ${filePath}:`, error.message);
    throw error;
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

  if (
    platform &&
    SUPPORTED_PLATFORMS.includes(platform)
  ) {
    return platform;
  }

  console.warn(
    `[PromptRouter] Unsupported platform "${platform}", using fallback "${PLATFORM_FALLBACK}"`
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
          ? data.channels.join(", ")
          : (
              data.channels ||
              "telegram"
            ),

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

