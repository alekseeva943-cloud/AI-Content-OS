import { getVoiceFromRegistry, RegistryVoice, VOICE_REGISTRY } from '../constants/voiceRegistry';

export interface VoiceRouteResult {
  voice: RegistryVoice;
  isFallback: boolean;
  message: string;
}

/**
 * High-performance Voice Router. Maps requested local or external voice IDs
 * to certified production-ready voice metadata.
 */
export function routeVoice(voiceId: string): VoiceRouteResult {
  const matched = getVoiceFromRegistry(voiceId);
  if (matched) {
    return {
      voice: matched,
      isFallback: false,
      message: `[VOICE ROUTING] Успешно выбран премиальный голос: "${matched.displayName}" (${matched.localId})`
    };
  }

  // Fallback to Dmitry (highly stable and versatile storyteller)
  const defaultVoice = VOICE_REGISTRY.find(v => v.localId === 'dmitry') || VOICE_REGISTRY[0];
  return {
    voice: defaultVoice,
    isFallback: true,
    message: `[VOICE ROUTING] Запрошенный голос "${voiceId}" не найден в реестре. Выполнен безопасный переход на резервный голос "${defaultVoice.displayName}"`
  };
}

/**
 * Humanization Engine V3
 * Transforms a plain text script into an expressive, rhythmically deep spoken-word transcript.
 * Applies custom conversational fillers, micro breaths, and tempo marks tailored strictly to vocal archetypes.
 */
export function preprocessTextForVoice(text: string, voice: RegistryVoice): string {
  if (!text) return '';

  // Step 1: Normalize English technical acronyms to elegant phonetically spelled Russian strings
  let processed = text
    .replace(/\bAI\b/gi, 'ИИ')
    .replace(/\bAPI\b/gi, 'апи')
    .replace(/\bUI\b/gi, 'юи')
    .replace(/\bUX\b/gi, 'юикс')
    .replace(/\bHQ\b/gi, 'эйч-кью')
    .replace(/\bMP4\b/gi, 'эм-пи-четыре')
    .replace(/\bHD\b/gi, 'эйч-ди')
    .replace(/\bUSD\b/gi, 'долларов')
    .replace(/\bIT\b/gi, 'ит');

  // Step 2: Custom Archetype-Aware preprocessing
  switch (voice.archetype) {
    case 'storyteller': {
      // Storytellers benefit from deep, slow pauses (ellipses) and narrative openers
      processed = processed
        .replace(/,\s*/g, '... ')
        .replace(/;\s*/g, ' ... ')
        .replace(/\.\s*/g, '. ... ')
        .replace(/\?\s*/g, '? ... ');

      // 15% chance to insert storytelling conversational filler at starting point
      const storytellingOpeners = ['Послушайте... ', 'Знаете... ', 'Это удивительно, но... '];
      if (!processed.startsWith('Привет') && !processed.startsWith('Здравствуйте')) {
        processed = storytellingOpeners[Math.floor(Math.random() * storytellingOpeners.length)] + processed;
      }
      break;
    }

    case 'calm_narrator': {
      // Calm narrators have slow breathing pacing, gentle structures, and delicate separators
      processed = processed
        .replace(/,\s*/g, ', ... ')
        .replace(/\.\s*/g, '. ... ');

      const calmOpeners = ['Давайте сделаем вдох... ', 'Знаете, ', 'Тихо и спокойно... '];
      if (!processed.startsWith('Привет') && !processed.startsWith('Здравствуйте')) {
        processed = calmOpeners[Math.floor(Math.random() * calmOpeners.length)] + processed;
      }
      break;
    }

    case 'media_host': {
      // Media hosts are enthusiastic, engaging listeners first, and use crisp pauses
      processed = processed
        .replace(/!\s*/g, '! ')
        .replace(/:\s*/g, ' ... ');

      const hostOpeners = ['Итак! ', 'Смотрите, ', 'Встречайте! '];
      if (!processed.startsWith('Привет') && !processed.startsWith('Здравствуйте')) {
        processed = hostOpeners[Math.floor(Math.random() * hostOpeners.length)] + processed;
      }
      break;
    }

    case 'energetic_creator': {
      // Energetic creators talk fast, with high intensity. Use minimal long pauses. Replace long ellipses with commas.
      processed = processed
        .replace(/\s*\.\.\.\s*/g, ', ')
        .replace(/\s*—\s*/g, ', ')
        .replace(/\.\s*/g, '! '); // High excitement punctuation

      const highEnergyOpeners = ['Салют! ', 'Эй, привет! ', 'Короче! '];
      if (!processed.startsWith('Привет') && !processed.startsWith('Здравствуйте')) {
        processed = highEnergyOpeners[Math.floor(Math.random() * highEnergyOpeners.length)] + processed;
      }
      break;
    }

    case 'conversational_coach': {
      // Coaches instruct with logical structured emphasis and supportive fillers
      processed = processed
        .replace(/,\s*(что|как|где|когда|почему|если)/gi, ', ... $1')
        .replace(/;\s*/g, ' ... ');

      const coachOpeners = ['Давайте честно: ', 'Вдумайтесь, ', 'Смотрите, '];
      if (!processed.startsWith('Привет') && !processed.startsWith('Здравствуйте')) {
        processed = coachOpeners[Math.floor(Math.random() * coachOpeners.length)] + processed;
      }
      break;
    }

    case 'expert':
    default: {
      // Experts speak with crisp, clean academic transitions, avoiding unnecessary filler slop
      processed = processed
        .replace(/;\s*/g, ' ... ')
        .replace(/\s*—\s*/g, ', ');
      break;
    }
  }

  // Double breathing cleanup: collapse multiple duplicate ellipses
  processed = processed
    .replace(/(\s*\.\.\.\s*){2,}/g, ' ... ')
    .replace(/(\s*\?\s*\.\.\.\s*)/g, '? ... ')
    .replace(/(\s*!\s*\.\.\.\s*)/g, '! ... ')
    .trim();

  return processed;
}
