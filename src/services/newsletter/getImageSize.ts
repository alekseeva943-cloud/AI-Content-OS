// ============================================
// FILE: src/services/newsletter/getImageSize.ts
// ============================================

import { NEWSLETTER_CHANNELS } from "../../config/newsletterChannels";

// ============================================
// IMAGE SIZE
// ============================================

export function getImageSize(
  channel: string
): string {
  const config = NEWSLETTER_CHANNELS[channel];
  return config ? config.imageSize : "1024x1024";
}

