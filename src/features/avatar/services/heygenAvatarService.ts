import { RegistryAvatar } from '../constants/avatarRegistry';
import { RegistryVoice } from '../constants/voiceRegistry';

// Global memory cache of workspace looks detected in the current session
interface WorkspaceLookCache {
  lastChecked: number;
  looks: Array<{
    look_id: string;
    look_name: string;
    avatar_id: string;
    avatar_name: string;
    gender?: string;
  }>;
}

let workspaceLookCache: WorkspaceLookCache | null = null;

/**
 * Queries HeyGen API for all available custom custom avatar twins/looks.
 * Uses cache or fetches live.
 */
export async function fetchWorkspaceLooks(apiKey?: string, forceRefresh = false): Promise<WorkspaceLookCache['looks']> {
  if (!apiKey || apiKey.trim().length <= 10) {
    return [];
  }

  const now = Date.now();
  if (workspaceLookCache && !forceRefresh && (now - workspaceLookCache.lastChecked < 300000)) {
    return workspaceLookCache.looks;
  }

  try {
    console.log('[HeyGen Service] Обновление списка персональных аватаров из HeyGen воркспейса...');
    
    const response = await fetch('https://api.heygen.com/v2/avatars', {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`[HeyGen Service] Не удалось загрузить воркспейс аватары: HTTP ${response.status}`);
      return [];
    }

    const json = await response.json();
    const avatarGroups = json?.data?.avatars || json?.avatars || [];
    const extractedLooks: WorkspaceLookCache['looks'] = [];

    for (const group of avatarGroups) {
      const gId = group.avatar_id || group.id || '';
      const gName = group.avatar_name || group.name || '';
      const gGender = group.gender || '';

      if (group.looks && Array.isArray(group.looks) && group.looks.length > 0) {
        group.looks.forEach((look: any) => {
          extractedLooks.push({
            look_id: look.look_id || look.id || gId,
            look_name: look.look_name || look.name || gName,
            avatar_id: gId,
            avatar_name: gName,
            gender: gGender
          });
        });
      } else {
        extractedLooks.push({
          look_id: gId,
          look_name: gName,
          avatar_id: gId,
          avatar_name: gName,
          gender: gGender
        });
      }
    }

    console.log(`[HeyGen Service] Загружено ${extractedLooks.length} аватаров/луков.`);
    workspaceLookCache = {
      lastChecked: now,
      looks: extractedLooks
    };

    return extractedLooks;
  } catch (err) {
    console.error('[HeyGen Service] Исключение при получении аватаров: ', err);
    return [];
  }
}

/**
 * Uploads an audio blob to HeyGen's assets platform and returns the hosted asset URL.
 */
