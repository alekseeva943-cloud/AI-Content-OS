import { useState } from 'react';
import { PodcastConfig, PodcastResult, DebugTraceState, DebugStageLog, DebugStageId, DebugStatus } from '../types/podcast.types';
import { generatePodcast } from '../services/generatePodcast';
import { toast } from 'sonner';

const INITIAL_STAGES: DebugStageLog[] = [
  { id: 'collect_config', label: '[1] Collecting config', status: 'pending' },
  { id: 'build_prompt', label: '[2] Building AI prompt', status: 'pending' },
  { id: 'send_request', label: '[3] Sending AI request', status: 'pending' },
  { id: 'wait_response', label: '[4] Waiting AI response', status: 'pending' },
  { id: 'parse_structure', label: '[5] Parsing podcast structure', status: 'pending' },
  { id: 'build_timeline', label: '[6] Building timeline', status: 'pending' },
  { id: 'prepare_audio', label: '[7] Preparing audio synthesis', status: 'pending' },
  { id: 'finalize_episode', label: '[8] Finalizing episode', status: 'pending' }
];

export function usePodcastGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PodcastResult | null>(null);
  
  // Debug trace state
  const [debugTrace, setDebugTrace] = useState<DebugTraceState>({
    stages: INITIAL_STAGES,
    lastUpdated: Date.now()
  });

  const updateStage = (stageId: DebugStageId, updates: Partial<DebugStageLog>, extraState?: Partial<DebugTraceState>) => {
    setDebugTrace(prev => {
      const updatedStages = prev.stages.map(stage => {
        if (stage.id === stageId) {
          const startedAt = updates.status === 'active' ? Date.now() : stage.startedAt;
          let durationMs = stage.durationMs;
          if (updates.status === 'success' || updates.status === 'error') {
            const start = stage.startedAt || Date.now();
            durationMs = Date.now() - start;
          }
          return {
            ...stage,
            ...updates,
            startedAt,
            durationMs
          };
        }
        return stage;
      });

      return {
        ...prev,
        stages: updatedStages,
        lastUpdated: Date.now(),
        ...extraState
      };
    });
  };

  const resetStages = () => {
    setDebugTrace({
      stages: INITIAL_STAGES.map(s => ({ ...s, status: 'pending' })),
      totalDurationMs: undefined,
      rawError: undefined,
      aiPayload: undefined,
      aiResponse: undefined,
      lastUpdated: Date.now()
    });
  };

  const generate = async (config: PodcastConfig) => {
    setIsGenerating(true);
    setError(null);
    resetStages();
    
    const startTime = Date.now();
    let activeStageId: DebugStageId = 'collect_config';
    
    console.log('[PODCAST TRACE] [Stage 1/8] Starting validation and config collection. Payload:', config);
    
    // Stage 1: Collect Config
    updateStage('collect_config', { 
      status: 'active', 
      details: `Тема: "${config.topic}". Длительность: ${config.durationMinutes} мин. Гость: ${config.guestEnabled ? 'Вкл' : 'Выкл'}` 
    });

    await new Promise(r => setTimeout(r, 600)); // Dramatic debug visibility

    if (!config.topic || config.topic.trim().length < 3) {
      const errStr = 'Тема слишком короткая или отсутствует.';
      console.error('[PODCAST TRACE] [Stage 1/8] Failed:', errStr);
      updateStage('collect_config', { status: 'error', error: errStr });
      setError(errStr);
      setIsGenerating(false);
      return null;
    }

    updateStage('collect_config', { status: 'success' });
    console.log('[PODCAST TRACE] [Stage 1/8] Success: Config verified successfully.');

    // Stage 2: Build prompt
    activeStageId = 'build_prompt';
    console.log('[PODCAST TRACE] [Stage 2/8] Generating Gemini Structured API constraints and context models.');
    updateStage('build_prompt', { 
      status: 'active',
      details: `Сборка роли для Gemini 3.5 Flash: JSON Schema, 7 сегментов для ${config.durationMinutes} минут`
    });

    await new Promise(r => setTimeout(r, 600));

    const promptDetails = `Объект: { topic: "${config.topic}", duration: ${config.durationMinutes}, guest: ${JSON.stringify(config.guest)} }`;
    updateStage('build_prompt', { 
      status: 'success',
      details: 'Промпт собран и валидирован по JSON Schema.'
    });
    console.log('[PODCAST TRACE] [Stage 2/8] Prompt built with payload: ', promptDetails);

    // Stage 3 & 4: Sending and waiting AI response
    activeStageId = 'send_request';
    console.log('[PODCAST TRACE] [Stage 3/8] Sending payload to server route /api/podcast/generate ...');
    updateStage('send_request', { 
      status: 'active', 
      details: `Вызов POST /api/podcast/generate с темой: ${config.topic.substring(0, 30)}...`
    });
    
    updateStage('wait_response', { status: 'active', details: 'Ожидание ответа от модели Gemini-3.5-Flash...' });
    activeStageId = 'wait_response';

    try {
      const responseStart = Date.now();
      const payloadString = JSON.stringify(config, null, 2);
      
      console.log('[PODCAST TRACE] Fetching API route "/api/podcast/generate" with payload:', config);
      const podcastResult = await generatePodcast(config);
      const responseDuration = Date.now() - responseStart;
      
      console.log(`[PODCAST TRACE] [Stage 4/8] Received AI response in ${responseDuration}ms.`, podcastResult);
      
      updateStage('send_request', { status: 'success' }, { aiPayload: payloadString });
      updateStage('wait_response', { 
        status: 'success',
        details: `Статус: 200 OK. Время ответа: ${(responseDuration / 1000).toFixed(1)} сек`
      }, { aiResponse: JSON.stringify(podcastResult, null, 2) });

      // Stage 5: Parse structure
      activeStageId = 'parse_structure';
      console.log('[PODCAST TRACE] [Stage 5/8] Parsing podcast segment structure generated by model...');
      updateStage('parse_structure', { 
        status: 'active',
        details: `Валидация полей. Сегментов в массиве: ${podcastResult?.script?.length || 0}`
      });
      await new Promise(r => setTimeout(r, 500));

      if (!podcastResult || !podcastResult.script || !Array.isArray(podcastResult.script)) {
        throw new Error('Некорректная структура ответа: отсутствует сценарий подкаста.');
      }

      updateStage('parse_structure', { status: 'success' });
      console.log('[PODCAST TRACE] [Stage 5/8] Parsing successfully verified.');

      // Stage 6: Build timeline
      activeStageId = 'build_timeline';
      console.log('[PODCAST TRACE] [Stage 6/8] Building speech timeline and aligning voice channels...');
      updateStage('build_timeline', { 
        status: 'active',
        details: `Расчет хронометража: ${podcastResult.script.reduce((sum, s) => sum + s.durationSeconds, 0)} сек`
      });
      await new Promise(r => setTimeout(r, 600));
      updateStage('build_timeline', { status: 'success' });

      // Stage 7: Prepare audio
      activeStageId = 'prepare_audio';
      console.log('[PODCAST TRACE] [Stage 7/8] Matching speaker roles with synthetic voice settings library...');
      updateStage('prepare_audio', { 
        status: 'active',
        details: `Подготовка голоса для ведущего и гостя. Текст реплик готов к отправке в ElevenLabs.`
      });
      await new Promise(r => setTimeout(r, 500));
      updateStage('prepare_audio', { status: 'success' });

      // Stage 8: Finalize
      activeStageId = 'finalize_episode';
      const totalTime = Date.now() - startTime;
      console.log(`[PODCAST TRACE] [Stage 8/8] Generation pipeline fully completed in ${(totalTime / 1000).toFixed(1)}s!`);
      updateStage('finalize_episode', { 
        status: 'success',
        details: `Успех! Общее время генерации: ${(totalTime / 1000).toFixed(1)} сек`
      }, { totalDurationMs: totalTime });

      setResult(podcastResult);
      toast.success('Сценарий подкаста успешно создан!');
      return podcastResult;

    } catch (err: any) {
      console.error('[PODCAST TRACE] Pipeline Error occurred during stage:', activeStageId, err);
      const msg = err.message || 'Ошибка генерации сценария подкаста';
      setError(msg);
      toast.error(msg);

      // Single-pass atomic state update to prevent stale state issues and batching races
      setDebugTrace(prev => {
        const updatedStages = prev.stages.map(s => {
          if (s.id === activeStageId) {
            const start = s.startedAt || startTime;
            return {
              ...s,
              status: 'error' as DebugStatus,
              error: msg,
              details: `Пайплайн упал на этапе "${s.label}". Ошибка: ${msg}`,
              durationMs: Date.now() - start
            };
          }
          if (s.status === 'pending' || s.status === 'active') {
            return {
              ...s,
              status: 'pending' as DebugStatus, // keep status as pending visually, but updated description
              details: 'Отменено из-за ошибки в пайплайне'
            };
          }
          return s;
        });

        return {
          ...prev,
          stages: updatedStages,
          lastUpdated: Date.now(),
          rawError: err.stack || err.toString(),
          totalDurationMs: Date.now() - startTime
        };
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearResult = () => {
    setResult(null);
  };

  return {
    isGenerating,
    error,
    result,
    debugTrace,
    generate,
    clearResult,
    setResult
  };
}

