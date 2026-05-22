import { useState, useEffect, useRef } from 'react';
import { ScriptSegment, VoiceSelection } from '../types/podcast.types';
import { 
  Play, 
  Pause, 
  Volume2, 
  Download, 
  FileText, 
  Disc,
  Clock,
  Music,
  Save,
  Check,
  Cpu,
  Tv,
  Sparkles,
  RotateCcw,
  SkipForward,
  SkipBack,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface PodcastAudioPlayerProps {
  title: string;
  description: string;
  script: ScriptSegment[];
  synthesizedUrls: Record<string, string>;
  onSaveToFavorites: () => void;
  voiceSelection: VoiceSelection;
  isSynthesizingFull: boolean;
  fullProgress: string | null;
  fullEpisodeUrl: string | null;
  onSynthesizeFull: () => void;
  onDownloadFull: () => void;
}

export function PodcastAudioPlayer({ 
  title, 
  description, 
  script, 
  synthesizedUrls, 
  onSaveToFavorites,
  voiceSelection,
  isSynthesizingFull,
  fullProgress,
  fullEpisodeUrl,
  onSynthesizeFull,
  onDownloadFull
}: PodcastAudioPlayerProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // States for unified single track playback
  const [isPlayingMerged, setIsPlayingMerged] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const mergedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate cumulative script time in seconds
  const totalScriptSeconds = script.reduce((acc, s) => acc + s.durationSeconds, 0);

  useEffect(() => {
    // If we have a new merged track, configure the player
    if (fullEpisodeUrl) {
      if (mergedAudioRef.current) {
        mergedAudioRef.current.pause();
      }
      const audio = new Audio(fullEpisodeUrl);
      mergedAudioRef.current = audio;

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onloadedmetadata = () => {
        setDuration(audio.duration || totalScriptSeconds);
      };

      audio.onended = () => {
        setIsPlayingMerged(false);
        setCurrentTime(0);
      };

      audio.onerror = () => {
        setIsPlayingMerged(false);
      };
    }

    return () => {
      if (mergedAudioRef.current) {
        mergedAudioRef.current.pause();
        mergedAudioRef.current = null;
      }
    };
  }, [fullEpisodeUrl]);

  const togglePlayMerged = () => {
    if (!mergedAudioRef.current) {
      if (!fullEpisodeUrl) {
        toast.error('Полный выпуск еще не скомпилирован.');
        return;
      }
      return;
    }

    if (isPlayingMerged) {
      mergedAudioRef.current.pause();
      setIsPlayingMerged(false);
    } else {
      // Clear standard speech synthesizers if running
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      mergedAudioRef.current.play().then(() => {
        setIsPlayingMerged(true);
      }).catch((err) => {
        console.error(err);
        toast.error('Не удалось запустить воспроизведение');
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (mergedAudioRef.current) {
      mergedAudioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const skipRelative = (secs: number) => {
    if (mergedAudioRef.current) {
      let nextVal = mergedAudioRef.current.currentTime + secs;
      if (nextVal < 0) nextVal = 0;
      if (nextVal > duration) nextVal = duration;
      mergedAudioRef.current.currentTime = nextVal;
      setCurrentTime(nextVal);
    }
  };

  // Find active speaker based on current timestamp
  const activeSpeakerInfo = (() => {
    if (!isPlayingMerged) return null;
    let elapsed = 0;
    for (let i = 0; i < script.length; i++) {
      const seg = script[i];
      if (currentTime >= elapsed && currentTime <= elapsed + seg.durationSeconds) {
        return { segment: seg, index: i };
      }
      elapsed += seg.durationSeconds;
    }
    return null;
  })();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyText = () => {
    const textOutput = `=== СЦЕНАРИЙ: ${title} ===\n${description}\n\n` + 
      script.map(s => `[${s.speakerName}] (${s.durationSeconds}с): "${s.text}"`).join('\n\n');
    navigator.clipboard.writeText(textOutput);
    setCopied(true);
    toast.success('Текст всего подкаста скопирован!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#111827] text-white p-6 md:p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl relative overflow-hidden text-left">
      {/* Wave pulse visualization background */}
      <div className="absolute inset-x-0 bottom-0 top-1/2 opacity-[0.06] pointer-events-none flex items-end justify-center gap-1.5 p-2 overflow-hidden">
        {Array.from({ length: 32 }).map((_, i) => (
          <div 
            key={i} 
            className={`w-2.5 bg-[#10B981] rounded-t-full transition-all duration-300 ${
              isPlayingMerged ? 'animate-bounce' : 'h-3'
            }`} 
            style={{ 
              height: isPlayingMerged ? `${25 + Math.sin(i + currentTime) * 60 + Math.random() * 40}px` : '12px',
              animationDelay: `${i * 0.08}s`,
              animationDuration: `${0.7 + Math.random() * 1.2}s`
            }} 
          />
        ))}
      </div>

      <div className="relative z-10 space-y-6">
        {/* Main top bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-5 border-b border-neutral-800/60">
          <div className="flex items-center gap-4 text-left w-full md:w-auto">
            <div className="relative">
              <div className={`w-14 h-14 rounded-2xl bg-emerald-500/10 text-[#10B981] flex items-center justify-center border border-emerald-500/20 shadow-inner ${
                isPlayingMerged ? 'animate-spin duration-[14s]' : ''
              }`}>
                <Disc size={28} />
              </div>
              {isPlayingMerged && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <span className="text-[10px] bg-emerald-500/10 text-[#10B981] border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase font-black tracking-widest leading-none mb-1.5 inline-block">
                СВЕДЕННЫЙ ВЫПУСК
              </span>
              <h4 className="text-base font-bold truncate text-neutral-100 tracking-tight">{title}</h4>
              <p className="text-xs text-neutral-400 truncate mt-0.5">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyText}
              className="p-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 rounded-xl transition-all"
              title="Копировать текст сценария подкаста"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <FileText size={14} />}
            </button>

            <button
              type="button"
              onClick={() => {
                onSaveToFavorites();
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
              className="p-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 rounded-xl transition-all"
              title="Запомнить подкаст"
            >
              {saved ? <Check size={14} className="text-emerald-500" /> : <Save size={14} />}
            </button>
          </div>
        </div>

        {/* State 1: Active Compilation Progress */}
        {isSynthesizingFull && (
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-3.5 animate-pulse">
            <div className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-[#10B981] font-bold">
                <Cpu size={14} className="animate-spin" />
                <span>[9] Синтез аудио сегментов в ElevenLabs</span>
              </div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
                Идёт сведение...
              </span>
            </div>
            
            {/* Custom compilation progress layout */}
            <p className="text-xs text-neutral-200 font-medium">
              ⚡ {fullProgress || 'Подготовка аудиопотока...'}
            </p>

            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-2/3 animate-[shimmer_2s_infinite] rounded-full" />
            </div>
            
            <div className="grid grid-cols-2 text-[10px] text-neutral-500 font-bold border-t border-neutral-800/50 pt-3">
              <div>[10] Слияние дорожек (sequential merge)</div>
              <div className="text-right">[11] Финализация медиа плеера</div>
            </div>
          </div>
        )}

        {/* State 2: Merged track completed & Playable */}
        {!isSynthesizingFull && fullEpisodeUrl && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Play controls & Seek slidebar */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-neutral-400 w-10 text-left">
                {formatTime(currentTime)}
              </span>
              
              <input
                type="range"
                min="0"
                max={duration || totalScriptSeconds}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
              />

              <span className="text-xs font-mono text-neutral-400 w-10 text-right">
                {formatTime(duration || totalScriptSeconds)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
              {/* Audio controller buttons with relative skip */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => skipRelative(-10)}
                  className="p-2.5 bg-neutral-900 border border-neutral-800/80 hover:bg-neutral-800 text-neutral-300 rounded-xl transition-all"
                  title="Назад на 10 сек"
                >
                  <SkipBack size={14} />
                </button>

                <button
                  type="button"
                  onClick={togglePlayMerged}
                  className="px-6 py-3 bg-[#10B981] text-white hover:bg-emerald-600 font-extrabold text-xs rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/20"
                >
                  {isPlayingMerged ? (
                    <>
                      <Pause size={14} fill="currentColor" /> Остановить выпуск
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="currentColor" className="ml-0.5" /> Запустить выпуск
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => skipRelative(10)}
                  className="p-2.5 bg-neutral-900 border border-neutral-800/80 hover:bg-neutral-800 text-neutral-300 rounded-xl transition-all"
                  title="Вперед на 10 сек"
                >
                  <SkipForward size={14} />
                </button>
              </div>

              {/* Download actions */}
              <button
                type="button"
                onClick={onDownloadFull}
                className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-xs font-bold rounded-xl text-emerald-400 hover:bg-neutral-800 transition-all flex items-center gap-2 outline-none"
              >
                <Download size={14} /> Скачать полный выпуск (MP3)
              </button>
            </div>
          </div>
        )}

        {/* State 3: Compilation needed / Empty */}
        {!isSynthesizingFull && !fullEpisodeUrl && (
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left animate-in fade-in duration-300">
            <div className="space-y-1">
              <h5 className="text-xs font-black text-[#10B981] tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles size={12} />
                Готов к финальному сведению
              </h5>
              <p className="text-[11px] text-neutral-400 leading-normal max-w-md">
                Вы можете объединить все диалоги в полноценный MP3 файл. Система последовательно озвучит недостающие сегменты в ElevenLabs и сошьет единый непрерывный трек.
              </p>
            </div>

            <button
              type="button"
              onClick={onSynthesizeFull}
              className="px-4 py-3 bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shrink-0 self-center"
            >
              Собрать подкаст целиком
            </button>
          </div>
        )}

        {/* Active speaker panel highlight in playback (Fulfilling Requirement 8) */}
        {isPlayingMerged && activeSpeakerInfo && (
          <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-neutral-400">В эфире реплика #{activeSpeakerInfo.index + 1}:</span>
              <span className="font-extrabold text-emerald-400 whitespace-nowrap">{activeSpeakerInfo.segment.speakerName}</span>
            </div>
            
            <span className="text-[11px] font-mono font-medium text-neutral-500 hidden sm:inline-block max-w-[200px] truncate italic">
              "{activeSpeakerInfo.segment.text}"
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