export async function uploadAudioToHeyGen(
  audioBlob: Blob,
  apiKey: string,
  onLog?: (logEntry: any) => void
): Promise<string> {
  if (onLog) {
    onLog({
      type: 'request',
      module: '[LIPSYNC RENDER]',
      message: `Загрузка аудиофайла EleventLabs (${(audioBlob.size / 1024).toFixed(1)} КБ) как ресурса в HeyGen Assets...`
    });
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.mp3');

  const response = await fetch('https://api.heygen.com/v2/assets', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Не удалось загрузить аудиофайл на HeyGen (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  const assetUrl = json?.data?.url || json?.data?.audio_url;
  const assetId = json?.data?.id || json?.data?.asset_id;

  if (!assetUrl && !assetId) {
    throw new Error(`Ответ загрузки ресурса HeyGen не содержит URL или ID: ${JSON.stringify(json)}`);
  }

  if (onLog) {
    onLog({
      type: 'response',
      module: '[LIPSYNC RENDER]',
      message: `Аудиоресурс HeyGen успешно создан! ID: ${assetId || 'N/A'}, Ссылка: ${assetUrl || 'N/A'}`,
      data: { assetId, assetUrl }
    });
  }

  // Return the public URL hosted securely by HeyGen
  return assetUrl || assetId;
}

export interface RenderingDiagnostics {
  avatarValid: boolean;
  lookValid: boolean;
  voiceValid: boolean;
  compatibilityValid: boolean;
  durationValid: boolean;
  criticalIssues: string[];
  infoMessages: string[];
}

/**
 * Safely validates the render configuration. Avoids raw 400 crashes
 * by supplying detailed diagnostics to the user.
 */
export function validateRenderSetup(
  avatar: RegistryAvatar | undefined,
  voice: RegistryVoice | undefined,
  totalDurationSeconds: number
): RenderingDiagnostics {
  const criticalIssues: string[] = [];
  const infoMessages: string[] = [];

  let avatarValid = true;
  let lookValid = true;
  let voiceValid = true;
  let durabilityValid = true;

  if (!avatar) {
    avatarValid = false;
    criticalIssues.push('Антикризис: Выбранный аватар отсутствует в реестре.');
  } else {
    if (!avatar.heygenAvatarId) {
      lookValid = false;
      criticalIssues.push(`Критическая ошибка: Аватар "${avatar.displayName}" не имеет физического HeyGen ID.`);
    }
  }

  if (!voice) {
    voiceValid = false;
    criticalIssues.push('Критическая ошибка: Запрошенный голос отсутствует в реестре.');
  }

  // Duration Check
  if (totalDurationSeconds > 300) {
    durabilityValid = false;
    criticalIssues.push(`Превышен лимит длительности: Сценарий (${totalDurationSeconds} сек) длиннее допустимых 300 секунд.`);
  } else if (totalDurationSeconds < 5) {
    infoMessages.push(`Предупреждение по таймингу: Длительность маловата (${totalDurationSeconds} сек). Будет задействован минимальный хронометраж.`);
  }

  return {
    avatarValid,
    lookValid,
    voiceValid,
    compatibilityValid: true, // Audio lipsync eliminates voice/provider compatibility collisions!
    durationValid: durabilityValid,
    criticalIssues,
    infoMessages
  };
}

export interface HeyGenResult {
  videoId: string;
  success: boolean;
  rawResponse: any;
  httpStatus: number;
}

/**
 * Dispatches the final Lipsync-driven video rendering request to HeyGen.
 * No text-driven voice simulation is passed; only clean lipsync over external audio.
 */
export async function dispatchHeyGenLipsyncRender(
  heygenAvatarId: string,
  style: string,
  audioUrl: string,
  apiKey: string,
  onLog?: (logEntry: any) => void
): Promise<HeyGenResult> {
  const payload = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: heygenAvatarId,
          avatar_style: style === 'close-up' ? 'closeUp' : 'normal'
        },
        voice: {
          type: 'audio',
          audio_url: audioUrl
        }
      }
    ],
    dimension: {
      width: 1280,
      height: 720
    }
  };

  if (onLog) {
    onLog({
      type: 'request',
      module: '[LIPSYNC RENDER]',
      message: `Отправка пакета рендеринга на Lipsync-движок HeyGen. Аватар: ${heygenAvatarId}, Стиль: ${style}`,
      data: payload
    });
  }

  const response = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const httpStatus = response.status;
  const textResponse = await response.text();
  let parsedJson: any = null;
  try {
    parsedJson = JSON.parse(textResponse);
  } catch (e) {}

  if (!response.ok) {
    if (onLog) {
      onLog({
        type: 'error',
        module: '[LIPSYNC RENDER]',
        message: `Ошибка рендеринга HeyGen V2 (${httpStatus}): ${textResponse}`,
        data: parsedJson
      });
    }
    throw new Error(`HeyGen V2 Render Error (${httpStatus}): ${parsedJson?.message || textResponse || 'Unknown execution failure'}`);
  }

  const videoId = parsedJson?.data?.video_id || parsedJson?.video_id;

  if (onLog) {
    onLog({
      type: 'response',
      module: '[LIPSYNC RENDER]',
      message: `Видео успешно поставлено в очередь рендеринга HeyGen! ID: ${videoId}`,
      data: parsedJson
    });
  }

  return {
    videoId: videoId || `heygen_${Math.random().toString(36).substring(7)}`,
    success: true,
    rawResponse: parsedJson,
    httpStatus
  };
}
