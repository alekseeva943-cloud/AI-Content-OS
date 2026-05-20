// ============================================
// FILE: src/services/newsletter/getImageSize.ts
// ============================================

// ============================================
// IMAGE SIZE
// ============================================

export function getImageSize(
  channel: string
): string {

  switch (channel) {

    case "telegram":
      return "1024x1024";

    case "email":
      return "1024x1024";

    case "vk":
      return "1024x1024";

    default:
      return "1024x1024";
  }
}
