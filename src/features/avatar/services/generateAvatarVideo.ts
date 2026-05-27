// src/services/generateAvatarVideo.ts

import { useDebugStore } from '@/src/stores/useDebugStore';
import { preprocessTextForVoice } from './voiceRouter';

export function preprocessRussianSpeechV3(text: string, voice: any): string {
  return preprocessTextForVoice(text, voice);
}

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

  openaiApiKey?: string;

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

function mapOpenAIVoice(
  localVoiceId: string
): string {

  const normalized =
    localVoiceId.toLowerCase();

  if (
    normalized.includes('anna') ||
    normalized.includes('marina') ||
    normalized.includes('nadezhda')
  ) {

    return 'nova';
  }

  return 'alloy';
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
    20
  );

  const resolvedAvatar =
    await resolveAndValidateAvatar(
      req.avatar.id,
      req.heygenApiKey,
      addLog
    );

  // =====================================================
  // OPENAI TTS
  // =====================================================

  req.onStageChange?.(
    'Генерация озвучки',
    45
  );

  const openaiVoice =
    mapOpenAIVoice(
      req.voiceId
    );

  addLog({

    type: 'request',

    module:
      '[OPENAI TTS]',

    message:
      'Generating OpenAI speech',

    data: {

      voice:
        openaiVoice
    }
  });

  console.log(
    '[OPENAI TTS] Starting request'
  );

  console.log(
    '[OPENAI TTS] API Key exists:',
    !!req.openaiApiKey
  );

  const ttsResponse =
    await fetch(
      'https://api.openai.com/v1/audio/speech',
      {

        method: 'POST',

        headers: {

          Authorization:
            `Bearer ${req.openaiApiKey}`,

          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify({

            model:
              'gpt-4o-mini-tts',

            voice:
              openaiVoice,

            input:
              fullScript,

            format:
              'mp3'
          })
      }
    );

  if (!ttsResponse.ok) {

    const errorText =
      await ttsResponse.text();

    throw new Error(
      `OpenAI TTS Error: ${errorText}`
    );
  }

  const audioBlob =
    await ttsResponse.blob();

  console.log(
    '[OPENAI TTS] Audio blob created',
    audioBlob.size
  );

  addLog({

    type: 'response',

    module:
      '[OPENAI TTS]',

    message:
      'Speech generated successfully',

    data: {

      sizeKB:
        (
          audioBlob.size / 1024
        ).toFixed(1)
    }
  });

  // =====================================================
  // TMP UPLOAD
  // =====================================================

  req.onStageChange?.(
    'Загрузка аудио',
    60
  );

  const audioFile =
    new File(
      [audioBlob],
      'speech.mp3',
      {
        type:
          'audio/mpeg'
      }
    );

  const formData =
    new FormData();

  formData.append(
    'file',
    audioFile
  );

  const uploadResp =
    await fetch(
      'https://tmpfiles.org/api/v1/upload',
      {

        method: 'POST',

        body:
          formData
      }
    );

  const uploadJson =
    await uploadResp.json();

  const rawUrl =
    uploadJson?.data?.url;

  if (!rawUrl) {

    throw new Error(
      'Не удалось загрузить временное аудио.'
    );
  }

  const audioUrl =
    rawUrl.replace(
      'tmpfiles.org/',
      'tmpfiles.org/dl/'
    );

  addLog({

    type: 'response',

    module:
      '[TEMP AUDIO]',

    message:
      'Temporary audio URL created',

    data: {

      audioUrl
    }
  });

  // =====================================================
  // HEYGEN RENDER
  // =====================================================

  req.onStageChange?.(
    'Отправка в HeyGen',
    80
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
            (
              req.avatar.avatarStyle ===
              'close-up'
            )
              ? 'closeUp'
              : (
                req.avatar.avatarStyle ||
                'normal'
              )
        },

        voice: {

          type:
            'audio',

          audio_url:
            audioUrl
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
      'Sending HeyGen render request',

    data:
      payload
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

  } catch { }

  if (!response.ok) {

    addLog({

      type: 'error',

      module:
        '[HEYGEN RENDER]',

      message:
        `HeyGen Error ${response.status}`,

      data:
        rawText
    });

    throw new Error(
      parsed?.error?.message ||
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

      videoId
    }
  });

  return {

    success: true,

    videoId,

    rawResponse:
      parsed,

    provider:
      'OpenAI TTS + HeyGen',

    estimatedCost,

    durationSeconds:
      estimatedDurationSeconds
  };
}