export type AvatarGender = 'male' | 'female';
export type AvatarCategory = 'business' | 'casual' | 'educational' | 'creative';
export type AvatarStyle = 'normal' | 'close-up';

export interface Avatar {
  id: string;
  name: string;
  gender: AvatarGender;
  category: AvatarCategory;
  language: string;
  energyLevel: number; // 1-10
  speakingStyle: string;
  thumbnail: string;
  previewVideo: string;
  description: string;
  avatarStyle: AvatarStyle;
}

export interface ScriptScene {
  id: string;
  narration: string;
  visuals: string;
  emotion: string;
  gesture: string;
  durationSeconds: number;
}

export interface CaptionStyles {
  font: string;
  color: string;
  animation: string;
}

export interface AvatarScript {
  title: string;
  description: string;
  summary: string;
  hook: string;
  scenes: ScriptScene[];
  captionStyles: CaptionStyles;
}

export type AvatarGenerationStage = 
  | 'building_script'
  | 'preparing_payload'
  | 'sending_request'
  | 'waiting_render'
  | 'fetching_asset'
  | 'finalizing_player'
  | 'idle'
  | 'error';

export interface GenerationProgress {
  stage: AvatarGenerationStage;
  percent: number;
  message: string;
  elapsedSeconds: number;
}

export interface DebugLog {
  timestamp: string;
  httpStatus?: number;
  rawResponse?: string;
  requestBody?: string;
  latencyMs?: number;
  providerName: string;
  avatarId?: string;
  renderingStatus?: string;
  message: string;
  type: 'info' | 'error' | 'success';
}
