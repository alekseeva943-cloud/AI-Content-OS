import { useState, useMemo } from 'react';
import { PodcastResult, VoiceSelection } from '../types/podcast.types';
import { PodcastAudioPlayer } from './PodcastAudioPlayer';
import { PodcastVoiceSelector } from './PodcastVoiceSelector';
import { PodcastTimeline } from './PodcastTimeline';
import { usePodcastAudio } from '../hooks/usePodcastAudio';
import { ArrowLeft, RefreshCw, Sparkles, Check, Bookmark, Mic, Settings } from 'lucide-react';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { useFavoritesStore } from '@/src/stores/favoritesStore';
import { toast } from 'sonner';

interface PodcastPreviewProps {
  result: PodcastResult;
  onBack: () => void;
  guestEnabled: boolean;
}

export function PodcastPreview({ result, onBack, guestEnabled }: PodcastPreviewProps) {
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  
  // Voice configurations state
  const [voiceSelection, setVoiceSelection] = useState<VoiceSelection>({
    hostVoiceId: 'pNInz6obpgdq5TaqLwtY', // Adam
    guestVoiceId: 'ErXwobaYiN019PkySvjV', // Antoni
  });

  const {
    audioCache,
    synthesizingId,
    playingId,
    togglePlaySegment,
    downloadSegmentMp3,
    stopCurrentAudio,
    
    // Full Episode Support
    isSynthesizingFull,
    fullProgress,
    fullEpisodeUrl,
    synthesizeAndMergeFullEpisode,
    downloadFullEpisode
  } = usePodcastAudio();

  const handleSaveToFavorites = () => {
    addFavorite({
      id: `podcast-studio-${Date.now()}`,
      moduleId: 'podcasts',
      type: 'result',
      title: result.title || result.topic,
      content: result,
      metadata: {
        generatedAt: new Date().toISOString(),
        durationMinutes: result.durationMinutes,
        mode: guestEnabled ? 'dialogue' : 'solo'
      }
    });
    toast.success('Сценарий и конфигурация сохранены в Избранное');
  };

  // Compute active synthesized URLs based on CURRENT voice selections dynamically (fixing global voice selection synchronization)
  const currentSynthesizedUrls = useMemo(() => {
    const urls: Record<string, string> = {};
    result.script.forEach((segment) => {
      const isHost = segment.speaker === 'host';
      const voiceId = isHost ? voiceSelection.hostVoiceId : (voiceSelection.guestVoiceId || 'pNInz6obpgdq5TaqLwtY');
      const cacheKey = `${segment.id}_${voiceId}_1.0_neutral`;
      if (audioCache[cacheKey]) {
        urls[segment.id] = audioCache[cacheKey].url;
      }
    });
    return urls;
  }, [audioCache, result.script, voiceSelection]);

  const totalLoaded = Object.keys(currentSynthesizedUrls).length;
  const isAllSynthesized = totalLoaded >= result.script.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      {/* Header actions bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            stopCurrentAudio();
            onBack();
          }}
          className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-800 transition-all font-display"
        >
          <ArrowLeft size={16} />
          Вернуться к настройкам
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToFavorites}
            className="rounded-xl border-neutral-200 gap-1.5 text-xs text-neutral-700"
          >
            <Bookmark size={14} />
            Запомнить выпуск
          </Button>
        </div>
      </div>

      {/* Dynamic Player Banner Widget */}
      <PodcastAudioPlayer
        title={result.title}
        description={result.description}
        script={result.script}
        synthesizedUrls={currentSynthesizedUrls}
        onSaveToFavorites={handleSaveToFavorites}
        voiceSelection={voiceSelection}
        // Expose deep compiler controls safely
        isSynthesizingFull={isSynthesizingFull}
        fullProgress={fullProgress}
        fullEpisodeUrl={fullEpisodeUrl}
        onSynthesizeFull={() => synthesizeAndMergeFullEpisode(result.script, voiceSelection)}
        onDownloadFull={() => downloadFullEpisode(`${result.title.replace(/\s+/g, '_')}_episode.mp3`)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left pane: Voice configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-neutral-200 p-6 rounded-[2.5rem] shadow-sm">
            <PodcastVoiceSelector
              selection={voiceSelection}
              onChange={setVoiceSelection}
              guestEnabled={guestEnabled}
              guestName={result.guestConfig?.name}
            />
          </div>

          {/* Quick info panel */}
          <div className="bg-neutral-50 border border-neutral-150 p-6 rounded-[2.5rem] space-y-4">
            <h4 className="text-xs font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
              <Settings size={13} className="text-[#10B981]" />
              Статистика синтеза
            </h4>
            <div className="space-y-2.5 text-xs text-neutral-600 font-medium">
              <div className="flex justify-between">
                <span>Общая глубина:</span>
                <span className="font-bold text-neutral-800">{result.script.length} реплик(и)</span>
              </div>
              <div className="flex justify-between">
                <span>Озвучено сегментов (активный голос):</span>
                <span className="font-bold text-[#10B981]">{totalLoaded} / {result.script.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Режим подкаста:</span>
                <span className="font-bold text-indigo-600 uppercase tracking-wider text-[10px]">
                  {guestEnabled ? 'Собеседование (С гостем)' : 'Монолог ведущего'}
                </span>
              </div>
            </div>

            {/* Hint Box */}
            <p className="text-[11px] text-neutral-400 leading-normal border-t border-neutral-200 pt-3">
              💡 Вы можете переключать голоса ведущего и гостя на лету. Озвученные реплики кэшируются автоматически, чтобы повторно не расходовать кредиты ElevenLabs.
            </p>
          </div>
        </div>

        {/* Right pane: Script Timeline */}
        <div className="lg:col-span-2 space-y-6 bg-white border border-neutral-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm">
          <PodcastTimeline
            script={result.script}
            voiceSelection={voiceSelection}
            playingId={playingId}
            synthesizedUrls={currentSynthesizedUrls}
            synthesizingId={synthesizingId}
            onTogglePlay={togglePlaySegment}
            onDownloadMp3={downloadSegmentMp3}
          />
        </div>
      </div>
    </div>
  );
}
