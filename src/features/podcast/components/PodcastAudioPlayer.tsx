import { useState, useEffect, useRef } from 'react';
import { ScriptSegment } from '../types/podcast.types';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Download, 
  FileText, 
  Disc,
  Clock,
  Music,
  Save,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { useFavoritesStore } from '@/src/stores/favoritesStore';

interface PodcastAudioPlayerProps {
  title: string;
  description: string;
  script: ScriptSegment[];
  synthesizedUrls: Record<string, string>;
  onSaveToFavorites: () => void;
}

export function PodcastAudioPlayer({ title, description, script, synthesizedUrls, onSaveToFavorites }: PodcastAudioPlayerProps) {
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalLoaded = Object.keys(synthesizedUrls).length;
  const isAllLoaded = totalLoaded >= script.length;

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  const stopAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAll(false);
    setCurrentIdx(null);
  };

  const playSegmentIndex = (index: number) => {
    if (index < 0 || index >= script.length) {
      stopAll();
      return;
    }

    const seg = script[index];
    const url = synthesizedUrls[seg.id];

    if (!url) {
      toast.warning(`Чтобы прослушать весь выпуск, сначала озвучьте реплику "${seg.speakerName}" ! Click play on it in the timeline below.`);
      setIsPlayingAll(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setCurrentIdx(index);

    audio.onended = () => {
      // Seq next
      playSegmentIndex(index + 1);
    };

    audio.onerror = () => {
      toast.error('Ошибка воспроизведения сегмента');
      stopAll();
    };

    audio.play();
  };

  const togglePlaybackAll = () => {
    if (isPlayingAll) {
      stopAll();
    } else {
      setIsPlayingAll(true);
      playSegmentIndex(0);
    }
  };

  const handleCopyText = () => {
    const textOutput = `=== СЦЕНАРИЙ: ${title} ===\n${description}\n\n` + 
      script.map(s => `[${s.speakerName}] (${s.durationSeconds}с): "${s.text}"`).join('\n\n');
    navigator.clipboard.writeText(textOutput);
    setCopied(true);
    toast.success('Текст всего подкаста скопирован!');
    setTimeout(() => setCopied(false), 2000);
  };

  const currentSegment = currentIdx !== null ? script[currentIdx] : null;

  return (
    <div className="bg-[#111827] text-white p-6 md:p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl relative overflow-hidden">
      {/* Wave animation in background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-end justify-center gap-1 p-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div 
            key={i} 
            className={`w-3 bg-[#10B981] rounded-t-full transition-all duration-300 ${
              isPlayingAll ? 'animate-bounce h-20' : 'h-3'
            }`} 
            style={{ 
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${0.6 + Math.random() * 1.5}s`
            }} 
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-left w-full md:w-auto">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center border border-emerald-500/20 shadow-inner ${
              isPlayingAll ? 'animate-spin duration-[10s]' : ''
            }`}>
              <Disc size={36} />
            </div>
            {isPlayingAll && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] bg-emerald-500/10 text-[#10B981] border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase font-black tracking-widest leading-none mb-1.5 inline-block">
              Интегрированный плеер
            </span>
            <h4 className="text-lg font-bold truncate tracking-tight">{title}</h4>
            <p className="text-xs text-neutral-400 truncate mt-1">{description}</p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={togglePlaybackAll}
            className="px-5 py-3 text-xs bg-[#10B981] hover:bg-emerald-600 font-bold rounded-2xl flex items-center gap-2 transition-all shrink-0 shadow-lg shadow-emerald-900/10"
          >
            {isPlayingAll ? (
              <>
                <Pause size={14} fill="currentColor" /> Pause Podcast
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" /> Play entire Podcast
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="p-3.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 rounded-xl transition-all"
            title="Копировать сценарий в буфер обмена"
          >
            {copied ? <Check size={14} /> : <FileText size={14} />}
          </button>

          <button
            type="button"
            onClick={() => {
              onSaveToFavorites();
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
            className="p-3.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 rounded-xl transition-all"
            title="Сохранить в избранное"
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
          </button>
        </div>
      </div>

      {isPlayingAll && currentSegment && (
        <div className="mt-5 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-center animate-pulse flex items-center justify-center gap-2 text-xs text-neutral-300">
          <Music size={12} className="text-[#10B981]" />
          <span>Сейчас играет {currentIdx! + 1}/{script.length}: <b>{currentSegment.speakerName}</b> - "{currentSegment.title}"</span>
        </div>
      )}
    </div>
  );
}
