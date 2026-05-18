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

app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[Server] ${req.method} ${req.url}`);
  }
  next();
});

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

// API Routes
app.all("/api/planner", async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: "Method Not Allowed", 
      message: `Expected POST, received ${req.method}. Please check your client code.`
    });
  }

  try {
    const { topic, context, period, channels, sharedMemory, advanced } = req.body;
    
    console.log(`[Server] Handling synthesis request: ${topic}`);
    
    if (!topic || !period || !channels) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const client = getOpenAI();
    const prompt = buildPlannerPrompt({ topic, context, period, channels }, sharedMemory || [], advanced);

    console.log("[AI] Requesting completion for topic:", topic);
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
      throw new Error("Empty response from AI");
    }

    const parsedContent = JSON.parse(rawContent);
    const validated = PlannerResultSchema.parse(parsedContent);

    console.log(`[AI] Success. Duration: ${duration}ms`);
    
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
      details: error.errors,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Catch-all for unmatched API routes
app.all("/api/*", (req, res) => {
  console.warn(`[Server] 404/405 - Unmatched or unsupported request: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: "API Route not found", 
    message: `The ${req.method} request to ${req.url} did not match any server-side routes.`,
    availableRoutes: ["POST /api/planner"]
  });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
