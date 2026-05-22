import { useState, useMemo, useEffect } from 'react';
import { PodcastResult, VoiceSelection } from '../types/podcast.types';
import { PodcastAudioPlayer } from './PodcastAudioPlayer';
import { PodcastVoiceSelector, VoiceAudioSettings } from './PodcastVoiceSelector';
import { PodcastTimeline } from './PodcastTimeline';
import { usePodcastAudio } from '../hooks/usePodcastAudio';
import { HUMAN_VOICE_LIBRARY } from '../constants/voices';
import { ArrowLeft, Bookmark, Settings, Terminal, Radio, ShieldCheck, Database, Zap } from 'lucide-react';
import { useFavoritesStore } from '@/src/stores/favoritesStore';
import { Button } from '@/src/shared/components/UI';
import { toast } from 'sonner';

interface PodcastPreviewProps {
  result: PodcastResult;
  onBack: () => void;
  guestEnabled: boolean;
}

export function PodcastPreview({ result, onBack, guestEnabled }: PodcastPreviewProps) {
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  
  // 1. Voice configurations basic state
  const [voiceSelection, setVoiceSelection] = useState<VoiceSelection>({
    hostVoiceId: 'pNInz6obpgdq5TaqLwtY', // Adam
    guestVoiceId: 'ErXwobaYiN019PkySvjV', // Antoni
  });

  // 8. Individual independent voice settings for presenter and guest (completely decoupled!)
  const [hostSettings, setHostSettings] = useState<VoiceAudioSettings>({
    stability: 45,
    similarity_boost: 78,
    style: 55,
    energy: 45,
    speed: 1.0,
    use_speaker_boost: true,
    modelId: 'eleven_multilingual_v2'
  });

  const [guestSettings, setGuestSettings] = useState<VoiceAudioSettings>({
    stability: 28,
    similarity_boost: 75,
    style: 80,
    energy: 65,
    speed: 0.85,
    use_speaker_boost: true,
    modelId: 'eleven_multilingual_v2'
  });

  // Live Sync Sliders when voice is switched to human presets
  useEffect(() => {
    const defaultVal = HUMAN_VOICE_LIBRARY[voiceSelection.hostVoiceId];
    if (defaultVal) {
      setHostSettings({
        stability: Math.round(defaultVal.settings.stability * 100),
        similarity_boost: Math.round(defaultVal.settings.similarity_boost * 100),
        style: Math.round(defaultVal.settings.style * 100),
        energy: defaultVal.name === 'Josh' ? 82 : defaultVal.name === 'Rachel' ? 50 : defaultVal.name === 'Bella' ? 85 : 45,
        speed: defaultVal.fallbackRate,
        use_speaker_boost: defaultVal.settings.use_speaker_boost,
        modelId: 'eleven_multilingual_v2'
      });
    }
  }, [voiceSelection.hostVoiceId]);

  useEffect(() => {
    if (voiceSelection.guestVoiceId) {
      const defaultVal = HUMAN_VOICE_LIBRARY[voiceSelection.guestVoiceId];
      if (defaultVal) {
        setGuestSettings({
          stability: Math.round(defaultVal.settings.stability * 100),
          similarity_boost: Math.round(defaultVal.settings.similarity_boost * 100),
          style: Math.round(defaultVal.settings.style * 100),
          energy: defaultVal.name === 'Grace' ? 85 : defaultVal.name === 'Domi' ? 35 : defaultVal.name === 'Bella' ? 90 : 65,
          speed: defaultVal.fallbackRate,
          use_speaker_boost: defaultVal.settings.use_speaker_boost,
          modelId: 'eleven_multilingual_v2'
        });
      }
    }
  }, [voiceSelection.guestVoiceId]);

  // Logging side-effects for realtime console audit trail as requested by Requirement 3
  useEffect(() => {
    const voiceName = HUMAN_VOICE_LIBRARY[voiceSelection.hostVoiceId]?.name || 'Unknown';
    console.log(`
[VOICE SETTINGS UPDATED]
voice=${voiceName} (Host)
stability=${hostSettings.stability / 100}
similarity=${hostSettings.similarity_boost / 100}
style=${hostSettings.style / 100}
energy=${hostSettings.energy}%
speed=${hostSettings.speed}

[VOICE CACHE INVALIDATED]
Active segments will be re-rendered and synthesized live with these settings on next play command.
    `);
  }, [hostSettings, voiceSelection.hostVoiceId]);

  useEffect(() => {
    if (!guestEnabled || !voiceSelection.guestVoiceId) return;
    const voiceName = HUMAN_VOICE_LIBRARY[voiceSelection.guestVoiceId]?.name || 'Unknown';
    console.log(`
[VOICE SETTINGS UPDATED]
voice=${voiceName} (Guest)
stability=${guestSettings.stability / 100}
similarity=${guestSettings.similarity_boost / 100}
style=${guestSettings.style / 100}
energy=${guestSettings.energy}%
speed=${guestSettings.speed}

[VOICE CACHE INVALIDATED]
Active segments will be re-rendered and synthesized live with these settings on next play command.
    `);
  }, [guestSettings, voiceSelection.guestVoiceId, guestEnabled]);

  // Inject voice settings to hook
  const {
    audioCache,
    synthesizingId,
    playingId,
    lastSynthesisDiagnostic,
    togglePlaySegment,
    downloadSegmentMp3,
    stopCurrentAudio,
    
    // Full Episode Support
    isSynthesizingFull,
    fullProgress,
    fullEpisodeUrl,
    synthesizeAndMergeFullEpisode,
    downloadFullEpisode
  } = usePodcastAudio(voiceSelection, hostSettings, guestSettings);

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
        mode: guestEnabled ? 'dialogue' : 'solo',
        hostVoice: HUMAN_VOICE_LIBRARY[voiceSelection.hostVoiceId]?.name,
        guestVoice: guestEnabled ? HUMAN_VOICE_LIBRARY[voiceSelection.guestVoiceId || '']?.name : 'none'
      }
    });
    toast.success('Сценарий и конфигурация сохранены в Избранное');
  };

  // Compute active synthesized URLs based on CURRENT voice selections dynamically (matching detailed slider keys)
  const currentSynthesizedUrls = useMemo(() => {
    const urls: Record<string, string> = {};
    result.script.forEach((segment) => {
      const isHost = segment.speaker === 'host';
      const voiceId = isHost ? voiceSelection.hostVoiceId : (voiceSelection.guestVoiceId || 'pNInz6obpgdq5TaqLwtY');
      const activeSettings = isHost ? hostSettings : guestSettings;
      
      const cacheKey = `${segment.id}_${voiceId}_st${activeSettings.stability}_sm${activeSettings.similarity_boost}_sy${activeSettings.style}_en${activeSettings.energy}_sp${activeSettings.speed.toFixed(2)}_sb${activeSettings.use_speaker_boost ? 1 : 0}_${activeSettings.modelId}`;
      if (audioCache[cacheKey]) {
        urls[segment.id] = audioCache[cacheKey].url;
      }
    });
    return urls;
  }, [audioCache, result.script, voiceSelection, hostSettings, guestSettings]);

  const totalLoaded = Object.keys(currentSynthesizedUrls).length;
  const isAllSynthesized = totalLoaded >= result.script.length;

  // Active voice diagnostics panel values
  const currentActiveSpeaker = useMemo(() => {
    if (playingId) {
      const seg = result.script.find(s => s.id === playingId);
      return seg ? { name: seg.speakerName, speaker: seg.speaker } : null;
    }
    if (synthesizingId) {
      const seg = result.script.find(s => s.id === synthesizingId);
      return seg ? { name: seg.speakerName, speaker: seg.speaker } : null;
    }
    return null;
  }, [playingId, synthesizingId, result.script]);

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
              hostSettings={hostSettings}
              guestSettings={guestSettings}
              onHostSettingsChange={setHostSettings}
              onGuestSettingsChange={setGuestSettings}
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
                <span>Озвучено сегментов:</span>
                <span className="font-bold text-[#10B981]">{totalLoaded} / {result.script.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Режим подкаста:</span>
                <span className="font-bold text-indigo-600 uppercase tracking-wider text-[10px]">
                  {guestEnabled ? 'Собеседование (С гостем)' : 'Монолог ведущего'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 leading-normal border-t border-neutral-200 pt-3">
              💡 Вы можете настраивать тон ведущего и гостя независимо. Изменение слайдеров сразу учитывается при озвучивании новых реплик или скачивании полной версии.
            </p>
          </div>

          {/* ==================================== */}
          {/* LIVE VOICE DIAGNOSTICS CONSOLE (Requirement 9 & 10) */}
          {/* ==================================== */}
          <div className="bg-[#0f1115] border border-neutral-800 p-6 rounded-[2.5rem] space-y-4 text-left shadow-xl">
            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <Terminal size={13} className="animate-pulse" />
              VOICE ENGINE LIVE CONSOLE
            </h4>
            
            <div className="space-y-3 font-mono text-[10px] text-neutral-400">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span>ACTIVE PROVIDER:</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">elevenlabs.io</span>
              </div>

              {/* Host Quick Metadata */}
              <div className="space-y-1">
                <span className="text-neutral-500 font-bold uppercase block">[HOST VOICE ENGINE]</span>
                <div className="pl-2 space-y-0.5 border-l border-emerald-500/20">
                  <div className="flex justify-between">
                    <span>NAME/ID:</span>
                    <span className="text-emerald-300 font-bold">
                      {HUMAN_VOICE_LIBRARY[voiceSelection.hostVoiceId]?.name} ({voiceSelection.hostVoiceId.slice(0, 5)}...)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>MODEL:</span>
                    <span className="text-neutral-300 truncate max-w-[130px]">{hostSettings.modelId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>STAB/WARMTH/STYLE:</span>
                    <span className="text-neutral-300">{hostSettings.stability}% / {hostSettings.similarity_boost}% / {hostSettings.style}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SPEED/SPK BOOST:</span>
                    <span className="text-neutral-300">{hostSettings.speed}x / {hostSettings.use_speaker_boost ? 'ON' : 'OFF'}</span>
                  </div>
                </div>
              </div>

              {/* Guest Quick Metadata */}
              {guestEnabled && voiceSelection.guestVoiceId && (
                <div className="space-y-1 pt-1">
                  <span className="text-neutral-500 font-bold uppercase block">[GUEST VOICE ENGINE]</span>
                  <div className="pl-2 space-y-0.5 border-l border-violet-500/20">
                    <div className="flex justify-between">
                      <span>NAME/ID:</span>
                      <span className="text-violet-300 font-bold">
                        {HUMAN_VOICE_LIBRARY[voiceSelection.guestVoiceId]?.name} ({voiceSelection.guestVoiceId.slice(0, 5)}...)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>MODEL:</span>
                      <span className="text-neutral-300 truncate max-w-[130px]">{guestSettings.modelId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>STAB/WARMTH/STYLE:</span>
                      <span className="text-neutral-300">{guestSettings.stability}% / {guestSettings.similarity_boost}% / {guestSettings.style}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SPEED/SPK BOOST:</span>
                      <span className="text-neutral-300">{guestSettings.speed}x / {guestSettings.use_speaker_boost ? 'ON' : 'OFF'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================== */}
              {/* REALTIME TRANSACTION DIAGNOSTICS   */}
              {/* ================================== */}
              {lastSynthesisDiagnostic ? (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-400 font-bold uppercase">[LAST CALL TELEMETRY]</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      lastSynthesisDiagnostic.cacheHit 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/20 text-amber-300 animate-pulse'
                    }`}>
                      {lastSynthesisDiagnostic.cacheHit ? 'CACHE HIT (0ms)' : 'CACHE MISS'}
                    </span>
                  </div>

                  <div className="pl-2 space-y-0.5 border-l border-amber-500/40 text-[9.5px]">
                    <div className="flex justify-between">
                      <span>TARGET VOICE ID:</span>
                      <span className="text-neutral-200">{lastSynthesisDiagnostic.voiceId} ({lastSynthesisDiagnostic.voiceName})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MODEL EMPLOYED:</span>
                      <span className="text-neutral-200">{lastSynthesisDiagnostic.modelId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>STAB/WARM/ENERGY:</span>
                      <span className="text-neutral-200">
                        {lastSynthesisDiagnostic.stability}% / {lastSynthesisDiagnostic.similarity_boost}% / {lastSynthesisDiagnostic.energy}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>SYNTH DURATION:</span>
                      <span className="text-emerald-400 font-extrabold">
                        {lastSynthesisDiagnostic.cacheHit ? '0 ms' : `${(lastSynthesisDiagnostic.durationMs / 1000).toFixed(2)}s (${lastSynthesisDiagnostic.durationMs}ms)`}
                      </span>
                    </div>
                    
                    {/* Active Rhythm Profile Metrics */}
                    <div className="pt-1.5 border-t border-neutral-800/60 mt-1 space-y-0.5">
                      <span className="text-neutral-500 font-bold uppercase block text-[8px]">[ACTIVE RHYTHM PROFILE]</span>
                      <div className="flex justify-between">
                        <span>ENERGY CURVE:</span>
                        <span className="text-neutral-300 uppercase">{lastSynthesisDiagnostic.energy_curve}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PUNCTUATION OPT:</span>
                        <span className="text-neutral-300 uppercase">{lastSynthesisDiagnostic.punctuation_behavior}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PAUSE DENSITY:</span>
                        <span className="text-neutral-300 uppercase">{lastSynthesisDiagnostic.pause_density}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>EMOTIONALITY / tempo:</span>
                        <span className="text-[#10B981] font-bold">{lastSynthesisDiagnostic.emotionality}% / {lastSynthesisDiagnostic.cadence}</span>
                      </div>
                    </div>

                    {/* Collapsible raw json payload */}
                    <div className="pt-2">
                      <details className="group cursor-pointer">
                        <summary className="text-[8.5px] font-black text-neutral-500 uppercase flex items-center gap-1 hover:text-neutral-300 transition-colors">
                          <span>[+] VIEW RAW ELEVENLABS PAYLOAD</span>
                        </summary>
                        <div className="mt-2 p-3 rounded-lg bg-black border border-neutral-950 font-mono text-[9px] text-emerald-400 overflow-x-auto select-text leading-tight max-h-[160px] scrollbar-thin">
                          {JSON.stringify(lastSynthesisDiagnostic.rawPayload, null, 2)}
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 pt-1.5 border-t border-neutral-800">
                  <span className="text-neutral-500 font-bold uppercase block">[CACHE ENG STATUS]</span>
                  <div className="pl-2 space-y-0.5 border-l border-[#10B981]">
                    <div className="flex justify-between">
                      <span>CACHE HIT RATIO:</span>
                      <span className="text-emerald-400 font-bold">
                        {result.script.length > 0 ? `${Math.round((totalLoaded / result.script.length) * 100)}%` : '0%'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>ACTIVE TRACK:</span>
                      <span className="text-amber-400 truncate max-w-[150px] font-bold">
                        {currentActiveSpeaker ? `[${currentActiveSpeaker.speaker.toUpperCase()}] ${currentActiveSpeaker.name}` : 'IDLE'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right pane: Script Timeline */}
        <div className="lg:col-span-2 space-y-6 bg-white border border-neutral-200 p-6 md:p-8 rounded-[2.5rem] shadow-sm text-left">
          <PodcastTimeline
            script={result.script}
            voiceSelection={voiceSelection}
            playingId={playingId}
            synthesizedUrls={currentSynthesizedUrls}
            synthesizingId={synthesizingId}
            onTogglePlay={(id, text, voiceId) => {
              const seg = result.script.find(s => s.id === id);
              togglePlaySegment(id, text, voiceId, seg?.speaker);
            }}
            onDownloadMp3={(id, text, voiceId, title) => {
              const seg = result.script.find(s => s.id === id);
              downloadSegmentMp3(id, text, voiceId, title, seg?.speaker);
            }}
          />
        </div>

      </div>
    </div>
  );
}
