import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarScript, AvatarGenerationStage, GenerationProgress } from '../types/avatar.types';
import { DEFAULT_AVATARS } from '../constants/avatar.constants';
import { generateAvatarVideo } from '../services/generateAvatarVideo';
import { checkAvatarStatus } from '../services/checkAvatarStatus';
import { generateVideoAvatar } from '@/src/services/ai/client';
import { useSettingsStore } from '@/src/stores/useSettingsStore';

export function useAvatarStudio() {
  const settings = useSettingsStore();
  const heygenApiKey = settings.heygenKey;

  // Inputs
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(2);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(DEFAULT_AVATARS[0]);

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
      // Call OpenAI to get the script
      const data = await generateVideoAvatar({
        topic,
        context: `${context}\nTarget Duration: ${durationMinutes} minutes`
      });

      if (data) {
        setScript(data);
        setHookEditVal(data.hook);
        const mappedscenes: Record<string, { narration: string; visuals: string }> = {};
        data.scenes.forEach((s: any) => {
          mappedscenes[s.id] = { narration: s.narration, visuals: s.visuals };
        });
        setScenesEditVals(mappedscenes);
        setIsDirty(false);
      }
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
      setStatusMessage('Мультиплексирование настроек аватара...');

      await new Promise(resolve => setTimeout(resolve, 800));
      setStage('sending_request');
      setProgressPercent(25);
      setStatusMessage('Отправка запроса в HeyGen...');

      // Choose a voice ID from HUMAN_VOICE_LIBRARY corresponding to gender
      const voiceId = selectedAvatar.gender === 'male' ? 'pNInz6obpgdq5TaqLwtY' : '21m00Tcm4TlvDq8ikWAM'; // Adam vs Rachel

      const renderResponse = await generateAvatarVideo({
        script,
        avatar: selectedAvatar,
        voiceId,
        heygenApiKey
      });

      setEstimatedCost(renderResponse.estimatedCost);

      if (renderResponse.success) {
        setStage('waiting_render');
        setProgressPercent(40);
        setStatusMessage('Ожидание рендеринга видео в HeyGen (в потоке)...');
        setRequestCount(prev => prev + 1);

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
              setRenderedVideoUrl(statusResp.videoUrl || '');
              setRenderedThumbnailUrl(statusResp.thumbnailUrl || '');
              setStage('idle');
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
    heygenApiKey
  };
}
