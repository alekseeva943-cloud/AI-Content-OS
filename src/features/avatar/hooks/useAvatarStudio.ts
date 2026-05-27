import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarScript, AvatarGenerationStage, GenerationProgress } from '../types/avatar.types';
import { DEFAULT_AVATARS } from '../constants/avatar.constants';

export interface RenderHistoryItem {
  id: string;
  timestamp: number;
  topic: string;
  avatar: Avatar;
  videoUrl: string;
  thumbnailUrl: string;
  script: AvatarScript;
  voiceTrace?: any;
}
import { generateAvatarVideo } from '../services/generateAvatarVideo';
import { checkAvatarStatus } from '../services/checkAvatarStatus';
import { useSettingsStore } from '@/src/stores/useSettingsStore';

export function useAvatarStudio() {
  const settings = useSettingsStore();
  const heygenApiKey = settings.heygenKey;

  // Inputs
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(2); // Keep for backwards compatibility
  const [selectedAvatar, setSelectedAvatarInternal] = useState<Avatar>(DEFAULT_AVATARS[0]);

  // Premium UI & Plan-aware States
  const [selectedVoiceId, setSelectedVoiceId] = useState('pqH6THCHvgSzSg3749S8'); // Default Alexei
  const [heygenPlan, setHeygenPlan] = useState<'trial' | 'creator' | 'business' | 'enterprise'>('trial');
  const [renderMode, setRenderMode] = useState<'preview' | 'production'>('preview');
  const [durationSeconds, setDurationSeconds] = useState<number>(30);
  const [spamCooldownLeft, setSpamCooldownLeft] = useState(0);
  const [activeVoiceTrace, setActiveVoiceTrace] = useState<any>(null);

  const setSelectedAvatar = (avatar: Avatar) => {
    setSelectedAvatarInternal(avatar);
    setRenderedVideoUrl(null);
    setRenderedThumbnailUrl(null);
    setErrorMessage(null);
  };

  // Cooldown interval for button safe locks
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (spamCooldownLeft > 0) {
      interval = setInterval(() => {
        setSpamCooldownLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [spamCooldownLeft]);

  // Plan-aware duration downgrade side effect
  useEffect(() => {
    const limits: Record<string, number> = {
      trial: 30,
      creator: 60,
      business: 300,
      enterprise: 1800
    };
    const maxAllowed = limits[heygenPlan] || 30;
    if (durationSeconds > maxAllowed) {
      setDurationSeconds(maxAllowed);
    }
  }, [heygenPlan, durationSeconds]);

  // States
  const [script, setScript] = useState<AvatarScript | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Script inline editing states
  const [hookEditVal, setHookEditVal] = useState('');
  const [scenesEditVals, setScenesEditVals] = useState<Record<string, { narration: string; visuals: string }>>({});
  const [isEditingHook, setIsEditingHook] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Video generation states
  const [stage, setStage] = useState<AvatarGenerationStage>('idle');

  // Render History State
  const [renderHistory, setRenderHistory] = useState<RenderHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('avatar_render_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('avatar_render_history', JSON.stringify(renderHistory));
    } catch { }
  }, [renderHistory]);

  const selectHistoryItem = (item: RenderHistoryItem) => {
    if (item.script) {
      setScript(item.script);
      setHookEditVal(item.script.hook);
      const mappedscenes: Record<string, { narration: string; visuals: string }> = {};
      item.script.scenes.forEach((s: any) => {
        mappedscenes[s.id] = { narration: s.narration, visuals: s.visuals };
      });
      setScenesEditVals(mappedscenes);
      setIsDirty(false);
    }
    setSelectedAvatarInternal(item.avatar);
    setRenderedVideoUrl(item.videoUrl);
    setRenderedThumbnailUrl(item.thumbnailUrl);
    setTopic(item.topic);
    setErrorMessage(null);
    setActiveVoiceTrace(item.voiceTrace || null);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenderHistory(prev => prev.filter(item => item.id !== id));
  };
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [renderedThumbnailUrl, setRenderedThumbnailUrl] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Time tracking
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (stage !== 'idle' && stage !== 'error' && stage !== 'finalizing_player') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // 1. Generate Script independent from video rendering
  const generateScript = async () => {

    if (!topic.trim()) {

      alert('Введите тему выпуска');

      return;

    }

    setIsGeneratingScript(true);

    setErrorMessage(null);

    setScript(null);

    try {

      const generatedScript: AvatarScript = {

        hook:
          `Добро пожаловать. Сегодня говорим про: ${topic}`,

        scenes: [

          {
            id: 'scene_1',

            narration:
              `Сегодня мы подробно разберем тему: ${topic}.`,

            visuals:
              'Кинематографичные кадры по теме.'
          },

          {
            id: 'scene_2',

            narration:
              'Это демонстрационный AI-аватар для домашнего задания.',

            visuals:
              'Студийный AI-аватар рассказывает материал.'
          }
        ]
      };

      setScript(
        generatedScript
      );

      setHookEditVal(
        generatedScript.hook
      );

      const mappedScenes: Record<
        string,
        {
          narration: string;
          visuals: string;
        }
      > = {};

      generatedScript.scenes.forEach(
        (scene) => {

          mappedScenes[scene.id] = {

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
        'Не удалось сгенерировать сценарий.'
      );

    } finally {

      setIsGeneratingScript(false);

    }
  };

  setScript(fakeScript);

  setHookEditVal(
    fakeScript.hook
  );

  const mappedScenes: Record<
    string,
    {
      narration: string;
      visuals: string;
    }
  > = {};

  fakeScript.scenes.forEach(
    (s: any) => {

      mappedScenes[s.id] = {
        narration:
          s.narration,

        visuals:
          s.visuals
      };

    }
  );

  setScenesEditVals(
    mappedScenes
  );

  setIsDirty(false);

} catch (err: any) {
  console.error(err);
  setErrorMessage(err.message || 'Не удалось сгенерировать сценарий. Проверьте OpenAI API ключ.');
} finally {
  setIsGeneratingScript(false);
}
};

// 2. Edit Script Handlers
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

const handleSaveScene = (id: string, text: string, visuals: string) => {
  if (script) {
    const updatedScenes = script.scenes.map(s => {
      if (s.id === id) {
        return { ...s, narration: text, visuals };
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

// 3. Trigger video rendering via HeyGen (Requirement 7 & 8 & 9)
const triggerVideoRender = async () => {
  if (!script) return;

  // PRE-RENDER PLAN VALIDATIONS (Plan-Aware Limits Verification)
  const limits: Record<string, number> = {
    trial: 30,
    creator: 60,
    business: 300,
    enterprise: 1800
  };
  const maxAllowed = limits[heygenPlan] || 30;
  if (durationSeconds > maxAllowed) {
    setErrorMessage(`Превышен лимит тарифа! Ваш тариф HeyGen (${heygenPlan.toUpperCase()}) не поддерживает рендеры длиннее ${maxAllowed} сек. Пожалуйста, измените длительность.`);
    return;
  }

  // Rate Limiting Prevention Clashing Click Safeguards
  if (spamCooldownLeft > 0) {
    setErrorMessage(`Защита от спама: Пожалуйста, подождите перед повторной отправкой. Кулдаун: ${spamCooldownLeft} секунд.`);
    return;
  }

  setStage('building_script');
  setProgressPercent(5);
  setStatusMessage('Форматирование сценария...');
  setElapsedSeconds(0);
  setErrorMessage(null);
  setRenderedVideoUrl(null);

  // Simulated short timers for staging (Requirements 8 & 9)
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    setStage('preparing_payload');
    setProgressPercent(15);
    setStatusMessage('Мультиплексирование настроек аватара и голоса...');

    await new Promise(resolve => setTimeout(resolve, 800));
    setStage('sending_request');
    setProgressPercent(25);
    setStatusMessage('Отправка запроса в HeyGen...');

    const renderResponse = await generateAvatarVideo({
      script,
      avatar: selectedAvatar,
      voiceId: selectedVoiceId,
      heygenApiKey
    });

    setEstimatedCost(renderResponse.estimatedCost);
    if (renderResponse.voiceTrace) {
      setActiveVoiceTrace(renderResponse.voiceTrace);
    }

    if (renderResponse.success) {
      setStage('waiting_render');
      setProgressPercent(40);
      setStatusMessage('Ожидание рендеринга видео в HeyGen (в потоке)...');
      setRequestCount(prev => prev + 1);
      setSpamCooldownLeft(10); // Trigger a 10s anti-spam lock key safety cooldown

      // Start polling (Requirement 7)
      let retries = 0;
      const videoId = renderResponse.videoId;

      pollingRef.current = setInterval(async () => {
        try {
          retries++;
          const statusResp = await checkAvatarStatus({
            videoId,
            heygenApiKey,
            retryCount: retries
          });

          // Calculate active progress percent
          const currentPercent = Math.min(40 + retries * 12, 95);
          setProgressPercent(currentPercent);

          if (statusResp.status === 'completed') {
            if (pollingRef.current) clearInterval(pollingRef.current);

            setStage('fetching_asset');
            setProgressPercent(98);
            setStatusMessage('Получение готового MP4 файла...');
            await new Promise(r => setTimeout(r, 600));

            setStage('finalizing_player');
            setProgressPercent(100);
            setStatusMessage('Готово!');

            const videoUrl = statusResp.videoUrl || '';
            const thumbnailUrl = statusResp.thumbnailUrl || '';

            setRenderedVideoUrl(videoUrl);
            setRenderedThumbnailUrl(thumbnailUrl);
            setStage('idle');

            // Append to render history safely (Requirement 11)
            if (videoUrl) {
              const newItem: RenderHistoryItem = {
                id: `render_${Date.now()}`,
                timestamp: Date.now(),
                topic: topic || 'Информационное видео',
                avatar: selectedAvatar,
                videoUrl,
                thumbnailUrl,
                script: script,
                voiceTrace: renderResponse.voiceTrace
              };
              setRenderHistory(prev => [newItem, ...prev].slice(0, 5));
            }
          } else if (statusResp.status === 'failed') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            throw new Error(statusResp.error || 'HeyGen рендеринг зафейлился.');
          }
        } catch (pollErr: any) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setStage('error');
          setErrorMessage(pollErr.message || 'Ошибка поплинга рендера.');
        }
      }, 3000); // Poll every 3 seconds

    } else {
      throw new Error('Не удалось поставить видео в очередь HeyGen');
    }

  } catch (err: any) {
    setStage('error');
    setErrorMessage(err.message || 'Ошибка запуска рендеринга аватара.');
  }
};

const cancelGeneration = () => {
  if (pollingRef.current) {
    clearInterval(pollingRef.current);
  }
  setStage('idle');
  setProgressPercent(0);
  setStatusMessage('');
  setErrorMessage('Генерация отменена пользователем.');
};

return {
  topic, setTopic,
  context, setContext,
  durationMinutes, setDurationMinutes,
  selectedAvatar, setSelectedAvatar,
  script, setScript,
  isGeneratingScript,
  generateScript,

  // Editing State
  hookEditVal, setHookEditVal,
  scenesEditVals, setScenesEditVals,
  isEditingHook, setIsEditingHook,
  editingSceneId, setEditingSceneId,
  isDirty, setIsDirty,
  handleSaveHook,
  handleSaveScene,

  // Generation Progress
  stage,
  progressPercent,
  statusMessage,
  elapsedSeconds,
  renderedVideoUrl,
  renderedThumbnailUrl,
  estimatedCost,
  requestCount,
  errorMessage,
  triggerVideoRender,
  cancelGeneration,
  heygenApiKey,
  renderHistory,
  selectHistoryItem,
  deleteHistoryItem,

  // Extended Premium State Outputs
  selectedVoiceId, setSelectedVoiceId,
  heygenPlan, setHeygenPlan,
  renderMode, setRenderMode,
  durationSeconds, setDurationSeconds,
  spamCooldownLeft,
  activeVoiceTrace, setActiveVoiceTrace
};
}
