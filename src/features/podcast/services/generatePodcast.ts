import { PodcastConfig, PodcastResult } from '../types/podcast.types';

export async function generatePodcast(config: PodcastConfig): Promise<PodcastResult> {
  const response = await fetch('/api/podcast/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = 'Failed to generate podcast script';
    try {
      const parsed = JSON.parse(errText);
      message = parsed.error || message;
    } catch {
      message = errText || message;
    }
    throw new Error(message);
  }

  return response.json();
}
