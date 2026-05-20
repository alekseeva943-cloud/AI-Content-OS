import { normalizeChannel } from "./channels";

export function parseLocalDate(dateStr: string): Date {
  const parts = String(dateStr || "").split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1; // 0-11
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d, 12, 0, 0); // Noon to survive timezone offsets
    }
  }
  const fallback = new Date();
  fallback.setHours(12, 0, 0, 0);
  return fallback;
}

export function processPlannerItems(items: any[], allowedChannels: string[], startDateString?: string): any[] {
  const baseDate = startDateString ? parseLocalDate(startDateString) : (() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  })();

  const requestedChannels = Array.isArray(allowedChannels) && allowedChannels.length > 0
    ? allowedChannels.map(c => normalizeChannel(String(c)))
    : ["telegram", "vk", "email"];

  const uniqueDaysOrdered: string[] = [];
  (items || []).forEach(item => {
    if (!item) return;
    const dayStr = String(item.day || "").trim();
    if (dayStr && !uniqueDaysOrdered.includes(dayStr)) {
      uniqueDaysOrdered.push(dayStr);
    }
  });

  if (uniqueDaysOrdered.length === 0) {
    uniqueDaysOrdered.push("День 1");
  }

  return (items || []).map((item, index) => {
    const rawChannel = normalizeChannel(item.channel);
    const isChannelValid = requestedChannels.includes(rawChannel);
    const channel = isChannelValid 
      ? rawChannel 
      : requestedChannels[index % requestedChannels.length];

    const dayStr = String(item.day || "День 1").trim();
    const dayIdxFromOrder = uniqueDaysOrdered.indexOf(dayStr);
    const dayIdx = dayIdxFromOrder !== -1 ? dayIdxFromOrder : 0;

    const itemDate = new Date(baseDate.getTime());
    itemDate.setDate(baseDate.getDate() + dayIdx);

    const weekdaysRu = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const weekday = weekdaysRu[itemDate.getDay()];

    const yyyy = itemDate.getFullYear();
    const mm = String(itemDate.getMonth() + 1).padStart(2, '0');
    const dd = String(itemDate.getDate()).padStart(2, '0');
    const publishDate = `${yyyy}-${mm}-${dd}`;

    return {
      id: item.id || `item-${index + 1}`,
      day: item.day || `День ${dayIdx + 1}`,
      time: item.time || "12:00",
      channel,
      topic: item.topic || "Без названия",
      dayIndex: dayIdx,
      publishDate,
      weekday,

      description: item.description || "",
      type: item.type || "Пост",
      purpose: item.purpose || "Вовлечение",
      goal: item.goal || "Активность",
      angle: item.angle || "",
      rationale: item.rationale || "",
      hashtags: Array.isArray(item.hashtags) ? item.hashtags : []
    };
  });
}
