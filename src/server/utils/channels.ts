export function normalizeChannel(
  value?: string
): string {
  const v =
    String(value || "")
      .toLowerCase()
      .trim();

  if (
    v === "telegram" ||
    v === "tg"
  ) {
    return "telegram";
  }

  if (
    v === "vk" ||
    v === "vkontakte"
  ) {
    return "vk";
  }

  if (
    v === "email" ||
    v === "mail"
  ) {
    return "email";
  }

  return v;
}
