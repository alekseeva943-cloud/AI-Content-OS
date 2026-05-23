import { useDebugStore } from '@/src/stores/useDebugStore';

export interface CheckStatusRequest {
  videoId: string;
  heygenApiKey?: string;
  retryCount?: number;
}

export interface CheckStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progressPercent: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string | null;
  httpStatus: number;
  latencyMs: number;
  rawResponse?: any;
}

export async function checkAvatarStatus(req: CheckStatusRequest): Promise<CheckStatusResponse> {
  const addLog = useDebugStore.getState().addLog;
  const startTime = Date.now();

  const isSimulated = req.videoId.startsWith('sim_');

  if (isSimulated) {
    // Return mock status based on retry count (simulating polling)
    const retries = req.retryCount || 0;
    const latencyMs = Math.round(Math.random() * 50 + 20);

    let status: 'pending' | 'processing' | 'completed' | 'failed' = 'processing';
    let progressPercent = 30 + retries * 15;
    let videoUrl: string | undefined = undefined;
    let thumbnailUrl: string | undefined = undefined;

    if (progressPercent >= 100) {
      status = 'completed';
      progressPercent = 100;
      // High quality stock video matching speaking to camera to represent a stunning premium outcome!
      videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-businessman-talking-to-camera-at-office-41849-large.mp4';
      thumbnailUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300';
    }

    addLog({
      type: 'response',
      module: 'AI-Avatar-Polling-Sim',
      message: `Checked video status (Simulated). Status: ${status}, Progress: ${progressPercent}%`,
      data: {
        httpStatus: 200,
        latencyMs,
        providerName: 'HeyGen (Simulated)',
        renderingStatus: status,
        progressPercent
      }
    });

    return {
      status,
      progressPercent,
      videoUrl,
      thumbnailUrl,
      httpStatus: 200,
      latencyMs
    };
  } else {
    // REAL HEYGEN CALL
    addLog({
      type: 'request',
      module: 'AI-Avatar-Polling',
      message: `Polling HeyGen status for ${req.videoId}`,
      data: {
        providerName: 'HeyGen',
        videoId: req.videoId
      }
    });

    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (req.heygenApiKey) {
      headers['X-Api-Key'] = req.heygenApiKey;
    }

    const fetchStart = Date.now();
    try {
      const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${req.videoId}`, {
        method: 'GET',
        headers
      });

      const latencyMs = Date.now() - fetchStart;
      const httpStatus = response.status;
      const rawText = await response.text();

      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(rawText);
      } catch (e) {}

      addLog({
        type: response.ok ? 'response' : 'error',
        module: 'AI-Avatar-Polling',
        message: response.ok ? `Status: ${parsedJson?.data?.status || 'unknown'}` : `Polling Error: ${httpStatus}`,
        data: {
          httpStatus,
          rawResponse: rawText,
          latencyMs,
          providerName: 'HeyGen',
          videoId: req.videoId,
          renderingStatus: parsedJson?.data?.status || 'failed'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to check status: ${parsedJson?.message || rawText}`);
      }

      const rawStatus = parsedJson?.data?.status; // "pending", "processing", "completed", "failed"
      const percent = parsedJson?.data?.status === 'completed' ? 100 : (parsedJson?.data?.status === 'processing' ? 50 : 10);
      
      return {
        status: rawStatus || 'processing',
        progressPercent: percent,
        videoUrl: parsedJson?.data?.video_url,
        thumbnailUrl: parsedJson?.data?.thumbnail_url,
        error: parsedJson?.data?.error,
        httpStatus,
        latencyMs,
        rawResponse: parsedJson
      };

    } catch (err: any) {
      const latencyErrorMs = Date.now() - startTime;
      addLog({
        type: 'error',
        module: 'AI-Avatar-Polling-Error',
        message: `HTTP Check Status Request Failed: ${err.message || err}`,
        data: {
          httpStatus: 500,
          latencyMs: latencyErrorMs,
          providerName: 'HeyGen',
          videoId: req.videoId,
          renderingStatus: 'failed'
        }
      });
      throw err;
    }
  }
}
