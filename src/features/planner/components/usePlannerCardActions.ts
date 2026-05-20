import { useState } from 'react';
import { PlannerItem, PostSettings } from '@/src/types/planner';
import { useFavoritesStore } from '@/src/stores/favoritesStore';
import { generatePostText, regeneratePlannerItem } from '@/src/services/ai/client';
import { toast } from 'sonner';

interface UsePlannerCardActionsProps {
  initialItem: PlannerItem;
  index: number;
  localSettings: PostSettings;
  sourceInfo?: { id?: string; module?: string; title?: string } | null;
}

export function usePlannerCardActions({
  initialItem,
  index,
  localSettings,
  sourceInfo
}: UsePlannerCardActionsProps) {
  const [item, setItem] = useState(initialItem);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  const favoriteId = `planner-item-${item.topic.replace(/\s+/g, '-').slice(0, 40)}-${item.channel}-${item.publishDate || item.day}-${item.time}`;
  const activeFavorite = isFavorite(favoriteId);

  const toggleFavorite = () => {
    if (activeFavorite) {
      removeFavorite(favoriteId);
      toast.error('Удалено из избранного');
    } else {
      addFavorite({
        id: favoriteId,
        moduleId: 'planner',
        type: item.type || 'idea',
        title: item.topic,
        content: { ...item, aiSettings: localSettings },
        metadata: {
          day: item.day,
          channel: item.channel,
          time: item.time,
          sourceId: sourceInfo?.id,
          sourceModule: sourceInfo?.module
        }
      });
      toast.success('Сохранено в избранное');
    }
  };

  const handleCopy = (textToCopy?: string) => {
    const text = textToCopy || `Тема: ${item.topic}\nОписание: ${item.description || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGeneratePost = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const itemWithSettings = { ...item, aiSettings: localSettings };
      const text = await generatePostText(itemWithSettings);
      setGeneratedText(text);
      toast.success('Пост сгенерирован');
    } catch (err) {
      console.error(err);
      toast.error('Ошибка генерации поста');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    try {
      const itemWithSettings = { ...item, aiSettings: localSettings };
      const newItem = await regeneratePlannerItem(itemWithSettings);
      setItem(newItem);
      setGeneratedText(null); // Clear old post as content changed
      toast.success('Идея пересобрана');
    } catch (err) {
      console.error(err);
      toast.error('Ошибка регенерации идеи');
    } finally {
      setIsRegenerating(false);
    }
  };

  return {
    item,
    setItem,
    copied,
    isGenerating,
    isRegenerating,
    generatedText,
    setGeneratedText,
    activeFavorite,
    toggleFavorite,
    handleCopy,
    handleGeneratePost,
    handleRegenerate
  };
}
