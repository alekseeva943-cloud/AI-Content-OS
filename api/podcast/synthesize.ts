import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`[VERCEL SYNTHESIZE ROUTE] Incoming request: ${req.method} ${req.url}`);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  try {
    const { text, voiceId, apiKey } = req.body;

    if (!text || !voiceId) {
      return res.status(400).json({ error: "Missing required text or voiceId parameters" });
    }

    if (!apiKey) {
      return res.status(400).json({ error: "Адресный ключ ElevenLabs API не найден или пуст" });
    }

    console.log(`[VERCEL SYNTHESIZE ROUTE] Proxying ElevenLabs synthesis for voice ID: ${voiceId}`);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[VERCEL SYNTHESIZE ROUTE] ElevenLabs HTTP Error:", errText);
      return res.status(response.status).send(errText || "ElevenLabs synthesis failed");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    return res.send(buffer);

  } catch (err: any) {
    console.error("[VERCEL SYNTHESIZE ROUTE] Global exception caught:", err);
    return res.status(500).json({ error: err.message || "Synthesis error occurred" });
  }
}
