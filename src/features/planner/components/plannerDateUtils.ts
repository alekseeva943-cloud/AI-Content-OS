import { PlannerItem } from '@/src/types/planner';

/**
 * Ensures all items have fallback publish dates if missing.
 */
export function getItemsWithFallbackDates(items: PlannerItem[]): PlannerItem[] {
  return (items ?? []).map((item, index) => {
    if (!item) return item;
    if (item.publishDate && !isNaN(Date.parse(item.publishDate))) {
      return item;
    }
    const baseDate = new Date();
    const dayIdx = typeof item.dayIndex === 'number' ? item.dayIndex : index;
    const itemDate = new Date(baseDate.getTime());
    itemDate.setDate(baseDate.getDate() + dayIdx);
    
    const weekdaysRu = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const weekday = weekdaysRu[itemDate.getDay()];
    const yyyy = itemDate.getFullYear();
    const mm = String(itemDate.getMonth() + 1).padStart(2, '0');
    const dd = String(itemDate.getDate()).padStart(2, '0');
    const fallbackPublishDate = `${yyyy}-${mm}-${dd}`;
    
    return {
      ...item,
      publishDate: fallbackPublishDate,
      weekday,
      day: item.day || `День ${dayIdx + 1}`
    };
  });
}

/**
 * Groups planner items by their publish dates.
 */
export function groupItemsByDay(items: PlannerItem[]): Record<string, PlannerItem[]> {
  return items.reduce((acc, item) => {
    if (!item) return acc;
    const groupKey = item.publishDate || 'Unknown';
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, PlannerItem[]>);
}

/**
 * Formats full publication dates with day names.
 */
export function formatDateFull(dateValue: string): string {
  const match = String(dateValue || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const yyyy = match[1];
    const mm = match[2];
    const dd = match[3];

    const y = parseInt(yyyy, 10);
    const m = parseInt(mm, 10) - 1;
    const d = parseInt(dd, 10);
    const tempDate = new Date(y, m, d, 12, 0, 0);
    const weekdays = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const weekdayName = weekdays[tempDate.getDay()];
    
    return `${dd}.${mm} — ${weekdayName}`;
  }
  return dateValue === 'Unknown' ? 'Дата не определена' : dateValue;
}

/**
 * Formats header date labels.
 */
export function formatDateLabelDisplay(dateValue?: string): string | null {
  if (!dateValue) return null;
  const match = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10) - 1;
  const d = parseInt(match[3], 10);
  const date = new Date(y, m, d, 12, 0, 0);

  return date.toLocaleDateString('ru-RU', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
  }).replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Formats custom label inside each card item.
 */
export function formatDateLabelCard(dateValue?: string): string | null {
  if (!dateValue || isNaN(Date.parse(dateValue))) return null;
  const date = new Date(dateValue);
  return date.toLocaleDateString('ru-RU', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
  }).replace(/^\w/, (c) => c.toUpperCase());
}
