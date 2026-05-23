import { Router } from "express";
import { OpenAI } from "openai";
import { getModulePrompts } from "../../../lib/prompts.ts";

const router = Router();

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

router.post("/api/longreads", async (req, res) => {
  const reqStart = Date.now();
  console.log(`[SERVER LONGREADS ROUTE] Incoming script request at ${new Date().toISOString()}`);

  try {
    const { topic, context, advanced } = req.body;

    if (!topic) {
      return res.status(400).json({ status: 400, success: false, error: "Тема лонгрида обязательна" });
    }

    const ai = getOpenAI();
    const { system, user } = getModulePrompts("longreads", { topic, context, tone: advanced?.tone });

    console.log(`[SERVER LONGREADS ROUTE] Dispatching OpenAI Chat Completion...`);
    const response = await ai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices[0]?.message?.content || "";
    console.log("[SERVER LONGREADS ROUTE] RAW AI OUTPUT length:", rawContent.length);
    const rawData = JSON.parse(rawContent || "{}");

    const result = {
      title: rawData.title || rawData.article?.title || topic,
      subtitle: rawData.subtitle || rawData.meta?.subtitle || "",
      readingTime: rawData.readingTime || rawData.meta?.readingTime || Math.ceil((rawData.content || "").split(' ').length / 200) || 5,
      content: rawData.content || rawData.article?.body || "",
      outline: Array.isArray(rawData.outline) ? rawData.outline : [],
      callouts: Array.isArray(rawData.callouts) ? rawData.callouts : [],
      socialSummary: rawData.socialSummary || rawData.meta?.summary || ""
    };

    console.log(`[SERVER LONGREADS ROUTE] Completed in ${Date.now() - reqStart}ms.`);
    return res.status(200).json(result);

  } catch (error: any) {
    console.error("[SERVER LONGREADS ROUTE] Error:", error);
    return res.status(500).json({ error: error.message || "Генерация лонгрида завершилась ошибкой" });
  }
});

export default router;
