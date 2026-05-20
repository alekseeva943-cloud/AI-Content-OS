// ============================================
// FILE: api/newsletter.ts
// ============================================

import type {
  VercelRequest,
  VercelResponse
} from "@vercel/node";

import {
  CampaignResultSchema
} from "../src/types/newsletter.js";

import {
  generateCampaign
} from "../src/services/newsletter/generateCampaign.js";

// ============================================
// MAIN HANDLER
// ============================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error:
        "Method Not Allowed"
    });
  }

  try {

    const {
      topic,
      context,
      variables,
      advanced,
      channels
    } = req.body;

    // ============================================
    // ORCHESTRATE GENERATION
    // ============================================

    const finalResult =
      await generateCampaign({
        topic,
        context,
        variables,
        advanced,
        channels
      });

    console.log(
      "[NEWSLETTER] SUCCESS"
    );

    const validated =
      CampaignResultSchema.parse(
        finalResult
      );

    return res.status(200).json(
      validated
    );

  } catch (error: any) {

    console.error(
      "[Newsletter API ERROR]",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Newsletter generation failed"
    });
  }
}
