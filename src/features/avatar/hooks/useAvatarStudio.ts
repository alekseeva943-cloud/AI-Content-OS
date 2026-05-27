import { useState, useEffect, useRef } from 'react';

import {
  Avatar,
  AvatarScript,
  AvatarGenerationStage
} from '../types/avatar.types';

import {
  DEFAULT_AVATARS
} from '../constants/avatar.constants';

import {
  generateAvatarVideo
} from '../services/generateAvatarVideo';

import {
  checkAvatarStatus
} from '../services/checkAvatarStatus';

import {
  useSettingsStore
} from '@/src/stores/useSettingsStore';

export interface RenderHistoryItem {

  id: string;

  timestamp: number;

  topic: string;

  avatar: Avatar;

  videoUrl: string;

  thumbnailUrl: string;

  script: AvatarScript;
}

export function useAvatarStudio() {

  const settings =
    useSettingsStore();

  const heygenApiKey =
    settings.heygenKey;

  // ====================================================
  // INPUTS
  // ====================================================

  const [topic, setTopic] =
    useState('');

  const [context, setContext] =
    useState('');

  const [selectedAvatar,
    setSelectedAvatarInternal] =
    useState<Avatar>(
      DEFAULT_AVATARS[0]
    );

  const [selectedVoiceId,
    setSelectedVoiceId] =
    useState('browser_male');

  // ====================================================
  // SCRIPT
  // ====================================================

  const [script, setScript] =
    useState<AvatarScript | null>(
      null
    );

  const [isGeneratingScript,
    setIsGeneratingScript] =
    useState(false);

  const [hookEditVal,
    setHookEditVal] =
    useState('');

  const [scenesEditVals,
    setScenesEditVals] =
    useState<
      Record<
        string,
        {
          narration: string;
          visuals: string;
        }
      >
    >({});

  const [isDirty,
    setIsDirty] =
    useState(false);

  // ====================================================
  // VIDEO STATES
  // ====================================================

  const [stage, setStage] =
    useState<AvatarGenerationStage>(
      'idle'
    );

  const [progressPercent,
    setProgressPercent] =
    useState(0);

  const [statusMessage,
    setStatusMessage] =
    useState('');

  const [elapsedSeconds,
    setElapsedSeconds] =
    useState(0);

  const [renderedVideoUrl,
    setRenderedVideoUrl] =
    useState<string | null>(
      null
    );

  const [renderedThumbnailUrl,
    setRenderedThumbnailUrl] =
    useState<string | null>(
      null
    );

  const [errorMessage,
    setErrorMessage] =
    useState<string | null>(
      null
    );

  // ====================================================
  // HISTORY
  // ====================================================

  const [renderHistory,
    setRenderHistory] =
    useState<RenderHistoryItem[]>(
      []
    );

  // ====================================================
  // TIMERS
  // ====================================================

  const pollingRef =
    useRef<NodeJS.Timeout | null>(
      null
    );

  const timerRef =
    useRef<NodeJS.Timeout | null>(
      null
    );

  // ====================================================
  // TIMER EFFECT
  // ====================================================

  useEffect(() => {

    if (
      stage !== 'idle' &&
      stage !== 'error'
    ) {

      timerRef.current =
        setInterval(() => {

          setElapsedSeconds(
            prev => prev + 1
          );

        }, 1000);

    } else {

      if (timerRef.current) {

        clearInterval(
          timerRef.current
        );

      }

    }

    return () => {

      if (timerRef.current) {

        clearInterval(
          timerRef.current
        );

      }

    };

  }, [stage]);

  // ====================================================
  // AVATAR SELECT
  // ====================================================

  const setSelectedAvatar =
    (avatar: Avatar) => {

      setSelectedAvatarInternal(
        avatar
      );

      setRenderedVideoUrl(null);

      setRenderedThumbnailUrl(
        null
      );

      setErrorMessage(null);

    };

  // ====================================================
  // GENERATE SCRIPT
  // ====================================================

  const generateScript =
    async () => {

      if (!topic.trim()) {

        alert(
          'Введите тему выпуска'
        );

        return;

      }

      setIsGeneratingScript(
        true
      );

      setErrorMessage(null);

      try {

        const generatedScript:
          AvatarScript = {

          hook:
            `Добро пожаловать. Сегодня говорим про: ${topic}`,

          scenes: [

            {
              id: 'scene_1',

              narration:
                `Сегодня мы подробно разбираем тему: ${topic}.`,

              visuals:
                'Кинематографичный AI-аватар.'
            },

            {
              id: 'scene_2',

              narration:
                'Это демонстрационная генерация AI-аватара.',

              visuals:
                'Студийный AI аватар рассказывает материал.'
            }
          ]
        };

        setScript(
          generatedScript
        );

        setHookEditVal(
          generatedScript.hook
        );

        const mappedScenes:
          Record<
            string,
            {
              narration: string;
              visuals: string;
            }
          > = {};

        generatedScript.scenes.forEach(
          (scene) => {

            mappedScenes[
              scene.id
            ] = {

              narration:
                scene.narration,

              visuals:
                scene.visuals
            };

          }
        );

        setScenesEditVals(
          mappedScenes
        );

        setIsDirty(false);

      } catch (err: any) {

        console.error(err);

        setErrorMessage(
          err.message ||
          'Ошибка генерации сценария.'
        );

      } finally {

        setIsGeneratingScript(
          false
        );

      }

    };

  // ====================================================
  // VIDEO RENDER
  // ====================================================

  const triggerVideoRender =
    async () => {

      if (!script) {

        return;

      }

      try {

        setStage(
          'sending_request'
        );

        setProgressPercent(20);

        setStatusMessage(
          'Отправка в HeyGen...'
        );

        const renderResponse =
          await generateAvatarVideo({

            script,

            avatar:
              selectedAvatar,

            voiceId:
              selectedVoiceId,

            heygenApiKey
          });

        if (
          !renderResponse.success
        ) {

          throw new Error(
            'Не удалось запустить рендер.'
          );

        }

        setStage(
          'waiting_render'
        );

        setProgressPercent(45);

        const videoId =
          renderResponse.videoId;

        pollingRef.current =
          setInterval(
            async () => {

              try {

                const statusResp =
                  await checkAvatarStatus({

                    videoId,

                    heygenApiKey
                  });

                if (
                  statusResp.status ===
                  'completed'
                ) {

                  if (
                    pollingRef.current
                  ) {

                    clearInterval(
                      pollingRef.current
                    );

                  }

                  setProgressPercent(
                    100
                  );

                  setStage(
                    'idle'
                  );

                  setStatusMessage(
                    'Видео готово'
                  );

                  setRenderedVideoUrl(
                    statusResp.videoUrl ||
                    null
                  );

                  setRenderedThumbnailUrl(
                    statusResp.thumbnailUrl ||
                    null
                  );

                } else if (
                  statusResp.status ===
                  'failed'
                ) {

                  if (
                    pollingRef.current
                  ) {

                    clearInterval(
                      pollingRef.current
                    );

                  }

                  throw new Error(
                    statusResp.error ||
                    'HeyGen render failed.'
                  );

                }

              } catch (pollErr: any) {

                if (
                  pollingRef.current
                ) {

                  clearInterval(
                    pollingRef.current
                  );

                }

                setStage(
                  'error'
                );

                setErrorMessage(
                  pollErr.message ||
                  'Ошибка проверки статуса.'
                );

              }

            },

            3000
          );

      } catch (err: any) {

        setStage(
          'error'
        );

        setErrorMessage(
          err.message ||
          'Ошибка запуска рендера.'
        );

      }

    };

  // ====================================================
  // CANCEL
  // ====================================================

  const cancelGeneration =
    () => {

      if (
        pollingRef.current
      ) {

        clearInterval(
          pollingRef.current
        );

      }

      setStage('idle');

      setProgressPercent(0);

      setStatusMessage('');

    };

  // ====================================================
  // RETURN
  // ====================================================

  return {

    topic,
    setTopic,

    context,
    setContext,

    selectedAvatar,
    setSelectedAvatar,

    selectedVoiceId,
    setSelectedVoiceId,

    script,
    setScript,

    isGeneratingScript,
    generateScript,

    hookEditVal,
    setHookEditVal,

    scenesEditVals,
    setScenesEditVals,

    isDirty,
    setIsDirty,

    stage,
    progressPercent,
    statusMessage,
    elapsedSeconds,

    renderedVideoUrl,
    renderedThumbnailUrl,

    errorMessage,

    triggerVideoRender,
    cancelGeneration,

    renderHistory,

    heygenApiKey
  };
}