// ============================================
// FILE: src/services/newsletter/generateImage.ts
// ============================================

import { OpenAI } from "openai";
import { getImageSize } from "./getImageSize";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// ============================================
// IMAGE GENERATION
// ============================================

export async function generateImage({
  prompt,
  channel
}: {
  prompt: string;
  channel: string;
}): Promise<string> {

  try {

    console.log(
      `[IMAGE] GENERATING ${channel}`
    );

    const client = getOpenAI();
    const response =
      await client.images.generate({
        model: "gpt-image-1",

        prompt,

        size:
          getImageSize(
            channel
          ),

        quality: "high"
      });

    const image =
      response.data?.[0];

    if (!image) {

      console.error(
        `[IMAGE] EMPTY ${channel}`
      );

      return "";
    }

    // ============================================
    // BASE64 RESPONSE
    // ============================================

    if (image.b64_json) {

      console.log(
        `[IMAGE] BASE64 SUCCESS ${channel}`
      );

      return `data:image/png;base64,${image.b64_json}`;
    }

    // ============================================
    // URL RESPONSE
    // ============================================

    if (image.url) {

      console.log(
        `[IMAGE] URL SUCCESS ${channel}`
      );

      return image.url;
    }

    return "";

  } catch (err) {

    console.error(
      `[IMAGE ERROR ${channel}]`,
      err
    );

    return "";
  }
}
