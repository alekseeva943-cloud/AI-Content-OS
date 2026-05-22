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

export type DebugStageId = 
  | 'collect_config'
  | 'build_prompt'
  | 'send_request'
  | 'wait_response'
  | 'parse_structure'
  | 'build_timeline'
  | 'prepare_audio'
  | 'finalize_episode';

export type DebugStatus = 'pending' | 'active' | 'success' | 'error';

export interface DebugStageLog {
  id: DebugStageId;
  label: string;
  status: DebugStatus;
  startedAt?: number;
  durationMs?: number;
  error?: string;
  details?: string;
}

export interface TelemetryLog {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  durationMs: number;
  retryCount: number;
  generationCount: number;
  cacheHitOrMiss: 'Cache Hit' | 'Cache Miss';
  requestId: string;
  timestamp: string;
  triggerReason: string;
}

export interface SessionStats {
  requestsThisSession: number;
  tokensThisSession: number;
  estimatedSessionCost: number;
  averageResponseTimeMs: number;
}

export interface VoiceDiagnostic {
  voiceId: string;
  voiceName: string;
  modelId: string;
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
  energy: number;
  cacheHit: boolean;
  durationMs: number;
  rawPayload: any;
  textRef: string;
  pitch: number;
  energy_curve: string;
  punctuation_behavior: string;
  pause_density: string;
  emotionality: number;
  cadence: string;
}

export interface DebugTraceState {
  stages: DebugStageLog[];
  totalDurationMs?: number;
  rawError?: string;
  aiPayload?: string;
  aiResponse?: string;
  aiRawResponse?: string;
  httpStatus?: number;
  parsingErrorDetails?: string;
  synthesisLog?: string[];
  lastUpdated: number;
  telemetry?: TelemetryLog;
  sessionStats?: SessionStats;
}

export class PodcastPipelineError extends Error {
  status?: number;
  rawResponse?: string;
  stageId?: DebugStageId;
  details?: string;

  constructor(message: string, options?: { status?: number; rawResponse?: string; stageId?: DebugStageId; details?: string }) {
    super(message);
    this.name = 'PodcastPipelineError';
    this.status = options?.status;
    this.rawResponse = options?.rawResponse;
    this.stageId = options?.stageId;
    this.details = options?.details;
  }
}

