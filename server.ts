import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { SYSTEM_PROMPT, buildPlannerPrompt } from "./src/services/ai/prompts.ts";
import { PlannerResultSchema } from "./src/types/planner.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize OpenAI client lazily
let openaiClient: OpenAI | null = null;
function getOpenAI() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is missing");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// API Routes
app.post("/api/ai/planner", async (req, res) => {
  try {
    const { topic, context, period, channels, sharedMemory, advanced } = req.body;
    
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
      details: error.errors
    });
  }
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
