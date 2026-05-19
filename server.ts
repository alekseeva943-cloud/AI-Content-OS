import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { getPlannerPrompts, getPostPrompts, getModulePrompts, renderPrompt } from "./lib/prompts";
import { PlannerResultSchema, PlannerItemSchema } from "./src/types/planner.ts";
import { CampaignResultSchema } from "./src/types/newsletter.ts";

dotenv.config();

const app = express();
const PORT = 3000;

// 1. Logging Middleware (Every single request)
app.use((req, res, next) => {
  console.log(`[Request] ${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// 2. Global Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI client lazily
let openaiClient: OpenAI | null = null;
function getOpenAI() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[Config] OPENAI_API_KEY is missing!");
      throw new Error("Missing OPENAI_API_KEY");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// 3. API Routes
app.post("/api/planner", async (req, res) => {
  try {
    const { topic, context, period, channels, sharedMemory, advanced, startDate } = req.body;
    console.log(`[API] Processing planner request for topic: ${topic}, startDate: ${startDate}`);

    if (!topic || !period || !channels) {
      return res.status(400).json({ error: "Missing required fields (topic, period, or channels)" });
    }

    const client = getOpenAI();
    
    // Using the unified prompt loader
    const { system, user } = getPlannerPrompts({ topic, context, period, channels, sharedMemory, advanced, startDate });

    const startTime = Date.now();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices[0].message.content;
    if (!rawContent) throw new Error("OpenAI returned an empty response");

    const validated = PlannerResultSchema.parse(JSON.parse(rawContent));
    
    // Deterministic date calculation based on startDate and dayIndex
    const startObj = startDate ? new Date(startDate) : new Date();
    
    validated.items = validated.items.map(item => {
      const itemDate = new Date(startObj);
      itemDate.setDate(startObj.getDate() + (item.dayIndex || 0));
      
      const weekday = itemDate.toLocaleDateString('ru-RU', { weekday: 'long' });
      const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

      return {
        ...item,
        publishDate: itemDate.toISOString().split('T')[0],
        weekday: capitalizedWeekday
      };
    });

    const duration = Date.now() - startTime;

    console.log(`[API] Success in ${duration}ms`);
    res.json({ ...validated, debug: { duration, model: "gpt-4o" } });
  } catch (error: any) {
    console.error("[API Error]", error);
    res.status(500).json({ 
      error: error.message || "Synthesis failed",
      details: error.errors
    });
  }
});

app.post("/api/campaign-detect", async (req, res) => {
  try {
    const { topic, context } = req.body;
    const client = getOpenAI();
    
    const { system } = getModulePrompts("newsletter", { topic, context });
    
    // Replace user with detect prompt and reinforce language
    const detectPrompt = renderPrompt("newsletter", "detect.txt", { 
      topic: topic || "Без темы", 
      context: context || "Нет контекста" 
    }) + "\n\nОТВЕТЬ СТРОГО НА РУССКОМ ЯЗЫКЕ.";

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system + "\n\nIMPORTANT: Use Russian language (RU) for all labels and descriptions." },
        { role: "user", content: detectPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from AI");
    
    console.log("[Campaign Detect] AI Output:", content);
    res.json(JSON.parse(content));
  } catch (error: any) {
    console.error("[Campaign Detect API Error]", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/newsletter", async (req, res) => {
  try {
    const { topic, context, variables, channels, advanced } = req.body;
    const requestedChannels = channels || ['email', 'telegram', 'vk'];
    console.log("[Newsletter API] Request received:", { topic, channels: requestedChannels });
    
    const client = getOpenAI();
    
    const { system, user } = getModulePrompts("newsletter", { 
      topic: topic || "Без темы", 
      context: context || "Нет дополнительного контекста", 
      variables: JSON.stringify(variables || {}),
      channels: requestedChannels.join(", "),
      tone: advanced?.tone || "natural" 
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system + "\n\nОБЯЗАТЕЛЬНО: Весь контент должен быть на РУССКОМ языке. Используй живой, современный стиль." },
        { role: "user", content: user + "\n\nВАЖНО: Создай контент ТОЛЬКО для выбранных каналов: " + requestedChannels.join(", ") + ". Пиши СТРОГО на русском языке." }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    console.log("[Newsletter API] RAW AI RESPONSE:", content);
    
    if (!content) throw new Error("OpenAI returned an empty response");
    
    const rawData = JSON.parse(content);
    
    // Robust transformation: ensure ALL expected fields exist and handle AI naming variations
    const transformed = {
      id: rawData.id || `campaign-${Date.now()}`,
      name: rawData.name || topic || "Новая кампания",
      strategy: rawData.strategy || "",
      channels: (rawData.channels || []).map((ch: any) => {
        // Only include requested channels
        if (!requestedChannels.includes(ch.id)) return null;

          // AI might put content directly in ch, or in ch.content
          const c = ch.content || ch;
          
          if (ch.id === 'telegram') console.log("[Newsletter API] RAW TELEGRAM:", JSON.stringify(ch, null, 2));
          if (ch.id === 'vk') console.log("[Newsletter API] RAW VK:", JSON.stringify(ch, null, 2));

          return {
            id: ch.id as 'email' | 'telegram' | 'vk',
            active: ch.active ?? true,
            content: {
              subject: c.subject || c.title || ch.subject || ch.title || "",
              preheader: c.preheader || c.summary || c.preview || ch.preheader || ch.summary || "",
              body: c.body || c.text || c.content || c.message || c.description || c.copy || ch.body || ch.text || ch.description || ch.message || ch.copy || "",
              cta: (function() {
                const rawCta = c.cta || ch.cta || c.action || c.button || ch.action || ch.button;
                if (!rawCta) return { text: "Узнать больше", link: "#" };
                if (typeof rawCta === 'string') return { text: rawCta, link: "#" };
                return { 
                  text: rawCta.text || rawCta.label || rawCta.buttonText || rawCta.title || "Узнать больше", 
                  link: rawCta.link || rawCta.url || rawCta.href || "#" 
                };
              })(),
              imagePrompt: c.imagePrompt || c.visuals || c.image_prompt || ch.imagePrompt || ch.visuals || ""
            }
          };
      }).filter(Boolean),
      variables: rawData.variables || {}
    };

    console.log("[Newsletter API] NORMALIZED CAMPAIGN:", JSON.stringify(transformed, null, 2));

    const validated = CampaignResultSchema.parse(transformed);
    res.json(validated);
  } catch (error: any) {
    console.error("CAMPAIGN ERROR:", error);
    res.status(500).json({ 
      error: error.message || "Newsletter synthesis failed",
      details: error.errors
    });
  }
});

app.post("/api/longreads", async (req, res) => {
  try {
    const { topic, context, advanced } = req.body;
    const client = getOpenAI();
    const { system, user } = getModulePrompts("longreads", { topic, context, tone: advanced?.tone });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices[0].message.content;
    console.log("[Longreads API] RAW AI OUTPUT:", rawContent);
    if (!rawContent) throw new Error("Empty response");

    const rawData = JSON.parse(rawContent || "{}");
    // Flexible transformation for different prompt outputs
    const result = {
      title: rawData.title || rawData.article?.title || topic,
      subtitle: rawData.subtitle || rawData.meta?.subtitle || "",
      readingTime: rawData.readingTime || rawData.meta?.readingTime || Math.ceil((rawData.content || "").split(' ').length / 200) || 5,
      content: rawData.content || rawData.article?.body || "",
      outline: Array.isArray(rawData.outline) ? rawData.outline : [],
      callouts: Array.isArray(rawData.callouts) ? rawData.callouts : [],
      socialSummary: rawData.socialSummary || rawData.meta?.summary || ""
    };
    
    console.log("[Longreads API] Normalized Data:", JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error: any) {
    console.error("[Longreads API] Generation Error:", error);
    res.status(500).json({ error: error.message || "Longread synthesis failed" });
  }
});

app.post("/api/podcasts", async (req, res) => {
  try {
    const { topic, context, advanced } = req.body;
    const client = getOpenAI();
    const { system, user } = getModulePrompts("podcasts", { topic, context });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices[0].message.content;
    console.log("[Podcasts API] RAW AI OUTPUT:", rawContent);
    if (!rawContent) throw new Error("Empty response");

    const rawData = JSON.parse(rawContent || "{}");
    const result = {
      topic: rawData.topic || topic,
      intro: rawData.intro || rawData.hook || "",
      structure: Array.isArray(rawData.structure) ? rawData.structure.map((s: any) => ({
        id: s.id || Math.random().toString(36).substr(2, 9),
        title: s.title || "Сегмент",
        duration: s.duration || "2:00",
        points: Array.isArray(s.points) ? s.points : [s.content || s.description].filter(Boolean),
        talkingPoints: s.talkingPoints || []
      })) : [],
      guestQuestions: Array.isArray(rawData.guestQuestions) ? rawData.guestQuestions : [],
      outro: rawData.outro || rawData.conclusion || "",
      cta: rawData.cta || ""
    };
    
    console.log("[Podcasts API] Normalized Data:", JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error: any) {
    console.error("[Podcasts API] Generation Error:", error);
    res.status(500).json({ error: error.message || "Podcast synthesis failed" });
  }
});

app.post("/api/avatars", async (req, res) => {
  try {
    const { topic, context, advanced } = req.body;
    const client = getOpenAI();
    const { system, user } = getModulePrompts("video-avatar", { topic, context });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices[0].message.content;
    console.log("[Avatars API] RAW AI OUTPUT:", rawContent);
    if (!rawContent) throw new Error("Empty response");

    const rawData = JSON.parse(rawContent || "{}");
    const result = {
      hook: rawData.hook || rawData.opening || "",
      scenes: Array.isArray(rawData.scenes) ? rawData.scenes.map((s: any) => ({
        id: s.id || Math.random().toString(36).substr(2, 9),
        description: s.description || s.visuals || "",
        narration: s.narration || s.text || "",
        gesture: s.gesture || s.action || "neutral",
        emotion: s.emotion || "natural",
        visuals: s.visuals || s.description || ""
      })) : [],
      captionStyles: rawData.captionStyles || { font: "Inter", color: "#FFFFFF", animation: "fade" }
    };
    
    console.log("[Avatars API] Normalized Data:", JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error: any) {
    console.error("[Avatars API] Generation Error:", error);
    res.status(500).json({ error: error.message || "Avatar synthesis failed" });
  }
});

app.post("/api/generate-post", async (req, res) => {
  try {
    const { item, context, advanced } = req.body;
    const client = getOpenAI();
    const { system, user } = getPostPrompts({ item, context, advanced });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.85
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/regenerate-item", async (req, res) => {
  try {
    const { item } = req.body;
    const client = getOpenAI();
    
    const userPrompt = renderPrompt("planner", "regenerate.txt", { 
      item: JSON.stringify(item) 
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an AI Content Strategist. Result must be ONLY a valid JSON object matching the PlannerItem schema."
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response");
    
    const newItem = PlannerItemSchema.parse(JSON.parse(content));
    res.json(newItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    console.log("[Visual Studio] Generating image for prompt:", prompt);
    const client = getOpenAI();
    
    try {
      const response = await client.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const url = response.data[0].url;
      console.log("[Visual Studio] Image generated:", url);
      return res.json({ url });
    } catch (dalle3Error: any) {
      console.warn("[Visual Studio] dall-e-3 failed, trying dall-e-2 as fallback...", dalle3Error.message);
      
      const response = await client.images.generate({
        model: "dall-e-2",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });

      const url = response.data[0].url;
      console.log("[Visual Studio] Image generated (dall-e-2):", url);
      return res.json({ url });
    }
  } catch (error: any) {
    console.error("[Visual Studio] Image generation failed:", error.message);
    res.status(500).json({ 
      error: "Failed to generate image",
      message: error.message 
    });
  }
});

// 4. API Catch-all (helpful for debugging mismatches)
app.all("/api/*", (req, res) => {
  console.warn(`[API 404] ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: "API Endpoint not found",
    received: {
      method: req.method,
      path: req.url
    }
  });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Starting Vite in middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Serving static files from dist...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Listening on http://localhost:${PORT}`);
  });
}

startServer();
