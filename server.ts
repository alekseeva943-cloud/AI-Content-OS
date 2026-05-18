import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { getPlannerPrompts, getPostPrompts } from "./lib/prompts";
import { PlannerResultSchema, PlannerItemSchema } from "./src/types/planner.ts";

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
    const { topic, context, period, channels, sharedMemory, advanced } = req.body;
    console.log(`[API] Processing planner request for topic: ${topic}`);

    if (!topic || !period || !channels) {
      return res.status(400).json({ error: "Missing required fields (topic, period, or channels)" });
    }

    const client = getOpenAI();
    
    // Using the unified prompt loader
    const { system, user } = getPlannerPrompts({ topic, context, period, channels, sharedMemory, advanced });

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
    
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an AI Content Strategist. Your task is to REGENERATE a specific content idea (PlannerItem).
          KEEP the following EXACTLY: channel, topic, goal, type, time, day.
          CHANGE the following to provide a FRESH perspective: angle, description, rationale, hook, emotional framing.
          
          The result must be a JSON object matching the PlannerItem schema.
          Current item: ${JSON.stringify(item)}
          
          Provide a creative, alternative interpretation that follows the same strategy but uses a different hook or perspective.
          Result must be ONLY the JSON object.` 
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
