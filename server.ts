import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { SYSTEM_PROMPT, buildPlannerPrompt } from "./src/services/ai/prompts.ts";
import { PlannerResultSchema } from "./src/types/planner.ts";

dotenv.config();

console.log("[Server] Initializing with OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "PRESENT" : "MISSING");

const app = express();
const PORT = 3000;

// 1. Move Logger to the very top to catch all requests
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[Server] ${new Date().toISOString()} ${req.method} ${req.url}`);
  }
  next();
});

// 2. Body Parser
app.use(express.json());

// Initialize OpenAI client lazily
let openaiClient: OpenAI | null = null;
function getOpenAI() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[Config Error] OPENAI_API_KEY is missing in environment variables");
      throw new Error("OPENAI_API_KEY is missing. Please provide it in the project settings.");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// 3. API Routes
app.get("/api/ping", (req, res) => {
  res.json({ status: "pong", time: new Date().toISOString() });
});

app.all("/api/planner", async (req, res) => {
  console.log(`[Server] ${req.method} request to /api/planner`);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: "Method Not Allowed", 
      message: `Received ${req.method}, but this endpoint requires POST.`,
      tip: "Check if your client-side fetch is sending a POST request."
    });
  }

  try {
    const { topic, context, period, channels, sharedMemory, advanced } = req.body;
    
    console.log(`[AI Request] Topic: "${topic}"`);
    
    if (!topic || !period || !channels) {
      return res.status(400).json({ error: "Missing required fields: topic, period, or channels" });
    }

    const client = getOpenAI();
    const prompt = buildPlannerPrompt({ topic, context, period, channels }, sharedMemory || [], advanced);

    const startTime = Date.now();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const duration = Date.now() - startTime;
    const rawContent = response.choices[0].message.content;

    if (!rawContent) {
      throw new Error("OpenAI returned an empty response body");
    }

    const parsedContent = JSON.parse(rawContent);
    const validated = PlannerResultSchema.parse(parsedContent);

    console.log(`[AI Response] Success in ${duration}ms`);
    
    res.json({ 
      ...validated, 
      debug: {
        duration,
        tokens: response.usage,
        model: "gpt-4o"
      }
    });
  } catch (error: any) {
    console.error("[AI Error]", error);
    res.status(500).json({ 
      error: error.message || "AI Synthesis failed",
      details: error.errors
    });
  }
});

// 4. Catch-all for other API routes
app.all("/api/*", (req, res) => {
  console.warn(`[Server] 404 - Unknown API Route: ${req.method} ${req.url}`);
  res.status(404).json({ error: "API Route not found" });
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
