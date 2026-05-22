export interface SynthesisRequest {
  text: string;
  voiceId: string;
  apiKey: string;
}

export async function generatePodcastAudio({ text, voiceId, apiKey }: SynthesisRequest): Promise<string> {
  const response = await fetch('/api/podcast/synthesize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, voiceId, apiKey }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to synthesize audio');
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
