import { ScriptSegment, VoiceSelection } from '../types/podcast.types';
import { 
  Play, 
  Pause, 
  Download, 
  User, 
  Clock, 
  Volume2, 
  HelpCircle,
  MessageSquareShare,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';

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
}

export function PodcastTimeline({
  script,
  voiceSelection,
  playingId,
  synthesizedUrls,
  synthesizingId,
  onTogglePlay,
  onDownloadMp3
}: PodcastTimelineProps) {
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

          return (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.4) }}
              className={`p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
                isPlaying 
                  ? 'bg-emerald-50/50 border-[#10B981] shadow-md shadow-emerald-500/[0.03]' 
                  : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {/* Playback animation line indicator */}
              {isPlaying && (
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#10B981] animate-pulse" />
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {/* Speaker circle */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isHost ? 'bg-emerald-100 text-[#10B981]' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    <User size={18} />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-neutral-700">{segment.speakerName}</span>
                      <span className="text-[10px] text-neutral-400 font-bold">•</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold border ${typeBadge.color}`}>
                        {typeBadge.label}
                      </span>
                    </div>

                    <p className="text-sm font-medium leading-relaxed text-neutral-700">
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
                  </div>
                </div>

                {/* Synthesis controls */}
                <div className="flex items-center gap-2 shrink-0 self-center">
                  <button
                    type="button"
                    onClick={() => onTogglePlay(segment.id, segment.text, voiceId)}
                    disabled={isSynthesizing}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
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
                    onClick={() => onDownloadMp3(segment.id, segment.text, voiceId, segment.title)}
                    disabled={isSynthesizing}
                    className="w-10 h-10 rounded-xl border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 flex items-center justify-center transition-all"
                    title="Загрузить реплику (MP3)"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
