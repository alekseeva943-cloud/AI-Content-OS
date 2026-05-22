export interface GuestConfig {
  name: string;
  expertise: string;
  speakingStyle: string; // e.g. "expert", "casual", "storyteller", "brutal"
  energyLevel: number; // e.g. 1 to 10
}

export interface PodcastConfig {
  topic: string;
  durationMinutes: number; // 1 to 60
  guestEnabled: boolean;
  guest: GuestConfig;
}

export interface ScriptSegment {
  id: string;
  type: 'hook' | 'intro' | 'discussion' | 'transition' | 'question' | 'outro' | 'cta';
  speaker: 'host' | 'guest';
  speakerName: string;
  title: string;
  text: string;
  durationSeconds: number;
}

export interface PodcastResult {
  id: string;
  topic: string;
  durationMinutes: number;
  guestConfig?: GuestConfig;
  title: string;
  description: string;
  createdAt: string;
  script: ScriptSegment[];
  summary: string;
}

export interface PodcastVoice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  previewUrl?: string;
  description: string;
}

export interface VoiceSelection {
  hostVoiceId: string;
  guestVoiceId?: string;
}
