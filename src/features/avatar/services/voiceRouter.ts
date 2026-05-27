// src/services/voiceRouter.ts

import {
  getVoiceFromRegistry,
  RegistryVoice,
  VOICE_REGISTRY
} from '../constants/voiceRegistry';

export interface VoiceRouteResult {
  voice: RegistryVoice;
  isFallback: boolean;
  message: string;
}

/**
 * Canonical production voice router.
 * Uses ONLY static VOICE_REGISTRY voices.
 */
export function routeVoice(
  voiceId: string
): VoiceRouteResult {

  const matched =
    getVoiceFromRegistry(
      voiceId
    );

  if (matched) {

    return {
      voice: matched,

      isFallback: false,

      message:
        `[VOICE ROUTING] Selected voice "${matched.displayName}" (${matched.localId})`
    };

  }

  // Safe stable fallback
  const fallbackVoice =
    VOICE_REGISTRY.find(
      (v) =>
        v.localId === 'dmitry'
    ) || VOICE_REGISTRY[0];

  return {
    voice: fallbackVoice,

    isFallback: true,

    message:
      `[VOICE ROUTING] Voice "${voiceId}" not found. Fallback to "${fallbackVoice.displayName}".`
  };
}

/**
 * Lightweight natural speech preprocessing.
 * IMPORTANT:
 * Avoid aggressive ellipsis spam.
 * Avoid robotic pacing artifacts.
 */
export function preprocessTextForVoice(
  text: string,
  voice: RegistryVoice
): string {

  if (!text) {
    return '';
  }

  let processed = text

    .replace(/\bAI\b/gi,
      'искусственный интеллект')

    .replace(/\bAPI\b/gi,
      'эй пи ай')

    .replace(/\bUI\b/gi,
      'интерфейс')

    .replace(/\bUX\b/gi,
      'ю икс')

    .replace(/\bUSD\b/gi,
      'долларов')

    .replace(/\bIT\b/gi,
      'айти');

  // Gentle archetype flavoring only.
  // No broken pauses.

  switch (voice.archetype) {

    case 'storyteller':

      processed =
        `Знаете, ${processed}`;

      break;

    case 'calm_narrator':

      processed =
        `Спокойно и вдумчиво. ${processed}`;

      break;

    case 'media_host':

      processed =
        `Итак. ${processed}`;

      break;

    case 'energetic_creator':

      processed =
        `Смотрите! ${processed}`;

      break;

    case 'conversational_coach':

      processed =
        `Давайте разберёмся. ${processed}`;

      break;

    case 'expert':

      processed =
        `Важно понимать: ${processed}`;

      break;
  }

  processed = processed

    .replace(/\s+/g, ' ')

    .replace(/\.\.+/g, '.')

    .trim();

  return processed;
}