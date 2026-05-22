import { useState } from 'react';
import { DebugTraceState, DebugStageLog, DebugStatus } from '../types/podcast.types';
import { 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Cpu, 
  Code2,
  FileJson,
  Activity
} from 'lucide-react';

interface PodcastDebugPanelProps {
  trace: DebugTraceState;
  isGenerating: boolean;
}

export function PodcastDebugPanel({ trace, isGenerating }: PodcastDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showPayload, setShowPayload] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [showErrorStack, setShowErrorStack] = useState(false);

  const getStatusIcon = (status: DebugStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={16} className="text-[#10B981] shrink-0" />;
      case 'error':
        return <AlertCircle size={16} className="text-rose-500 shrink-0 animate-bounce" />;
      case 'active':
        return <Loader2 size={16} className="text-emerald-500 shrink-0 animate-spin" />;
      case 'pending':
      default:
        return <Clock size={16} className="text-neutral-300 shrink-0" />;
    }
  };

  const getStatusBg = (status: DebugStatus) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-50 border-emerald-100 text-emerald-950';
      case 'error':
        return 'bg-rose-50 border-rose-100 text-rose-950';
      case 'active':
        return 'bg-emerald-50/50 border-emerald-500/20 text-neutral-800 animate-pulse';
      case 'pending':
      default:
        return 'bg-neutral-50/50 border-neutral-100 text-neutral-400';
    }
  };

  const hasActiveOrCompleted = trace.stages.some(s => s.status !== 'pending');

  if (!hasActiveOrCompleted && !isGenerating) return null;

  return (
    <div className="border border-neutral-150 rounded-[2.5rem] bg-white shadow-md overflow-hidden text-left transition-all duration-300">
      {/* Header bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between cursor-pointer select-none hover:bg-neutral-100/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 text-neutral-100 flex items-center justify-center">
            <Terminal size={15} />
          </div>
          <div>
            <span className="text-[9px] font-black text-[#10B981] uppercase tracking-[0.25em] leading-none block mb-0.5">Pipeline Trace</span>
            <h4 className="text-xs font-black text-neutral-700 uppercase tracking-widest flex items-center gap-1.5 leading-none">
              Инструменты отладки (Debug Console)
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {trace.totalDurationMs && (
            <span className="text-[10px] font-black bg-emerald-100 text-[#10B981] px-2.5 py-1 rounded-full shrink-0">
              Генерация: {(trace.totalDurationMs / 1000).toFixed(1)} сек
            </span>
          )}
          {isOpen ? <ChevronUp size={16} className="text-neutral-500" /> : <ChevronDown size={16} className="text-neutral-500" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-6 md:p-8 space-y-6">
          {/* Active Model / TTS Indicators */}
          <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-neutral-100 text-[10px] tracking-wider uppercase font-extrabold text-neutral-500">
            <div className="flex items-center gap-2 bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded-xl border border-neutral-200">
              <Cpu size={12} className="text-[#10B981] animate-pulse" />
              <span>ACTIVE MODEL: <span className="font-sans font-black text-neutral-900 text-[11px]">GPT-4o</span></span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded-xl border border-neutral-200">
              <Activity size={12} className="text-[#10B981]" />
              <span>ACTIVE TTS: <span className="font-sans font-black text-neutral-900 text-[11px]">ElevenLabs Multilingual v2</span></span>
            </div>
          </div>

          {/* AI Usage Telemetry Panel (Requirement 1, 9) */}
          {trace.telemetry && (
            <div className="p-5 rounded-[1.75rem] border border-neutral-150 bg-neutral-50/60 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-black">
                    T
                  </div>
                  <span className="text-xs font-black text-neutral-800 uppercase tracking-wider font-display">
                    AI Usage Telemetry
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-neutral-400 font-mono">
                    REQUEST ID: {trace.telemetry.requestId}
                  </span>
                  <span className="text-[9px] font-bold text-[#10B981] font-mono bg-[#10B981]/10 px-1.5 py-0.5 rounded">
                    {trace.telemetry.timestamp}
                  </span>
                </div>
              </div>

              {/* Grid of values */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 text-left">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase text-neutral-400 tracking-wider">Provider / Model</span>
                  <span className="text-xs font-black text-neutral-800 block font-mono">
                    {trace.telemetry.provider} ({trace.telemetry.model})
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase text-neutral-400 tracking-wider">Estimated Input</span>
                  <span className="text-xs font-black text-neutral-800 block font-mono">
                    {trace.telemetry.inputTokens.toLocaleString('ru-RU')} tk
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase text-neutral-400 tracking-wider">Estimated Output</span>
                  <span className="text-xs font-black text-neutral-800 block font-mono">
                    {trace.telemetry.outputTokens.toLocaleString('ru-RU')} tk
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase text-neutral-400 tracking-wider">Total Tokens</span>
                  <span className="text-xs font-black text-neutral-800 block font-mono">
                    {trace.telemetry.totalTokens.toLocaleString('ru-RU')} tk
                  </span>
                </div>

                {/* Color-coded cost indicator */}
                <div className="space-y-1 p-2 bg-white rounded-xl border border-neutral-150 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${
                    trace.telemetry.estimatedCost < 0.04
                      ? 'bg-emerald-500'
                      : trace.telemetry.estimatedCost < 0.10
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`} />
                  <span className="text-[9px] font-extrabold uppercase text-neutral-400 tracking-wider block">Est. Cost</span>
                  <span className={`text-xs font-black font-mono block ${
                    trace.telemetry.estimatedCost < 0.04
                      ? 'text-emerald-700'
                      : trace.telemetry.estimatedCost < 0.10
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}>
                    ${trace.telemetry.estimatedCost.toFixed(5)}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase text-neutral-400 tracking-wider">Duration</span>
                  <span className="text-xs font-black text-neutral-800 block font-mono">
                    {(trace.telemetry.durationMs / 1000).toFixed(2)}s
                  </span>
                </div>
              </div>

              {/* Sub-row with cache, triggers and counts */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] uppercase font-black text-neutral-600 border-t border-neutral-100 pt-3">
                <div>
                  <span className="text-neutral-400">Trigger:</span>{' '}
                  <span className="text-[#10B981] font-mono">
                    {trace.telemetry.triggerReason}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400">Cache:</span>{' '}
                  <span className="text-neutral-700 font-mono">
                    {trace.telemetry.cacheHitOrMiss}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400">Generations:</span>{' '}
                  <span className="text-neutral-700 font-mono">
                    {trace.telemetry.generationCount}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400">Retries:</span>{' '}
                  <span className="text-neutral-700 font-mono">
                    {trace.telemetry.retryCount}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Why was this request triggered explanation (Requirement 8) */}
          {trace.telemetry && (
            <div className="p-3 bg-neutral-50 border border-neutral-150 rounded-2xl text-xs text-neutral-600 flex flex-col md:flex-row md:items-center gap-2 leading-relaxed">
              <span className="font-extrabold text-[#10B981] uppercase tracking-wider text-[10px] shrink-0 font-sans border-r border-neutral-200 pr-2">
                Why was this request triggered?
              </span>
              <span>
                {trace.telemetry.triggerReason === 'manual button click' && 'Пользователь вручную нажал кнопку "Создать сценарий" на панели настроек подкаста.'}
                {trace.telemetry.triggerReason === 'retry' && 'Пользователь вручную нажал кнопку повтора запроса после сбоя или ошибки сети.'}
                {trace.telemetry.triggerReason === 'auto-refresh' && 'Система выполнила авто-обновление.'}
                {trace.telemetry.triggerReason === 'voice change' && 'Был изменен голос ведущего или гостя, потребовавший пересборки сценария.'}
                {trace.telemetry.triggerReason === 'timeline rebuild' && 'Пересборка таймлайна в студии.'}
                {trace.telemetry.triggerReason === 'useEffect sync' && 'Вызвано автоматической реактивной синхронизацией useEffect.'}
                {trace.telemetry.triggerReason === 'cache miss' && 'Вызвано локальным промахом кэша.'}
                {!['manual button click', 'retry', 'auto-refresh', 'voice change', 'timeline rebuild', 'useEffect sync', 'cache miss'].includes(trace.telemetry.triggerReason) && 'Запрос инициирован действием пользователя или программным триггером.'}
              </span>
            </div>
          )}

          {/* Session Cumulative Analytics (Requirement 9) */}
          {trace.sessionStats && (
            <div className="p-5 rounded-[1.75rem] border border-emerald-100 bg-emerald-50/20 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#047857] uppercase tracking-wider block">Requests this Session</span>
                <span className="text-xl font-black text-neutral-800 font-mono leading-none block">{trace.sessionStats.requestsThisSession}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#047857] uppercase tracking-wider block">Tokens this Session</span>
                <span className="text-xl font-black text-neutral-800 font-mono leading-none block">{trace.sessionStats.tokensThisSession.toLocaleString('ru-RU')}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#047857] uppercase tracking-wider block">Est. Session Cost</span>
                <span className="text-xl font-black text-emerald-800 font-mono leading-none block">${trace.sessionStats.estimatedSessionCost.toFixed(5)}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#047857] uppercase tracking-wider block">Avg Resp. Time</span>
                <span className="text-xl font-black text-neutral-800 font-mono leading-none block">{(trace.sessionStats.averageResponseTimeMs / 1000).toFixed(2)}s</span>
              </div>
            </div>
          )}

          {/* Main Pipeline Step-by-Step UI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {trace.stages.map((stage) => {
              const isSelected = stage.status === 'active';
              const isError = stage.status === 'error';

              return (
                <div 
                  key={stage.id} 
                  className={`p-3.5 rounded-2xl border transition-all text-xs flex flex-col gap-1.5 justify-between ${
                    isError ? 'col-span-full md:col-span-2 lg:col-span-2 shadow-sm' : ''
                  } ${getStatusBg(stage.status)}`}
                >
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold tracking-tight">{stage.label}</span>
                      {getStatusIcon(stage.status)}
                    </div>
                    
                    {stage.details && (
                      <span className={`text-[10px] text-neutral-600 font-medium leading-normal block ${
                        isError ? '' : 'line-clamp-2'
                      }`}>
                        {stage.details}
                      </span>
                    )}

                    {/* Integrated error system within the card itself */}
                    {isError && (
                      <div className="mt-2 text-left rounded-xl bg-rose-100/40 border border-rose-200/60 p-3 space-y-2 font-mono text-[10px] text-rose-950">
                        {trace.httpStatus !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <span className="font-sans font-bold text-[9px] uppercase tracking-wider bg-rose-200/80 px-1 py-0.5 rounded leading-none text-rose-900">HTTP Code:</span>
                            <span className="font-black font-mono">{trace.httpStatus}</span>
                          </div>
                        )}
                        {trace.parsingErrorDetails && (
                          <div className="space-y-0.5">
                            <div className="font-sans font-bold text-[9px] uppercase tracking-wider text-rose-800 leading-none">Parser Issue:</div>
                            <div className="text-[9.5px] leading-tight text-rose-950 whitespace-pre-wrap">{trace.parsingErrorDetails}</div>
                          </div>
                        )}
                        {stage.error && (
                          <div className="space-y-0.5">
                            <div className="font-sans font-bold text-[9px] uppercase tracking-wider text-rose-800 leading-none">Pipeline Error:</div>
                            <div className="text-[9.5px] leading-relaxed text-rose-900 whitespace-pre-wrap">{stage.error}</div>
                          </div>
                        )}
                        {trace.rawError && (
                          <div className="space-y-1">
                            <div className="font-sans font-bold text-[9px] uppercase tracking-wider text-rose-800 leading-none">Stack Trace:</div>
                            <pre className="p-2 bg-neutral-900 text-rose-300 font-mono text-[9px] overflow-auto max-h-32 rounded-lg border border-neutral-850 whitespace-pre scrollbar-thin">
                              {trace.rawError}
                            </pre>
                          </div>
                        )}
                        {trace.aiRawResponse && (
                          <div className="space-y-1">
                            <div className="font-sans font-bold text-[9px] uppercase tracking-wider text-rose-800 leading-none">Raw Server Body:</div>
                            <pre className="p-2 bg-neutral-900 text-cyan-400 font-mono text-[9px] overflow-auto max-h-32 rounded-lg border border-neutral-850 whitespace-pre scrollbar-thin">
                              {trace.aiRawResponse}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {stage.durationMs !== undefined && (
                    <span className="text-[9px] font-bold text-neutral-450 self-end mt-1.5">
                      +{stage.durationMs}ms
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Collapsible Source Payload Inspection views */}
          <div className="border-t border-neutral-100 pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Payload Button & Block */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowPayload(!showPayload)}
                disabled={!trace.aiPayload}
                className={`w-full px-4 py-2.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider flex items-center justify-between transition-all ${
                  trace.aiPayload
                    ? 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    : 'bg-neutral-50 border-neutral-100 text-neutral-300 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-1.5"><Code2 size={13} /> Raw Prompt Payload (Request)</span>
                {showPayload ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showPayload && trace.aiPayload && (
                <pre className="p-4 rounded-xl bg-neutral-900 text-amber-400 font-mono text-[10px] overflow-auto max-h-52 leading-relaxed text-left border border-neutral-800">
                  {trace.aiPayload}
                </pre>
              )}
            </div>

            {/* Response Button & Block */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowResponse(!showResponse)}
                disabled={!trace.aiResponse}
                className={`w-full px-4 py-2.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider flex items-center justify-between transition-all ${
                  trace.aiResponse
                    ? 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    : 'bg-neutral-50 border-neutral-100 text-neutral-300 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-1.5"><FileJson size={13} /> AI Structured Response (JSON)</span>
                {showResponse ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showResponse && trace.aiResponse && (
                <pre className="p-4 rounded-xl bg-neutral-900 text-emerald-400 font-mono text-[10px] overflow-auto max-h-52 leading-relaxed text-left border border-neutral-800">
                  {trace.aiResponse}
                </pre>
              )}
            </div>

            {/* AI Raw Response Button & Block */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowRawResponse(!showRawResponse)}
                disabled={!trace.aiRawResponse}
                className={`w-full px-4 py-2.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider flex items-center justify-between transition-all ${
                  trace.aiRawResponse
                    ? 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200 ring-2 ring-emerald-500/20'
                    : 'bg-neutral-50 border-neutral-100 text-neutral-300 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-1.5"><Activity size={13} /> AI Raw Response (HTML/Text)</span>
                {showRawResponse ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showRawResponse && trace.aiRawResponse && (
                <div className="space-y-1">
                  {trace.httpStatus !== undefined && (
                    <div className="flex items-center gap-2 text-[9px] font-bold text-neutral-500 font-mono px-1">
                      <span>HTTP STATUS:</span>
                      <span className={`px-1.5 py-0.5 rounded ${trace.httpStatus === 200 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {trace.httpStatus} {trace.httpStatus === 200 ? 'OK' : 'ERROR'}
                      </span>
                    </div>
                  )}
                  {trace.parsingErrorDetails && (
                    <div className="text-[9px] font-bold text-rose-600 font-mono px-1 leading-tight">
                      PARSER: {trace.parsingErrorDetails}
                    </div>
                  )}
                  <pre className="p-4 rounded-xl bg-neutral-900 text-cyan-400 font-mono text-[10px] overflow-auto max-h-52 leading-relaxed text-left border border-neutral-800">
                    {trace.aiRawResponse}
                  </pre>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
