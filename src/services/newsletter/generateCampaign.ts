// ============================================
// FILE: src/services/newsletter/generateCampaign.ts
// ============================================

import { normalizeChannels } from "./normalizeChannels.js";
import { generateChannelContent } from "./generateChannelContent.js";
import { generateImage } from "./generateImage.js";

// ============================================
// GENERATE CHANNELS
// ============================================

async function generateChannels({
  topic,
  context,
  variables,
  advanced,
  channels
}: {
  topic: string;
  context: string;
  variables: any;
  advanced?: any;
  channels: string[];
}): Promise<any[]> {

  const normalizedChannels =
    normalizeChannels(
      channels
    );

  console.log(
    "[Newsletter API] Channels:",
    normalizedChannels
  );

  const generatedChannels =
    await Promise.all(

      normalizedChannels.map(
        async (channel) => {

          // ============================================
          // CONTENT
          // ============================================

          const content =
            await generateChannelContent({
              topic,
              context,
              variables,
              tone:
                advanced?.tone,
              channel
            });

          // ============================================
          // IMAGE
          // ============================================

          let finalImagePrompt = content.imagePrompt || "";
          if (!finalImagePrompt || typeof finalImagePrompt !== "string" || !finalImagePrompt.trim()) {
            const fallbackPrompts: Record<string, string> = {
              email: `Professional editorial email campaign visual about "${topic || "business concept"}", premium commercial newsletter aesthetic, sleek graphic design, clean layout, no text`,
              telegram: `High-quality engaging cinematic visual for Telegram post about "${topic || "lifestyle and business"}", modern editorial photography, vibrant colors, no text, premium wallpaper`,
              vk: `Friendly engaging storytelling visual for VKontakte post about "${topic || "events and community"}", warm atmosphere, interactive layout, realistic photography, no text`
            };
            finalImagePrompt = fallbackPrompts[channel] || `Professional high-quality digital illustration about "${topic || "news"}", premium artistic style, no text, no watermark`;
          }

          let imageUrl = "";

          if (
            finalImagePrompt
          ) {

            imageUrl =
              await generateImage({
                prompt:
                  finalImagePrompt,

                channel
              });
          }

          // ============================================
          // RETURN
          // ============================================

          return {
            id: channel as any,

            active: true,

            content: {

              subject:
                content.subject ||
                "",

              preheader:
                content.preheader ||
                "",

              body:
                content.body ||
                "",

              cta: {

                text:
                  content.cta?.text ||
                  "Подробнее",

                link:
                  content.cta?.link ||
                  "#"
              },

              imagePrompt:
                finalImagePrompt,

              imageUrl:
                imageUrl || ""
            }
          };
        }
      )
    );
  return generatedChannels;
}

// ============================================
// GENERATE CAMPAIGN
// ============================================

export async function generateCampaign({
  topic,
  context,
  variables,
  advanced,
  channels
}: {
  topic: string;
  context: string;
  variables: any;
  advanced?: any;
  channels: string[];
}): Promise<any> {

  const generatedChannels =
    await generateChannels({
      topic,
      context,
      variables,
      advanced,
      channels
    });

  // ============================================
  // FINAL RESULT
  // ============================================

  const finalResult = {

    id:
      `campaign_${Date.now()}`,

    name:
      topic ||
      "Контент-кампания",

    strategy:
      "Кампания адаптирована под особенности каждой площадки.",

    channels:
      generatedChannels,

    variables:
      variables || {}
  };

  return finalResult;
}
