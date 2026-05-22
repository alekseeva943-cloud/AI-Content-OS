import { useState, useRef, useEffect } from 'react';
import { PodcastVoice, VoiceSelection } from '../types/podcast.types';
import { Play, Pause, Loader2, Radio, Mic, User, Volume2 } from 'lucide-react';
import { useSettingsStore } from '@/src/stores/useSettingsStore';
import { CENTRAL_VOICES, HOST_VOICE_IDS, GUEST_VOICE_IDS } from '../constants/voices';
import { toast } from 'sonner';

interface PodcastVoiceSelectorProps {
  selection: VoiceSelection;
  onChange: (val: VoiceSelection) => void;
  guestEnabled: boolean;
  guestName?: string;
}

export function PodcastVoiceSelector({ selection, onChange, guestEnabled, guestName = 'Гость' }: PodcastVoiceSelectorProps) {
  const elevenlabsKey = useSettingsStore((state) => state.elevenlabsKey);
  
  // Local states for voice preview playback
  const [currentPreviewVoiceId, setCurrentPreviewVoiceId] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      stopCurrentPreview();
    };
  }, []);

  const handleHostVoiceSelect = (voiceId: string) => {
    onChange({ ...selection, hostVoiceId: voiceId });
  };

  const handleGuestVoiceSelect = (voiceId: string) => {
    onChange({ ...selection, guestVoiceId: voiceId });
  };

  const stopCurrentPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCurrentPreviewVoiceId(null);
    setIsPreviewLoading(null);
  };

  const playPreview = async (e: React.MouseEvent, voiceId: string, voiceGender: 'male' | 'female', voiceName: string) => {
    e.stopPropagation(); // Prevent select click on the card

    if (currentPreviewVoiceId === voiceId) {
      stopCurrentPreview();
      return;
    }

    stopCurrentPreview();

    const sampleText = voiceGender === 'male'
      ? `Привет! Я с удовольствием озвучу ваш подкаст на русском языке. Как вам пример звучания?`
      : `Здравствуйте! Буду рада принять участие в записи вашего выпуска. Давайте создадим отличный диалог!`;

    console.log(`[VOICE PREVIEW] Play preview triggered for voiceId=${voiceId} (${voiceName})`);

    // 1. Check if ElevenLabs key is present for premium synthesis
    if (elevenlabsKey) {
      setIsPreviewLoading(voiceId);
      
      // Use cached URL if exists
      if (previewUrls[voiceId]) {
        setIsPreviewLoading(null);
        setCurrentPreviewVoiceId(voiceId);
        const audio = new Audio(previewUrls[voiceId]);
        audioRef.current = audio;
        audio.onended = () => setCurrentPreviewVoiceId(null);
        audio.onerror = (err) => {
          console.error('[VOICE PREVIEW API ERROR]', err);
          toast.error('Ошибка воспроизведения превью');
          stopCurrentPreview();
        };
        audio.play();
        return;
      }

      try {
        const response = await fetch('/api/podcast/synthesize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: sampleText,
            voiceId: voiceId,
            apiKey: elevenlabsKey
          })
        });

        if (!response.ok) {
          throw new Error('Synthesis failed');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Cache the preview url
        setPreviewUrls(prev => ({ ...prev, [voiceId]: url }));
        setIsPreviewLoading(null);
        setCurrentPreviewVoiceId(voiceId);

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setCurrentPreviewVoiceId(null);
        audio.onerror = () => {
          toast.error('Ошибка воспроизведения превью');
          stopCurrentPreview();
        };
        audio.play();
      } catch (err) {
        console.error('[VOICE PREVIEW] ElevenLabs preview error, falling back to WebTTS:', err);
        setIsPreviewLoading(null);
        toast.warning('ElevenLabs превью недоступно. Используем системный синтезатор речи...');
        triggerSpeechSynthesis(sampleText, voiceId);
      }
    } else {
      // 2. Fallback to Browser native speech synthesis
      triggerSpeechSynthesis(sampleText, voiceId);
    }
  };

  const triggerSpeechSynthesis = (text: string, voiceId: string) => {
    if (!window.speechSynthesis) {
      toast.error('Ваш браузер не поддерживает синтез речи');
      return;
    }

    try {
      setCurrentPreviewVoiceId(voiceId);
      const voiceInfo = CENTRAL_VOICES[voiceId] || CENTRAL_VOICES['pNInz6obpgdq5TaqLwtY'];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      
      const voices = window.speechSynthesis.getVoices();
      const ruVoices = voices.filter(v => v.lang.startsWith('ru') || v.lang.startsWith('ru-RU'));
      
      const isFemale = voiceInfo?.gender === 'female';
      if (isFemale) {
        const fVoice = ruVoices.find(v => 
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('google') || 
          v.name.toLowerCase().includes('milena') || 
          v.name.toLowerCase().includes('irina')
        );
        if (fVoice) utterance.voice = fVoice;
      } else {
        const mVoice = ruVoices.find(v => 
          v.name.toLowerCase().includes('male') || 
          v.name.toLowerCase().includes('yuri') || 
          v.name.toLowerCase().includes('microsoft') || 
          v.name.toLowerCase().includes('pavel') || 
          v.name.toLowerCase().includes('alexander')
        );
        if (mVoice) utterance.voice = mVoice;
      }

      utterance.pitch = voiceInfo?.fallbackPitch ?? 1.0;
      utterance.rate = voiceInfo?.fallbackRate ?? 1.0;

      utterance.onend = () => setCurrentPreviewVoiceId(null);
      utterance.onerror = () => setCurrentPreviewVoiceId(null);
      
      synthUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
      setCurrentPreviewVoiceId(null);
    }
  };

  return (
    <div className="space-y-6 select-none text-left">
      {/* Module Title Header Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#10B981]/10 text-[#10B981] rounded-lg flex items-center justify-center shrink-0">
            <Radio size={14} className="animate-pulse" />
          </div>
          <h3 className="text-xs font-black text-neutral-800 uppercase tracking-widest leading-none">
            Голосовая Студия
          </h3>
        </div>
        <span className="text-[10px] text-neutral-400 font-bold tracking-wider">[ElevenLabs API]</span>
      </div>

      <div className="space-y-6">
        
        {/* ==================================== */}
        {/* HOST VOICE CONFIGURATION (EMERALD ACCENTS) */}
        {/* ==================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1.5 leading-none">
              <Mic size={13} className="text-[#10B981]" />
              Ведущий подкаста
            </label>
            <span className="text-[9px] text-[#10B981] font-black uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
              Host
            </span>
          </div>

          <div className="space-y-2">
            {HOST_VOICE_IDS.map((id) => {
              const voice = CENTRAL_VOICES[id];
              const isSelected = selection.hostVoiceId === id;
              const isPlaying = currentPreviewVoiceId === id;
              const isLoading = isPreviewLoading === id;

              return (
                <div
                  key={id}
                  onClick={() => handleHostVoiceSelect(id)}
                  className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 relative select-none ${
                    isSelected
                      ? 'bg-emerald-50/40 border-[#10B981] ring-2 ring-emerald-500/10 shadow-sm shadow-emerald-500/[0.02]'
                      : 'bg-white border-neutral-150 hover:border-emerald-255 hover:-translate-y-0.2 hover:shadow-sm'
                  }`}
                >
                  {/* Avatar, name and tag info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 relative transition-all ${
                      isSelected 
                        ? 'bg-[#10B981] text-white shadow-sm shadow-emerald-500/20' 
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {voice.name[0]}
                      {isPlaying && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center border-2 border-white scale-90">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative w-1.5 h-1.5 rounded-full bg-white"></span>
                        </span>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-neutral-850 leading-tight">{voice.name}</span>
                        <span className="text-[8px] bg-neutral-100 font-bold text-neutral-500 px-1 py-0.3 rounded scale-90">
                          {voice.gender === 'male' ? 'М' : 'Ж'}
                        </span>
                        {/* Selected Indicator */}
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        )}
                      </div>
                      
                      {/* Compact tag and desc line */}
                      <p className="text-[11px] text-neutral-400 font-medium truncate mt-0.5">
                        <span className="text-[#10B981] font-bold mr-1">{voice.tags[0]}</span> • {voice.shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* Unified play preview trigger on the right */}
                  <button
                    type="button"
                    onClick={(e) => playPreview(e, id, voice.gender, voice.name)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all shrink-0 outline-none ${
                      isPlaying
                        ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                        : isSelected
                          ? 'bg-emerald-100/50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                    }`}
                    title={isPlaying ? 'Остановить' : 'Прослушать голос'}
                  >
                    {isLoading ? (
                      <Loader2 size={13} className="animate-spin text-[#10B981]" />
                    ) : isPlaying ? (
                      <Pause size={11} fill="currentColor" />
                    ) : (
                      <Play size={11} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================== */}
        {/* GUEST VOICE CONFIGURATION (VIOLET ACCENTS) */}
        {/* ==================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1.5 leading-none">
              <User size={13} className="text-violet-500" />
              Гость подкаста ({guestName})
            </label>
            {guestEnabled && (
              <span className="text-[9px] text-violet-600 font-black uppercase tracking-wider bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100/50">
                Guest
              </span>
            )}
          </div>

          {guestEnabled ? (
            <div className="space-y-2">
              {GUEST_VOICE_IDS.map((id) => {
                const voice = CENTRAL_VOICES[id];
                const isSelected = selection.guestVoiceId === id;
                const isPlaying = currentPreviewVoiceId === id;
                const isLoading = isPreviewLoading === id;

                return (
                  <div
                    key={id}
                    onClick={() => handleGuestVoiceSelect(id)}
                    className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 relative select-none ${
                      isSelected
                        ? 'bg-violet-50/40 border-violet-500 ring-2 ring-violet-500/10 shadow-sm shadow-violet-500/[0.02]'
                        : 'bg-white border-neutral-150 hover:border-violet-250 hover:-translate-y-0.2 hover:shadow-sm'
                    }`}
                  >
                    {/* Avatar, name and tag info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 relative transition-all ${
                        isSelected 
                          ? 'bg-violet-500 text-white shadow-sm shadow-violet-500/20' 
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {voice.name[0]}
                        {isPlaying && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center border-2 border-white scale-90">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative w-1.5 h-1.5 rounded-full bg-white"></span>
                          </span>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-neutral-850 leading-tight">{voice.name}</span>
                          <span className="text-[8px] bg-neutral-100 font-bold text-neutral-500 px-1 py-0.3 rounded scale-90">
                            {voice.gender === 'male' ? 'М' : 'Ж'}
                          </span>
                          {/* Selected Indicator */}
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                          )}
                        </div>
                        
                        {/* Compact tag and desc line */}
                        <p className="text-[11px] text-neutral-400 font-medium truncate mt-0.5">
                          <span className="text-violet-500 font-bold mr-1">{voice.tags[0]}</span> • {voice.shortDesc}
                        </p>
                      </div>
                    </div>

                    {/* Unified play preview trigger on the right */}
                    <button
                      type="button"
                      onClick={(e) => playPreview(e, id, voice.gender, voice.name)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all shrink-0 outline-none ${
                        isPlaying
                          ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                          : isSelected
                            ? 'bg-violet-100/50 border-violet-200 text-violet-850 hover:bg-violet-100'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                      }`}
                      title={isPlaying ? 'Остановить' : 'Прослушать голос'}
                    >
                      {isLoading ? (
                        <Loader2 size={13} className="animate-spin text-violet-500" />
                      ) : isPlaying ? (
                        <Pause size={11} fill="currentColor" />
                      ) : (
                        <Play size={11} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-5 border border-dashed border-neutral-200 rounded-2xl bg-neutral-55/35 text-center">
              <span className="text-[10px] uppercase font-black text-neutral-400 tracking-wider">Одиночное Вещание</span>
              <p className="text-[11px] text-neutral-400 mt-1 leading-normal max-w-[220px]">
                Вся дорожка озвучивается выбранным ведущим.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
