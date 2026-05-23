import { useState } from 'react';
import { ScriptSegment, VoiceSelection } from '../types/podcast.types';
import { 
  Play, 
  Pause, 
  Download, 
  User, 
  Clock, 
  Volume2, 
  Pencil,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  hook: { label: 'Крючок / Разгон', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  intro: { label: 'Интро / Приветствие', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  discussion: { label: 'Основное обсуждение', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  transition: { label: 'Переход к теме', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  question: { label: 'Интерактивный Вопрос', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  outro: { label: 'Аутро / Заключение', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  cta: { label: 'Призыв к действию (CTA)', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
};

interface PodcastTimelineProps {
  script: ScriptSegment[];
  voiceSelection: VoiceSelection;
  playingId: string | null;
  synthesizedUrls: Record<string, string>;
  synthesizingId: string | null;
  onTogglePlay: (id: string, text: string, voiceId: string) => void;
  onDownloadMp3: (id: string, text: string, voiceId: string, title: string) => void;
  
  // Inline edit extensions (Requirement 1, 2, 3, 4)
  onUpdateScriptSegmentText?: (id: string, newText: string) => void;
  onRegenerateAudio?: (id: string, text: string, voiceId: string, speaker?: 'host' | 'guest') => Promise<any>;
}

export function PodcastTimeline({
  script,
  voiceSelection,
  playingId,
  synthesizedUrls,
  synthesizingId,
  onTogglePlay,
  onDownloadMp3,
  onUpdateScriptSegmentText,
  onRegenerateAudio
}: PodcastTimelineProps) {
  // Editing state machine
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  
  // Auto-save draft safety (Requirement 7)
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  
  // Track active regeneration at the segment level (Requirement 4 & 9)
  const [isRegeneratingId, setIsRegeneratingId] = useState<string | null>(null);

  const handleStartEdit = (segmentId: string, initialText: string, voiceId: string, isPlayingSegment: boolean) => {
    // If segment is playing, pause/stop it first before editing
    if (isPlayingSegment) {
      onTogglePlay(segmentId, initialText, voiceId);
    }
    
    setEditingSegmentId(segmentId);
    
    // Auto-save load safety: pull draft if it exists, otherwise pull original text
    const savedDraft = drafts[segmentId];
    setEditingText(savedDraft ?? initialText);
  };

  const handleSave = (segmentId: string) => {
    const textToSave = drafts[segmentId] ?? editingText;
    if (!textToSave.trim()) {
      toast.error('Текст реплики не может быть пустым');
      return;
    }

    if (onUpdateScriptSegmentText) {
      onUpdateScriptSegmentText(segmentId, textToSave);
    }

    // Clean up draft after save
    setDrafts(prev => {
      const copy = { ...prev };
      delete copy[segmentId];
      return copy;
    });

    setEditingSegmentId(null);
    toast.success('Изменения успешно сохранены');
  };

  const handleDiscardDraft = (segmentId: string, originalText: string) => {
    setDrafts(prev => {
      const copy = { ...prev };
      delete copy[segmentId];
      return copy;
    });
    if (editingSegmentId === segmentId) {
      setEditingText(originalText);
    }
    toast.info('Черновик сброшен к исходному тексту');
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div>
          <h3 className="text-base font-bold text-neutral-800 font-display">Таймлайн диалога</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Последовательность реплик и озвучивание</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-neutral-500">
          <span className="flex items-center gap-1"><Clock size={12} /> {script.length} сегм.</span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {Math.ceil(script.reduce((acc, s) => acc + s.durationSeconds, 0) / 60)} мин. всего
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {script.map((segment, index) => {
          const isHost = segment.speaker === 'host';
          const voiceId = isHost ? voiceSelection.hostVoiceId : (voiceSelection.guestVoiceId || 'pNInz6obpgdq5TaqLwtY');
          const isPlaying = playingId === segment.id;
          const isSynthesizing = synthesizingId === segment.id;
          const isLoaded = !!synthesizedUrls[segment.id];
          const typeBadge = TYPE_LABELS[segment.type] || { label: 'Пост', color: 'bg-neutral-100 text-neutral-800 border-neutral-200' };
          
          const isEditing = editingSegmentId === segment.id;
          const draftText = drafts[segment.id];
          const hasDraft = draftText !== undefined && draftText !== segment.text;

          return (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.4) }}
              className={`p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
                isEditing
                  ? 'bg-indigo-50/10 border-indigo-500 shadow-md shadow-indigo-500/[0.04]'
                  : isPlaying 
                    ? 'bg-emerald-50/50 border-[#10B981] shadow-md shadow-emerald-500/[0.03]' 
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {/* Playback animation line indicator */}
              {isPlaying && !isEditing && (
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#10B981] animate-pulse" />
              )}
              {isEditing && (
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-indigo-500 animate-pulse" />
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {/* Speaker circle */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isHost ? 'bg-emerald-100 text-[#10B981]' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    <User size={18} />
                  </div>

                  <div className="space-y-1.5 flex-1 w-full max-w-full overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-neutral-700">{segment.speakerName}</span>
                      <span className="text-[10px] text-neutral-400 font-bold">•</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold border ${typeBadge.color}`}>
                        {typeBadge.label}
                      </span>
                      {isEditing && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-indigo-100 text-indigo-800 border-indigo-200 animate-pulse uppercase tracking-widest">
                          EDIT MODE
                        </span>
                      )}
                      {hasDraft && !isEditing && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                          ЧЕРНОВИК
                        </span>
                      )}
                      {hasDraft && (
                        <button
                          type="button"
                          onClick={() => handleDiscardDraft(segment.id, segment.text)}
                          className="text-[10px] text-amber-600 hover:text-amber-800 font-black underline decoration-dotted uppercase tracking-widest ml-1"
                          title="Откатить изменения к оригинальной версии"
                        >
                          Сбросить
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 mt-1">
                        <textarea
                          value={editingText}
                          onChange={(e) => {
                            setEditingText(e.target.value);
                            setDrafts(prev => ({ ...prev, [segment.id]: e.target.value }));
                            
                            // Native Auto resize height mapping
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              e.preventDefault();
                              handleSave(segment.id);
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              setEditingSegmentId(null);
                            }
                          }}
                          ref={(el) => {
                            if (el) {
                              el.style.height = 'auto';
                              el.style.height = el.scrollHeight + 'px';
                            }
                          }}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-sm font-medium leading-relaxed text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                          rows={2}
                          placeholder="Введите text реплики..."
                          disabled={isRegeneratingId === segment.id}
                        />
                        
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                          {/* Left helper tools */}
                          <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                            Ctrl+Enter (Сохранить) • Esc (Отмена)
                          </div>
                          
                          {/* Right action control pack */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSave(segment.id)}
                              disabled={isRegeneratingId === segment.id}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                            >
                              <Check size={12} className="stroke-[3]" />
                              Сохранить
                            </button>
                            
                            {onRegenerateAudio && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const textToSave = drafts[segment.id] ?? editingText;
                                  if (!textToSave.trim()) {
                                    toast.error('Текст реплики не может быть пустым');
                                    return;
                                  }

                                  // Update the timeline state text first
                                  if (onUpdateScriptSegmentText) {
                                    onUpdateScriptSegmentText(segment.id, textToSave);
                                  }

                                  // Remove from draft
                                  setDrafts(prev => {
                                    const copy = { ...prev };
                                    delete copy[segment.id];
                                    return copy;
                                  });
                                  
                                  setEditingSegmentId(null);
                                  setIsRegeneratingId(segment.id);
                                  
                                  const startMs = Date.now();
                                  try {
                                    await onRegenerateAudio(segment.id, textToSave, voiceId, segment.speaker);
                                    const latencyMs = Date.now() - startMs;
                                    
                                    // Requirement 9 console diagnostic logging
                                    console.log(`
[SEGMENT EDIT] Action Completed
- segmentId: ${segment.id}
- old length: ${segment.text.length}
- new length: ${textToSave.length}
- cache invalidated: true
- audio regenerated: true
- synthesis latency: ${latencyMs}ms
                                    `);
                                    toast.success('Аудио реплики заново озвучено и обновлено!');
                                  } catch (err: any) {
                                    console.error('[SEGMENT EDIT] Regenerate Failed:', err);
                                    toast.error(`Ошибка переозвучки: ${err.message || err}`);
                                  } finally {
                                    setIsRegeneratingId(null);
                                  }
                                }}
                                disabled={isRegeneratingId === segment.id}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                              >
                                {isRegeneratingId === segment.id ? (
                                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0110 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                ) : (
                                  <Sparkles size={12} />
                                )}
                                Переозвучить
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setEditingSegmentId(null)}
                              disabled={isRegeneratingId === segment.id}
                              className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-medium flex items-center gap-1 transition-all focus:outline-none focus:ring-2 focus:ring-neutral-200 disabled:opacity-50"
                            >
                              <X size={12} />
                              Отмена
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium leading-relaxed text-neutral-700 group-hover:text-black transition-colors">
                          "{segment.text}"
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-[11px] font-bold text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {segment.durationSeconds} сек
                          </span>
                          {isLoaded && (
                            <span className="flex items-center gap-1 text-[#10B981]">
                              <Volume2 size={11} /> Готов к прослушиванию
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Synthesis controls */}
                {!isEditing && (
                  <div className="flex items-center gap-2 shrink-0 self-center">
                    <button
                      type="button"
                      onClick={() => onTogglePlay(segment.id, segment.text, voiceId)}
                      disabled={isSynthesizing || isRegeneratingId === segment.id}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-[#10B981]/25 ${
                        isPlaying 
                          ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' 
                          : isSynthesizing
                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                            : 'bg-emerald-100 text-[#10B981] hover:bg-[#10B981] hover:text-white'
                      }`}
                      title={isPlaying ? 'Пауза' : isLoaded ? 'Прослушать сегмент' : 'Синтезировать реплику'}
                    >
                      {isSynthesizing ? (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : isPlaying ? (
                        <div className="flex gap-0.5 items-end justify-center h-4">
                          <span className="w-1 bg-rose-600 rounded-full animate-pulse h-3" />
                          <span className="w-1 bg-rose-600 rounded-full animate-pulse h-4" />
                          <span className="w-1 bg-rose-600 rounded-full animate-pulse h-2" />
                        </div>
                      ) : (
                        <Play size={16} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(segment.id, segment.text, voiceId, isPlaying)}
                      disabled={isSynthesizing || isRegeneratingId === segment.id}
                      className="w-10 h-10 rounded-xl border border-neutral-200 text-neutral-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-150-dot"
                      title="Редактировать реплику"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDownloadMp3(segment.id, segment.text, voiceId, segment.title)}
                      disabled={isSynthesizing || isRegeneratingId === segment.id}
                      className="w-10 h-10 rounded-xl border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-neutral-200"
                      title="Загрузить реплику (MP3)"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
