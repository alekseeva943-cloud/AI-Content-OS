import { OpenAI } from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { prompt } = req.body;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;
    return res.status(200).json({ url: imageUrl });
  } catch (error: any) {
    console.error("[Image API] Error:", error);
    return res.status(500).json({ error: error.message || "Image generation failed" });
  }
}
