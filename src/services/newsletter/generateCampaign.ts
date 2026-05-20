// ============================================
// FILE: src/services/newsletter/generateCampaign.ts
// ============================================

import { normalizeChannels } from "./normalizeChannels";
import { generateChannelContent } from "./generateChannelContent";
import { generateImage } from "./generateImage";

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

          let imageUrl = "";

          if (
            content.imagePrompt
          ) {

            imageUrl =
              await generateImage({
                prompt:
                  content.imagePrompt,

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
                content.imagePrompt ||
                "",

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
