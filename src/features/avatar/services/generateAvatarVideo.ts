import {
  Avatar,
  AvatarScript
} from '../types/avatar.types';

import {
  DEFAULT_AVATARS
} from '../constants/avatar.constants';

import {
  VOICE_REGISTRY
} from '@/src/constants/voiceRegistry';

import {
  synthesizeElevenLabsAudio
} from '@/src/services/elevenlabsService';

export interface GenerateAvatarVideoRequest {

  script: AvatarScript;

  avatar: Avatar;

  voiceId: string;

  heygenApiKey?: string;
}

export interface GenerateAvatarVideoResponse {

  success: boolean;

  videoId?: string;

  error?: string | null;
}

export async function generateAvatarVideo(
  req: GenerateAvatarVideoRequest
): Promise<GenerateAvatarVideoResponse> {

  try {

    const voice =
      VOICE_REGISTRY.find(
        (v) =>
          v.localId ===
          req.voiceId
      ) ||
      VOICE_REGISTRY[0];

    // ============================================
    // BUILD FULL SCRIPT TEXT
    // ============================================

    const fullText = [

      req.script.hook,

      ...req.script.scenes.map(
        (scene) =>
          scene.narration
      )

    ].join('\n\n');

    // ============================================
    // GENERATE AUDIO
    // ============================================

    const synthResult =
      await synthesizeElevenLabsAudio(

        fullText,

        voice,

        undefined

      );

    const audioBlob =
      synthResult.audioBlob;

    // ============================================
    // TEMP AUDIO URL
    // ============================================

    const audioFile =
      new File(
        [audioBlob],
        'speech.wav',
        {
          type:
            'audio/wav'
        }
      );

    const uploadForm =
      new FormData();

    uploadForm.append(
      'file',
      audioFile
    );

    const uploadResp =
      await fetch(
        'https://tmpfiles.org/api/v1/upload',
        {
          method: 'POST',
          body: uploadForm
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

    // ============================================
    // HEYGEN REQUEST
    // ============================================

    const heygenResponse =
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

          body: JSON.stringify({

            video_inputs: [

              {
                character: {

                  type:
                    'avatar',

                  avatar_id:
                    req.avatar
                      .heygenAvatarId,

                  avatar_style:
                    'normal'
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
          })
        }
      );

    const heygenJson =
      await heygenResponse.json();

    if (
      !heygenResponse.ok
    ) {

      throw new Error(
        heygenJson?.message ||
        'HeyGen render error.'
      );

    }

    return {

      success: true,

      videoId:
        heygenJson?.data?.video_id
    };

  } catch (err: any) {

    console.error(
      '[GENERATE AVATAR VIDEO]',
      err
    );

    return {

      success: false,

      error:
        err.message ||
        'Render failed.'
    };
  }
}