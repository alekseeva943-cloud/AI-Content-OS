import { RegistryVoice } from '../constants/voiceRegistry';

// In-memory cache for audio speech synthesis to prevent redundant API billings
const audioCache = new Map<string, Blob>();

/**
 * Creates a unique string hash from a text script + voice Id
 */
function computeCacheKey(text: string, voiceId: string): string {
  let hash = 0;
  const rawKey = `${voiceId}:${text}`;
  for (let i = 0; i < rawKey.length; i++) {
    const char = rawKey.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to a 32bit integer
  }
  return `cached_speech_${Math.abs(hash)}`;
}

/**
 * Synthesizes a piece of text to an audio blob using ElevenLabs Multilingual V2.
 * Uses local cached response if present to save credits and latency.
 */
export async function synthesizeElevenLabsAudio(
  text: string,
  voice: RegistryVoice,
  apiKey?: string,
  onLog?: (logEntry: any) => void
): Promise<{ audioBlob: Blob; cacheHit: boolean }> {
  if (!text) {
    throw new Error('Пустой текст передан для синтеза речи.');
  }

  const cacheKey = computeCacheKey(text, voice.localId);
  const cachedBlob = audioCache.get(cacheKey);

  if (cachedBlob) {
    if (onLog) {
      onLog({
        type: 'response',
        module: '[AUDIO GENERATION]',
        message: `[ElevenLabs CACHE] Найдено совпадение в локальном кэше! Пропускаем API вызов для: "${text.substring(0, 40)}..."`,
        data: {
          cacheKey,
          voice: voice.displayName,
          textSize: text.length
        }
      });
    }
    return { audioBlob: cachedBlob, cacheHit: true };
  }

  if (!apiKey || apiKey.trim().length <= 10) {
    // Simulated Offline/Mock Audio Generation
    if (onLog) {
      onLog({
        type: 'info',
        module: '[AUDIO GENERATION]',
        message: `ElevenLabs API ключ отсутствует (симуляция). Генерируется резервный аудиофайл.`,
        data: { voice: voice.displayName, textPreview: text.substring(0, 40) }
      });
    }
    
    // Create a tiny valid silent 1-second WAV file as fallback blob
    const sampleRate = 8000;
    const numSamples = sampleRate * 1; // 1 second
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + numSamples * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, 1, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, numSamples * 2, true);

    const blob = new Blob([buffer], { type: 'audio/wav' });

    // Cache simulated audio
    audioCache.set(cacheKey, blob);
    return { audioBlob: blob, cacheHit: false };
  }

  const startTime = Date.now();
  if (onLog) {
    onLog({
      type: 'request',
      module: '[AUDIO GENERATION]',
      message: `Запрос ElevenLabs к голосу "${voice.displayName}" (id: ${voice.providerVoiceId}). Платформа: eleven_multilingual_v2`,
      data: {
        text: text.substring(0, 80) + (text.length > 80 ? '...' : ''),
        voiceSettings: {
          stability: voice.stability,
          similarity_boost: voice.similarityBoost,
          style: voice.style
        }
      }
    });
  }

  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voice.providerVoiceId}`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: voice.stability,
        similarity_boost: voice.similarityBoost,
        style: voice.style,
        use_speaker_boost: true
      }
    })
  });

  const latencyMs = Date.now() - startTime;

  if (!response.ok) {
    const errorText = await response.text();
    if (onLog) {
      onLog({
        type: 'error',
        module: '[AUDIO GENERATION]',
        message: `Ошибка ElevenLabs API (${response.status}): ${errorText}`,
        data: { status: response.status, latencyMs }
      });
    }
    throw new Error(`ElevenLabs API Error (${response.status}): ${errorText || 'Synthesis failed'}`);
  }

  const audioBlob = await response.blob();
  audioCache.set(cacheKey, audioBlob);

  if (onLog) {
    onLog({
      type: 'response',
      module: '[AUDIO GENERATION]',
      message: `Успешный синтез ElevenLabs речи за ${latencyMs}ms. Размер: ${(audioBlob.size / 1024).toFixed(1)} КБ.`,
      data: {
        latencyMs,
        blobSize: audioBlob.size,
        contentType: audioBlob.type
      }
    });
  }

  return { audioBlob, cacheHit: false };
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Clears the synthesized audio local cache
 */
export function clearSynthesisCache(): void {
  audioCache.clear();
}
