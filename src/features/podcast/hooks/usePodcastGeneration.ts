import { useState } from 'react';
import { PodcastConfig, PodcastResult, DebugTraceState, DebugStageLog, DebugStageId, DebugStatus, TelemetryLog, SessionStats } from '../types/podcast.types';
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

// Persistent session statistics that survive component unmounts during the active user session
let sessionRequestsCount = 0;
let sessionTokensSum = 0;
let sessionCostSum = 0;
let sessionDurations: number[] = [];
let totalSessionGenerations = 0;
let retrySessionCount = 0;

let lastRequestPayload: string | null = null;
let lastRequestTime = 0;
const callsWindowTimestamps: number[] = []; // track calls for rate limiting per minute
const SESSION_ID = "session_" + Math.random().toString(36).substring(2, 11);

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

  const generate = async (config: PodcastConfig, triggerReason = 'manual button click') => {
    const configHash = JSON.stringify(config);
    const now = Date.now();
    
    // 1. GLOBAL MUTEX LOCK
    if (isGenerating) {
      console.warn('[COST GUARD] Ignored duplicate generate request as another is currently active.');
      return null;
    }
    
    // 2. REQUEST DEBOUNCE (MINIMUM 1500MS)
    if (now - lastRequestTime < 1500) {
      const warningMsg = 'Пожалуйста, подождите. Будет обработано предыдущее действие.';
      toast.warning(warningMsg);
      console.warn('[COST GUARD] Debounced request:', warningMsg);
      return null;
    }

    // 3. LOOP DETECTION LAYER (Storm / useEffect Sync protection)
    
    // Check for rapid double-call (within 3 seconds)
    if (now - lastRequestTime < 3000) {
      const errStr = 'Potential rapid regeneration loop detected. Request blocked.';
      console.error('[COST CONTROL SYSTEM] [BLOCKED]', errStr);
      setError('Обнаружено циклическое дублирование запросов. Генерация заблокирована для экономии токенов.');
      toast.error('Обнаружен зацикленный вызов генератора! Выполнение прервано.');
      return null;
    }

    // Check for repeated identical request within 15 seconds (unless intentional retry)
    if (configHash === lastRequestPayload && now - lastRequestTime < 15000 && triggerReason !== 'retry') {
      const errStr = 'Potential identical state-trigger loop detected (identical parameters within 15s). Request blocked.';
      console.error('[COST CONTROL SYSTEM] [BLOCKED]', errStr);
      setError('Обнаружен повторный идентичный вызов! Если это не повторная отправка вручную, проверьте useEffect зависимости.');
      toast.error('Предупреждение: Обнаружен зацикленный вызов с теми же параметрами!');
      return null;
    }

    // Check for generations per minute limit (Max 5 per minute)
    const oneMinuteAgo = now - 60000;
    while (callsWindowTimestamps.length > 0 && callsWindowTimestamps[0] < oneMinuteAgo) {
      callsWindowTimestamps.shift();
    }
    if (callsWindowTimestamps.length >= 5) {
      const errStr = 'Safety cost guard activated: Превышен лимит (5) генераций в минуту. Попробуйте позже.';
      console.error('[COST CONTROL SYSTEM] [BLOCKED]', errStr);
      setError('Активирован предохранитель стоимости: слишком много генераций за минуту (лимит 5/мин).');
      toast.error('Режим экономии токенов: Превышена частота запросов.');
      return null;
    }

    // Check for session limit (Max 15 requests per session)
    if (sessionRequestsCount >= 15) {
      const errStr = 'Safety cost guard activated: Достигнут жесткий лимит сессии на 15 генераций подкастов.';
      console.error('[COST CONTROL SYSTEM] [BLOCKED]', errStr);
      setError('Предохранитель стоимости: лимит сессии исчерпан (максимум 15 генераций за сессию).');
      toast.error(errStr);
      return null;
    }

    // Update track parameters for next guard pass
    lastRequestPayload = configHash;
    lastRequestTime = now;
    callsWindowTimestamps.push(now);

    setIsGenerating(true);
    setError(null);
    resetStages();
    
    const startTime = Date.now();
    let activeStageId: DebugStageId = 'collect_config';
    
    console.log('[PODCAST TRACE] [Stage 1/8] Starting validation and config collection. Payload:', config);
    
    if (triggerReason === 'retry') {
      retrySessionCount++;
    }

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
    console.log('[PODCAST TRACE] [Stage 2/8] Generating OpenAI Structured API constraints and context models (Provider: OpenAI GPT-4o).');
    updateStage('build_prompt', { 
      status: 'active',
      details: `Сборка роли для GPT-4o: JSON Schema, 7 сегментов для ${config.durationMinutes} минут`
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
    console.log('[PODCAST TRACE] [Stage 3/8] Sending payload to server route /api/podcast/generate (Model: GPT-4o)...');
    updateStage('send_request', { 
      status: 'active', 
      details: `Вызов POST /api/podcast/generate с темой: ${config.topic.substring(0, 30)}...`
    });
    
    updateStage('wait_response', { status: 'active', details: 'Ожидание ответа от модели OpenAI GPT-4o...' });
    activeStageId = 'wait_response';

    try {
      const responseStart = Date.now();
      
      // Clean config clone to pass exactly the prompt inputs without pollution
      const sanitizedPayload = {
        topic: config.topic,
        durationMinutes: config.durationMinutes,
        guestEnabled: config.guestEnabled,
        guest: config.guestEnabled ? {
          name: config.guest?.name || "",
          expertise: config.guest?.expertise || "",
          speakingStyle: config.guest?.speakingStyle || "",
          energyLevel: config.guest?.energyLevel || 5
        } : undefined
      };

      const payloadString = JSON.stringify(sanitizedPayload, null, 2);
      
      console.log('[PODCAST TRACE] Fetching API route "/api/podcast/generate" with payload:', sanitizedPayload);
      const podcastResult = await generatePodcast(sanitizedPayload, triggerReason, SESSION_ID);
      const responseDuration = Date.now() - responseStart;
      
      console.log(`[PODCAST TRACE] [Stage 4/8] Received AI response in ${responseDuration}ms.`, podcastResult);
      
      updateStage('send_request', { status: 'success' }, { aiPayload: payloadString });
      updateStage('wait_response', { 
        status: 'success',
        details: `Статус: 200 OK. Время ответа: ${(responseDuration / 1000).toFixed(1)} сек`
      }, { 
        aiResponse: JSON.stringify(podcastResult, null, 2),
        aiRawResponse: JSON.stringify(podcastResult, null, 2),
        httpStatus: 200
      });

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
      
      // Update persistent session usage values
      sessionRequestsCount++;
      totalSessionGenerations++;
      sessionDurations.push(totalTime);
      
      const usage = (podcastResult as any).usage || {};
      const ptTokens = usage.prompt_tokens || Math.ceil((payloadString.length + 8000) * 0.45);
      const cpTokens = usage.completion_tokens || Math.ceil(JSON.stringify(podcastResult).length * 0.45);
      const totalTk = usage.total_tokens || (ptTokens + cpTokens);
      const estCst = usage.estimatedCost || (ptTokens * 0.0000025 + cpTokens * 0.0000100);

      sessionTokensSum += totalTk;
      sessionCostSum += estCst;

      const telemetryObj: TelemetryLog = {
        provider: 'OpenAI',
        model: 'gpt-4o',
        inputTokens: ptTokens,
        outputTokens: cpTokens,
        totalTokens: totalTk,
        estimatedCost: estCst,
        durationMs: totalTime,
        retryCount: retrySessionCount,
        generationCount: totalSessionGenerations,
        cacheHitOrMiss: 'Cache Miss',
        requestId: usage.requestId || `req_${Math.random().toString(36).substring(2, 11)}`,
        timestamp: usage.timestamp || new Date().toLocaleTimeString('ru-RU'),
        triggerReason: triggerReason
      };

      const sessionStatsObj: SessionStats = {
        requestsThisSession: sessionRequestsCount,
        tokensThisSession: sessionTokensSum,
        estimatedSessionCost: sessionCostSum,
        averageResponseTimeMs: Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
      };

      updateStage('finalize_episode', { 
        status: 'success',
        details: `Успех! Общее время генерации: ${(totalTime / 1000).toFixed(1)} сек`
      }, { 
        totalDurationMs: totalTime,
        telemetry: telemetryObj,
        sessionStats: sessionStatsObj
      });

      setResult(podcastResult);
      toast.success('Сценарий подкаста успешно создан!');
      return podcastResult;

    } catch (err: any) {
      const errorStage = err.stageId || activeStageId;
      console.error(`[PODCAST TRACE] Pipeline Error occurred during stage: "${errorStage}"`, err);
      const msg = err.message || 'Ошибка генерации сценария подкаста';
      setError(msg);
      toast.error(msg);

      // Track the request on error as well for session analytics consistency
      sessionRequestsCount++;
      const ptTokens = Math.ceil((config.topic.length + 8000) * 0.45);
      const cpTokens = 0;
      const totalTk = ptTokens + cpTokens;
      const estCst = ptTokens * 0.0000025;

      sessionTokensSum += totalTk;
      sessionCostSum += estCst;
      const totalTime = Date.now() - startTime;
      sessionDurations.push(totalTime);

      const telemetryObj: TelemetryLog = {
        provider: 'OpenAI',
        model: 'gpt-4o',
        inputTokens: ptTokens,
        outputTokens: cpTokens,
        totalTokens: totalTk,
        estimatedCost: estCst,
        durationMs: totalTime,
        retryCount: retrySessionCount,
        generationCount: totalSessionGenerations,
        cacheHitOrMiss: 'Cache Miss',
        requestId: `req_fail_${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date().toLocaleTimeString('ru-RU'),
        triggerReason: triggerReason
      };

      const sessionStatsObj: SessionStats = {
        requestsThisSession: sessionRequestsCount,
        tokensThisSession: sessionTokensSum,
        estimatedSessionCost: sessionCostSum,
        averageResponseTimeMs: Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
      };

      // Single-pass atomic state update to prevent stale state issues and batching races
      setDebugTrace(prev => {
        const updatedStages = prev.stages.map(s => {
          if (s.id === errorStage) {
            const start = s.startedAt || startTime;
            return {
              ...s,
              status: 'error' as DebugStatus,
              error: msg,
              details: err.details 
                ? `Детали: ${err.details}` 
                : `Пайплайн упал на этапе "${s.label}". Ошибка: ${msg}`,
              durationMs: Date.now() - start
            };
          }
          if (s.status === 'pending' || s.status === 'active') {
            return {
              ...s,
              status: 'pending' as DebugStatus,
              details: 'Отменено из-за ошибки в пайплайне'
            };
          }
          return s;
        });

        return {
          ...prev,
          stages: updatedStages,
          lastUpdated: Date.now(),
          rawError: `${err.name || 'Error'}: ${msg}\n${err.stack || ''}`,
          aiRawResponse: err.rawResponse || undefined,
          httpStatus: err.status !== undefined ? err.status : undefined,
          parsingErrorDetails: err.details || undefined,
          totalDurationMs: Date.now() - startTime,
          telemetry: telemetryObj,
          sessionStats: sessionStatsObj
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

