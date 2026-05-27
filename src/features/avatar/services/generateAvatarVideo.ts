// src/services/generateAvatarVideo.ts

import { useDebugStore } from '@/src/stores/useDebugStore';

import {
  Avatar,
  AvatarScript
} from '../types/avatar.types';

import {
  resolveAndValidateAvatar
} from './avatarResolver';

export interface GenerateVideoRequest {

  script: AvatarScript;

  avatar: Avatar;

  voiceId: string;

  heygenApiKey?: string;

  onStageChange?: (
    stage: string,
    percent: number
  ) => void;
}

export interface GenerateVideoResponse {

  success: boolean;

  videoId: string;

  rawResponse?: any;

  provider: string;

  estimatedCost: number;

  durationSeconds: number;
}

function buildFullScript(
  script: AvatarScript
): string {

  const scenesText =
    script.scenes
      .map(
        (scene) =>
          scene.narration
      )
      .join('\n\n');

  return `
${script.hook}

${scenesText}
  `.trim();
}

function mapVoiceId(
  localVoiceId: string
): string {

  const normalized =
    localVoiceId.toLowerCase();

  // HEYGEN / AZURE VOICES

  if (
    normalized.includes('anna') ||
    normalized.includes('marina') ||
    normalized.includes('nadezhda')
  ) {

    return 'ru-RU-SvetlanaNeural';
  }

  return 'ru-RU-DmitryNeural';
}

export async function generateAvatarVideo(
  req: GenerateVideoRequest
): Promise<GenerateVideoResponse> {

  const addLog =
    useDebugStore.getState().addLog;

  req.onStageChange?.(
    'Подготовка сценария',
    10
  );

  const fullScript =
    buildFullScript(
      req.script
    );

  req.onStageChange?.(
    'Проверка аватара',
    25
  );

  const resolvedAvatar =
    await resolveAndValidateAvatar(
      req.avatar.id,
      req.heygenApiKey,
      addLog
    );

  req.onStageChange?.(
    'Отправка в HeyGen',
    60
  );

  const heygenVoiceId =
    mapVoiceId(
      req.voiceId
    );

  const payload = {

    video_inputs: [

      {
        character: {

          type:
            'avatar',

          avatar_id:
            resolvedAvatar.heygenAvatarId,

          avatar_style:
            req.avatar.avatarStyle ||
            'normal'
        },

        voice: {

          type:
            'text',

          input_text:
            fullScript,

          voice_id:
            heygenVoiceId
        }
      }
    ],

    dimension: {

      width: 1280,

      height: 720
    }
  };

  addLog({

    type: 'request',

    module:
      '[HEYGEN RENDER]',

    message:
      'Sending native HeyGen render request',

    data: payload
  });

  const response =
    await fetch(
      'https://api.heygen.com/v2/video/generate',
      {

        method: 'POST',

        headers: {

          'X-Api-Key':
            req.heygenApiKey || '',

          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify(payload)
      }
    );

  const rawText =
    await response.text();

  let parsed: any = null;

  try {

    parsed =
      JSON.parse(rawText);

  } catch {}

  if (!response.ok) {

    addLog({

      type: 'error',

      module:
        '[HEYGEN RENDER]',

      message:
        `HeyGen Error ${response.status}`,

      data: rawText
    });

    throw new Error(
      parsed?.message ||
      rawText ||
      'HeyGen render failed.'
    );
  }

  const videoId =
    parsed?.data?.video_id;

  if (!videoId) {

    throw new Error(
      'HeyGen did not return video_id.'
    );
  }

  req.onStageChange?.(
    'Видео поставлено в очередь',
    100
  );

  const estimatedDurationSeconds =
    req.script.scenes.reduce(
      (acc, s) =>
        acc +
        (s.durationSeconds || 10),
      0
    ) + 5;

  const estimatedCost =
    parseFloat(
      (
        (
          estimatedDurationSeconds /
          60
        ) * 0.4
      ).toFixed(2)
    );

  addLog({

    type: 'response',

    module:
      '[HEYGEN RENDER]',

    message:
      'HeyGen render queued successfully',

    data: {

      videoId,

      provider:
        'Native HeyGen TTS'
    }
  });

  return {

    success: true,

    videoId,

    rawResponse:
      parsed,

    provider:
      'HeyGen Native TTS',

    estimatedCost,

    durationSeconds:
      estimatedDurationSeconds
  };
}