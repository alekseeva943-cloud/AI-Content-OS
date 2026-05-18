import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { SYSTEM_PROMPT, buildPlannerPrompt } from "./src/services/ai/prompts.ts";
import { PlannerResultSchema } from "./src/types/planner.ts";

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

// 3. API Router
const api = express.Router();

api.get("/health", (req, res) => res.json({ status: "alive" }));

api.post("/planner", async (req, res) => {
  try {
    const { topic, context, period, channels, sharedMemory, advanced } = req.body;
    console.log(`[API] Planner called for: ${topic}`);

    if (!topic || !period || !channels) {
      return res.status(400).json({ error: "Missing required fields" });
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

    const rawContent = response.choices[0].message.content;
    if (!rawContent) throw new Error("Empty AI response");

    const validated = PlannerResultSchema.parse(JSON.parse(rawContent));
    const duration = Date.now() - startTime;

    console.log(`[API] Success in ${duration}ms`);
    res.json({ ...validated, debug: { duration, model: "gpt-4o" } });
  } catch (error: any) {
    console.error("[API Error]", error);
    res.status(500).json({ error: error.message || "Synthesis failed" });
  }
});

app.use("/api", api);

// 4. Catch-all for API (must be before Vite)
app.all("/api/*", (req, res) => {
  console.warn(`[Route 404] ${req.method} ${req.url}`);
  res.status(404).json({ error: "Endpoint not found" });
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
