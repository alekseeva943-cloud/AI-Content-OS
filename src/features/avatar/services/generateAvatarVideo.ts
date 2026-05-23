import { useDebugStore } from '@/src/stores/useDebugStore';
import { Avatar, AvatarScript } from '../types/avatar.types';

export interface GenerateVideoRequest {
  script: AvatarScript;
  avatar: Avatar;
  voiceId: string;
  voiceSettings?: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
  heygenApiKey?: string;
  onStageChange?: (stage: string, percent: number) => void;
}

export interface GenerateVideoResponse {
  success: boolean;
  videoId: string;
  videoUrl?: string;
  estimatedCost: number;
  durationSeconds: number;
  rawResponse?: any;
  httpStatus: number;
  latencyMs: number;
  providerName: string;
}

// Simple generation mutex
let isGenerating = false;
let lastGenerateTime = 0;
const COOLDOWN_MS = 5000; // 5 second cooldown preventing rapid clicks (Requirement 11)

export async function generateAvatarVideo(req: GenerateVideoRequest): Promise<GenerateVideoResponse> {
  const addLog = useDebugStore.getState().addLog;
  const startTime = Date.now();

  // Safety checks (Requirement 11: Cost Safety)
  if (isGenerating) {
    throw new Error('Уже запущена генерация другого аватара. Пожалуйста, подождите завершения.');
  }
  
  const now = Date.now();
  if (now - lastGenerateTime < COOLDOWN_MS) {
    const waitSecs = Math.ceil((COOLDOWN_MS - (now - lastGenerateTime)) / 1000);
    throw new Error(`Пожалуйста, подождите перед следующим рендером. Кулдаун активен: ${waitSecs} сек.`);
  }

  isGenerating = true;
  lastGenerateTime = now;

  try {
    req.onStageChange?.('Preparing avatar payload', 15);
    
    // Calculate estimated cost (Requirement 11)
    // HeyGen character rendering is about $0.20 per minute.
    const totalDuration = req.script.scenes.reduce((acc, s) => acc + (s.durationSeconds || 10), 0) + 5; // Add hook duration
    const estimatedCost = parseFloat(((totalDuration / 60) * 0.40).toFixed(4)); // $0.40 per min estimated

    const payload = {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: req.avatar.id,
            avatar_style: req.avatar.avatarStyle || 'normal'
          },
          voice: {
            type: 'text',
            input_text: `${req.script.hook}\n\n` + req.script.scenes.map(s => s.narration).join('\n\n'),
            voice_id: req.voiceId
          }
        }
      ],
      dimension: {
        width: 1280,
        height: 720
      }
    };

    req.onStageChange?.('Sending render request', 30);

    // If key is present, execute real HeyGen call
    if (req.heygenApiKey && req.heygenApiKey.trim().length > 10) {
      addLog({
        type: 'request',
        module: 'AI-Avatar-Render',
        message: `Dispatching HeyGen Render request. Avatar: ${req.avatar.id}. Voice: ${req.voiceId}`,
        data: {
          providerName: 'HeyGen',
          avatarId: req.avatar.id,
          requestBody: JSON.stringify(payload)
        }
      });

      const fetchStart = Date.now();
      const response = await fetch('https://api.heygen.com/v2/video/generate', {
        method: 'POST',
        headers: {
          'X-Api-Key': req.heygenApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const latencyMs = Date.now() - fetchStart;
      const httpStatus = response.status;
      const rawText = await response.text();

      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(rawText);
      } catch (e) {}

      // Add detailed trace in Debug console (Requirement 1)
      addLog({
        type: response.ok ? 'response' : 'error',
        module: 'AI-Avatar-Render',
        message: response.ok ? 'HeyGen render queued successfully' : `HeyGen API Error: ${httpStatus}`,
        data: {
          httpStatus,
          rawResponse: rawText,
          requestBody: JSON.stringify(payload),
          latencyMs,
          providerName: 'HeyGen',
          avatarId: req.avatar.id,
          renderingStatus: response.ok ? 'queued' : 'failed'
        }
      });

      if (!response.ok) {
        throw new Error(`HeyGen API Error (${httpStatus}): ${parsedJson?.message || rawText || 'Render failed'}`);
      }

      isGenerating = false;
      return {
        success: true,
        videoId: parsedJson?.data?.video_id || `heygen_${Math.random().toString(36).substring(7)}`,
        estimatedCost,
        durationSeconds: totalDuration,
        rawResponse: parsedJson,
        httpStatus,
        latencyMs,
        providerName: 'HeyGen'
      };

    } else {
      // PREMIUM fall back to simulation with elegant, timed log statements matching exactly the HeyGen pipeline (Requirement 1, 7, 11)
      const latencyMs = Math.round(Math.random() * 300 + 150);
      const videoId = `sim_heygen_${Math.random().toString(36).substr(2, 9)}`;

      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, latencyMs));

      addLog({
        type: 'response',
        module: 'AI-Avatar-Render-Sim',
        message: 'HeyGen rendering queued successfully (Simulation Mode). For real renders, provide a premium HeyGen API key in Settings.',
        data: {
          httpStatus: 200,
          rawResponse: JSON.stringify({ code: 100, data: { video_id: videoId }, message: 'success' }),
          requestBody: JSON.stringify(payload),
          latencyMs,
          providerName: 'HeyGen (Simulated)',
          avatarId: req.avatar.id,
          renderingStatus: 'pending'
        }
      });

      isGenerating = false;
      return {
        success: true,
        videoId,
        estimatedCost,
        durationSeconds: totalDuration,
        httpStatus: 200,
        latencyMs,
        providerName: 'HeyGen (Simulated)'
      };
    }

  } catch (error: any) {
    isGenerating = false;
    const latencyErrorMs = Date.now() - startTime; AddDetailedErrorLog(error, req.avatar, latencyErrorMs);
    throw error;
  }
}

function AddDetailedErrorLog(error: any, avatar: Avatar, latencyMs: number) {
  const addLog = useDebugStore.getState().addLog;
  addLog({
    type: 'error',
    module: 'AI-Avatar-Render-Failure',
    message: `Video pipeline crashed: ${error.message || error}`,
    data: {
      httpStatus: error.status || 500,
      rawResponse: error.stack || String(error),
      latencyMs,
      providerName: 'HeyGen',
      avatarId: avatar.id,
      renderingStatus: 'failed'
    }
  });
}
