import { useState } from 'react';
import { PodcastConfig, PodcastResult } from '../types/podcast.types';
import { generatePodcast } from '../services/generatePodcast';
import { toast } from 'sonner';

export function usePodcastGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PodcastResult | null>(null);

  const generate = async (config: PodcastConfig) => {
    setIsGenerating(true);
    setError(null);
    try {
      const podcastResult = await generatePodcast(config);
      setResult(podcastResult);
      toast.success('Сценарий подкаста успешно создан!');
      return podcastResult;
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Ошибка генерации сценария подкаста';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearResult = () => {
    setResult(null);
  };

  return {
    isGenerating,
    error,
    result,
    generate,
    clearResult,
    setResult
  };
}
