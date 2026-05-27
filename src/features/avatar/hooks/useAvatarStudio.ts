import { useState, useEffect, useRef } from 'react';

import {
  Avatar,
  AvatarScript,
  AvatarGenerationStage,
  ScriptScene
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
  const settings = useSettingsStore();
  const heygenApiKey = settings.heygenKey;

  // ====================================================
  // INPUTS
  // ====================================================
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [selectedAvatar, setSelectedAvatarInternal] = useState<Avatar>(
    DEFAULT_AVATARS[0]
  );
  const [selectedVoiceId, setSelectedVoiceId] = useState('browser_male');

  // ====================================================
  // PREMIUM / ADDITIONAL STATES FOR OVERVIEW COMPOSE
  // ====================================================
  const [durationMinutes, setDurationMinutes] = useState(1);
  const [isEditingHook, setIsEditingHook] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState(0.40);
  const [requestCount, setRequestCount] = useState(0);

  const [heygenPlan, setHeygenPlan] = useState<'trial' | 'creator' | 'business' | 'enterprise'>('trial');
  const [renderMode, setRenderMode] = useState<'preview' | 'production'>('preview');
  const [durationSeconds, setDurationSeconds] = useState(15);
  const [spamCooldownLeft, setSpamCooldownLeft] = useState(0);
  const [activeVoiceTrace, setActiveVoiceTrace] = useState<any>(null);

  // ====================================================
  // SCRIPT
  // ====================================================
  const [script, setScript] = useState<AvatarScript | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [hookEditVal, setHookEditVal] = useState('');
  const [scenesEditVals, setScenesEditVals] = useState<
    Record<
      string,
      {
        narration: string;
        visuals: string;
      }
    >
  >({});
  const [isDirty, setIsDirty] = useState(false);

  // ====================================================
  // VIDEO STATES
  // ====================================================
  const [stage, setStage] = useState<AvatarGenerationStage>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [renderedThumbnailUrl, setRenderedThumbnailUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ====================================================
  // HISTORY
  // ====================================================
  const [renderHistory, setRenderHistory] = useState<RenderHistoryItem[]>([]);

  // ====================================================
  // TIMERS
  // ====================================================
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ====================================================
  // TIMER EFFECT
  // ====================================================
  useEffect(() => {
    if (stage !== 'idle' && stage !== 'error') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stage]);

  // ====================================================
  // COOLDOWN EFFECT FOR ANTI-SPAM
  // ====================================================
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (spamCooldownLeft > 0) {
      intervalId = setInterval(() => {
        setSpamCooldownLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [spamCooldownLeft]);

  // ====================================================
  // AVATAR SELECT
  // ====================================================
  const setSelectedAvatar = (avatar: Avatar) => {
    setSelectedAvatarInternal(avatar);
    setRenderedVideoUrl(null);
    setRenderedThumbnailUrl(null);
    setErrorMessage(null);
  };

  // ====================================================
  // GENERATE SCRIPT
  // ====================================================
  const generateScript = async () => {
    if (!topic.trim()) {
      alert('Введите тему выпуска');
      return;
    }

    setIsGeneratingScript(true);
    setErrorMessage(null);

    try {
      const generatedScript: AvatarScript = {
        title: `Релиз по теме: ${topic}`,
        description: `Сценарий выпуска об аватарах для ${topic}`,
        summary: `Обзор преимуществ использования AI-инструментариев.`,
        hook: `Добро пожаловать. Сегодня говорим про: ${topic}`,
        captionStyles: {
          font: 'Inter',
          color: '#ffffff',
          animation: 'fade-in'
        },
        scenes: [
          {
            id: 'scene_1',
            narration: `Сегодня мы подробно разбираем тему: ${topic}.`,
            visuals: 'Кинематографичный AI-аватар.',
            emotion: 'neutral',
            gesture: 'none',
            durationSeconds: 10
          },
          {
            id: 'scene_2',
            narration: 'Это демонстрационная генерация AI-аватара.',
            visuals: 'Студийный AI аватар рассказывает материал.',
            emotion: 'friendly',
            gesture: 'slight_nod',
            durationSeconds: 15
          }
        ]
      };

      setScript(generatedScript);
      setHookEditVal(generatedScript.hook);

      const mappedScenes: Record<
        string,
        {
          narration: string;
          visuals: string;
        }
      > = {};

      generatedScript.scenes.forEach((scene) => {
        mappedScenes[scene.id] = {
          narration: scene.narration,
          visuals: scene.visuals
        };
      });

      setScenesEditVals(mappedScenes);
      setIsDirty(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Ошибка генерации сценария.'
      );
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // ====================================================
  // SAVE HANDLERS FOR SCRIPT MANIPULATION
  // ====================================================
  const handleSaveHook = () => {
    if (script) {
      setScript({
        ...script,
        hook: hookEditVal
      });
      setIsDirty(true);
      setIsEditingHook(false);
    }
  };

  const handleSaveScene = (sceneId: string, narration: string, visuals: string) => {
    if (script) {
      const updatedScenes = script.scenes.map((s) => {
        if (s.id === sceneId) {
          return { ...s, narration, visuals };
        }
        return s;
      });
      setScript({
        ...script,
        scenes: updatedScenes
      });
      setIsDirty(true);
      setEditingSceneId(null);
    }
  };

  // ====================================================
  // VIDEO RENDER
  // ====================================================
  const triggerVideoRender = async () => {
    if (!script) {
      return;
    }

    try {
      setStage('sending_request');
      setProgressPercent(20);
      setStatusMessage('Отправка в HeyGen...');
      setRequestCount((prev) => prev + 1);

      // Simple trace simulation for layout support (Req 8)
      setActiveVoiceTrace({
        selectedVoice: selectedVoiceId,
        provider: selectedVoiceId.includes('browser') ? 'browser_audio' : 'elevenlabs',
        previewVoiceId: selectedVoiceId,
        renderVoiceId: selectedVoiceId,
        heygenVoiceId: 'synced-audio-lipsync',
        language: 'ru-RU',
        model: 'elevenlabs_multilingual_v2',
        cache: 'MISS',
        fallbackTriggered: false
      });

     const renderResponse =
  await generateAvatarVideo({

    script,

    avatar:
      selectedAvatar,

    voiceId:
      selectedVoiceId,

    heygenApiKey,

    openaiApiKey:
      settings.openaiKey,

    onStageChange:
      (stage, percent) => {

        setStatusMessage(
          stage
        );

        setProgressPercent(
          percent
        );

      }
  });

if (!renderResponse.success) {

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

          const newItem:
            RenderHistoryItem = {

            id:
              videoId ||
              String(Date.now()),

            timestamp:
              Date.now(),

            topic:
              topic ||
              'AI Avatar Video',

            avatar:
              selectedAvatar,

            videoUrl:
              statusResp.videoUrl ||
              '',

            thumbnailUrl:
              statusResp.thumbnailUrl ||
              '',

            script:
              { ...script }
          };

          setRenderHistory(
            (prev) => [
              newItem,
              ...prev
            ]
          );

          setSpamCooldownLeft(
            60
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

            typeof statusResp.error ===
            'string'

              ? statusResp.error

              : JSON.stringify(
                  statusResp.error
                ) ||

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

          pollErr?.message ||

          'Ошибка проверки статуса.'
        );
      }

    },

    3000
  );
} catch (err: any) {
  setStage('error');
  setErrorMessage(
    err.message || 'Ошибка запуска рендера.'
  );
}
};

  // ====================================================
  // CANCEL
  // ====================================================
  const cancelGeneration = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    setStage('idle');
    setProgressPercent(0);
    setStatusMessage('');
  };

  // ====================================================
  // HISTORY ACTION HANDLERS
  // ====================================================
  const selectHistoryItem = (item: RenderHistoryItem) => {
    setScript(item.script);
    setRenderedVideoUrl(item.videoUrl);
    setRenderedThumbnailUrl(item.thumbnailUrl);
    setTopic(item.topic);
    setSelectedAvatarInternal(item.avatar);
  };

  const deleteHistoryItem = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRenderHistory((prev) => prev.filter((item) => item.id !== id));
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

    heygenApiKey,

    // Additional destructured premium fields
    durationMinutes,
    setDurationMinutes,
    isEditingHook,
    setIsEditingHook,
    editingSceneId,
    setEditingSceneId,
    handleSaveHook,
    handleSaveScene,
    estimatedCost,
    requestCount,
    selectHistoryItem,
    deleteHistoryItem,
    heygenPlan,
    setHeygenPlan,
    renderMode,
    setRenderMode,
    durationSeconds,
    setDurationSeconds,
    spamCooldownLeft,
    activeVoiceTrace,
    setActiveVoiceTrace
  };
}
