export interface RegistryVoice {
  localId: string;
  displayName: string;
  provider: 'elevenlabs';
  providerVoiceId: string;
  language: string;
  gender: 'male' | 'female';
  archetype: 'expert' | 'storyteller' | 'media_host' | 'calm_narrator' | 'energetic_creator' | 'conversational_coach';
  previewText: string;
  speed: number;            // Speech rate multiplier (e.g. 0.95)
  pitch: number;            // Pitch shift (e.g. 0.05)
  stability: number;        // ElevenLabs stabilizer (0 to 1)
  similarityBoost: number;  // ElevenLabs clarity enhancer (0 to 1)
  style: number;            // ElevenLabs style exaggeration (0 to 1)
  emotionalProfile: string; // Description of vocal style (e.g., "Меланхоличный", "Теплый")
}

export const VOICE_REGISTRY: RegistryVoice[] = [
  // --- MALE VOICES ---
  {
    localId: 'alexei',
    displayName: 'Алексей',
    provider: 'elevenlabs',
    providerVoiceId: 'IKne3meq5aC27shg036e', // Charlie (Stable, high-quality deep voice)
    language: 'ru-RU',
    gender: 'male',
    archetype: 'media_host',
    previewText: 'Приветствую! Мы разрабатываем новую веху в производстве видео со сверхреалистичными ИИ-аватарами. Мой голос идеально подходит для медиа и ярких вступлений.',
    speed: 1.0,
    pitch: 0.0,
    stability: 0.75,
    similarityBoost: 0.85,
    style: 0.10,
    emotionalProfile: 'Уверенный медиа-баритон с четкой дикцией и прекрасной подачей.'
  },
  {
    localId: 'dmitry',
    displayName: 'Дмитрий',
    provider: 'elevenlabs',
    providerVoiceId: 'pNInz6obpg7j8Yt0QLZq', // Adam (Extremely expressive and narrating speaker)
    language: 'ru-RU',
    gender: 'male',
    archetype: 'storyteller',
    previewText: 'Рад услышать вас. Это Дмитрий. Медленные вдохи, вдумчивые акценты на словах делают наше повествование по-настоящему кинематографичным.',
    speed: 0.90,
    pitch: -0.05,
    stability: 0.85,
    similarityBoost: 0.80,
    style: 0.20,
    emotionalProfile: 'Бархатистый, глубокий рассказчик с теплыми разговорными паузами.'
  },
  {
    localId: 'vladislav',
    displayName: 'Владислав',
    provider: 'elevenlabs',
    providerVoiceId: 'N2lVS1w4EtoT3gKWY9S9', // Callum (Serious and professional speaker)
    language: 'ru-RU',
    gender: 'male',
    archetype: 'expert',
    previewText: 'Здравствуйте. Я Владислав. Представляю аналитический обзор рынка и экспертных стратегий. Настоящий голос прагматизма и порядка.',
    speed: 0.98,
    pitch: -0.08,
    stability: 0.82,
    similarityBoost: 0.78,
    style: 0.05,
    emotionalProfile: 'Строгий, деловой, авторитетный тон, идеальный для докладов.'
  },

  // --- FEMALE VOICES ---
  {
    localId: 'anna',
    displayName: 'Анна',
    provider: 'elevenlabs',
    providerVoiceId: 'EXAVITQu4vr4xnSDXMaL', // Sarah (Soft, whispering and gentle)
    language: 'ru-RU',
    gender: 'female',
    archetype: 'calm_narrator',
    previewText: 'Привет, мои дорогие! С вами Аня. Давайте сделаем глубокий вдох... И наполним этот день гармонией и умиротворением.',
    speed: 0.85,
    pitch: 0.05,
    stability: 0.85,
    similarityBoost: 0.75,
    style: 0.15,
    emotionalProfile: 'Нежный, эмпатичный, медитативно-успокаивающий тембр.'
  },
  {
    localId: 'viktoria',
    displayName: 'Виктория',
    provider: 'elevenlabs',
    providerVoiceId: 'piTKgcLEGmPEe242C3v0', // Nicole (Clear active speech coach)
    language: 'ru-RU',
    gender: 'female',
    archetype: 'conversational_coach',
    previewText: 'Приветствую вас! Я Виктория. Наша цель — развить невероятный уровень личной эффективности за счет грамотной коммуникации. Давайте начнем!',
    speed: 1.02,
    pitch: 0.0,
    stability: 0.72,
    similarityBoost: 0.82,
    style: 0.10,
    emotionalProfile: 'Живой, вдохновляющий и отлично структурированный женский голос.'
  },
  {
    localId: 'ekaterina',
    displayName: 'Екатерина',
    provider: 'elevenlabs',
    providerVoiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel (Energetic social media creator)
    language: 'ru-RU',
    gender: 'female',
    archetype: 'energetic_creator',
    previewText: 'Всем привет! На связи Катя. Тренды сменяют друг друга каждую секунду, и мы выведем ваш контент на совершенно безумную скорость!',
    speed: 1.10,
    pitch: 0.08,
    stability: 0.68,
    similarityBoost: 0.85,
    style: 0.25,
    emotionalProfile: 'Яркий, игровой, супер-динамичный темп молодежного лидера.'
  }
];

export const DEFAULT_VOICE_ID = 'alexei';

export function getVoiceFromRegistry(idOrVoiceId: string): RegistryVoice | undefined {
  const cleanId = idOrVoiceId.trim().toLowerCase();
  
  // 1. Match by localId
  let match = VOICE_REGISTRY.find(v => v.localId.toLowerCase() === cleanId);
  if (match) return match;

  // 2. Match by providerVoiceId
  match = VOICE_REGISTRY.find(v => v.providerVoiceId.toLowerCase() === cleanId);
  if (match) return match;

  // 3. Match by name
  match = VOICE_REGISTRY.find(v => v.displayName.toLowerCase() === cleanId);
  return match;
}
