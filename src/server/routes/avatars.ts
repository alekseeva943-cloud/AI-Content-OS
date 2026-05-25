import { Router } from "express";
import { OpenAI } from "openai";
import multer from "multer";
import { getModulePrompts } from "../../../lib/prompts.ts";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/api/heygen-upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const apiKey = process.env.HEYGEN_API_KEY || req.headers["x-api-key"] || "";
    if (!apiKey) {
      return res.status(401).json({
        error: "HeyGen API Key is missing on the server and client headers.",
      });
    }

    const fileBlob = new Blob([req.file.buffer], {
      type: req.file.mimetype || "audio/mpeg",
    });

    const formData = new FormData();
    formData.append("file", fileBlob, req.file.originalname || "audio.mp3");

    const endpoint = "https://api.heygen.com/v2/assets";
    console.log(`[SERVER-PROXY-UPLOAD] Forwarding to HeyGen: ${endpoint}`);

    const heygenResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey as string,
      },
      body: formData,
    });

    const respText = await heygenResponse.text();
    let respJson: any = null;
    try {
      respJson = JSON.parse(respText);
    } catch {}

    if (!heygenResponse.ok) {
      console.error(
        `[SERVER-PROXY-UPLOAD] HeyGen API Error (${heygenResponse.status}): ${respText}`
      );
      return res.status(heygenResponse.status).send(respText);
    }

    return res.status(200).json(respJson);
  } catch (error: any) {
    console.error("[SERVER-PROXY-UPLOAD] General Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Server proxy upload failed" });
  }
});

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

router.post("/api/avatars", async (req, res) => {
  const reqStart = Date.now();
  console.log(`[SERVER AVATARS ROUTE] Incoming script request at ${new Date().toISOString()}`);

  try {
    const { topic, context, advanced } = req.body;

    if (!topic) {
      return res.status(400).json({ status: 400, success: false, error: "Тема аватара обязательна" });
    }

    const ai = getOpenAI();
    const { system, user } = getModulePrompts("video-avatar", { topic, context });

    console.log(`[SERVER AVATARS ROUTE] Dispatching OpenAI Chat Completion...`);
    const response = await ai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices[0]?.message?.content || "";
    console.log("[SERVER AVATARS ROUTE] RAW AI OUTPUT length:", rawContent.length);
    const rawData = JSON.parse(rawContent || "{}");

    // Map nicely to standard format
    const result = {
      title: rawData.title || `Сценарий: ${topic}`,
      description: rawData.description || `Видеопрезентация на тему "${topic}"`,
      summary: rawData.summary || `Короткое описание темы "${topic}"`,
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

    console.log(`[SERVER AVATARS ROUTE] Completed in ${Date.now() - reqStart}ms.`);
    return res.status(200).json(result);

  } catch (error: any) {
    console.error("[SERVER AVATARS ROUTE] Error:", error);
    return res.status(500).json({ error: error.message || "Генерация сценария завершилась ошибкой" });
  }
});

export default router;
