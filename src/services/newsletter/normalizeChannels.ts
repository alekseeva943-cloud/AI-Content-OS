// ============================================
// FILE: src/services/newsletter/normalizeChannels.ts
// ============================================

// ============================================
// CHANNEL NORMALIZATION
// ============================================

export function normalizeChannels(
  channels: any
): string[] {

  if (
    !Array.isArray(channels)
  ) {
    return ["telegram"];
  }

  return channels
    .map((c) =>
      String(c)
        .toLowerCase()
        .trim()
    )
    .filter((c) =>
      ["email", "telegram", "vk"]
        .includes(c)
    );
}
