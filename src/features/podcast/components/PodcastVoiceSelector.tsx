import { useState, useRef, useEffect } from 'react';
import { PodcastVoice, VoiceSelection } from '../types/podcast.types';
import { Check, User, Sparkles, Play, Pause, Loader2, Headphones, Radio, Mic } from 'lucide-react';
import { useSettingsStore } from '@/src/stores/useSettingsStore';
import { toast } from 'sonner';

// Redefined structural preset options with specific, highly targeted characteristics
interface RedesignedPodcastVoice extends PodcastVoice {
  tags: string[];
  shortDesc: string;
}

const HOST_VOICES: RedesignedPodcastVoice[] = [
  { 
    id: 'pNInz6obpgdq5TaqLwtY', 
    name: 'Adam', 
    gender: 'male', 
    tags: ['Business', 'Premium', 'Deep'], 
    shortDesc: 'Размеренная, авторитетная речь для ведения бизнес-подкастов.',
    description: ''
  },
  { 
    id: 'TxGEqn7nUaNZTRmsh7M3', 
    name: 'Josh', 
    gender: 'male', 
    tags: ['Calm', 'Energetic', 'Friendly'], 
    shortDesc: 'Харизматичный собеседник со свободной, непринужденной подачей.',
    description: ''
  },
  { 
    id: '21m00Tcm4TlvDq8ikWAM', 
    name: 'Rachel', 
    gender: 'female', 
    tags: ['Calm', 'Premium', 'Expert'], 
    shortDesc: 'Эрудированный, доверительный женский тембр.',
    description: ''
  }
];

const GUEST_VOICES: RedesignedPodcastVoice[] = [
  { 
    id: 'ErXwobaYiN019PkySvjV', 
    name: 'Antoni', 
    gender: 'male', 
    tags: ['Storytelling', 'Deep', 'Friendly'], 
    shortDesc: 'Приятный обволакивающий голос мастера сторителлинга.',
    description: ''
  },
  { 
    id: 'AZnzlk1XvdvUeBnXmlld', 
    name: 'Domi', 
    gender: 'female', 
    tags: ['Expert', 'Calm'], 
    shortDesc: 'Сдержанный академический голос для глубоких интервью и разборов.',
    description: ''
  },
  { 
    id: 'EXAVITQu4vr4xnSDxMaL', 
    name: 'Bella', 
    gender: 'female', 
    tags: ['Friendly', 'Energetic'], 
    shortDesc: 'Мелодичный, позитивный, открытый к диалогу тембр.',
    description: ''
  }
];

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

  const playPreview = async (e: React.MouseEvent, voice: PodcastVoice) => {
    e.stopPropagation(); // Prevent card selection from firing

    if (currentPreviewVoiceId === voice.id) {
      stopCurrentPreview();
      return;
    }

    stopCurrentPreview();

    const sampleText = voice.gender === 'male'
      ? `Привет! Я с удовольствием озвучу ваш подкаст на русском языке. Как вам пример звучания?`
      : `Здравствуйте! Буду рада принять участие в записи вашего выпуска. Давайте создадим отличный диалог!`;

    // 1. Check if ElevenLabs key is present for premium synthesis
    if (elevenlabsKey) {
      setIsPreviewLoading(voice.id);
      
      // Use cached URL if exists
      if (previewUrls[voice.id]) {
        setIsPreviewLoading(null);
        setCurrentPreviewVoiceId(voice.id);
        const audio = new Audio(previewUrls[voice.id]);
        audioRef.current = audio;
        audio.onended = () => setCurrentPreviewVoiceId(null);
        audio.onerror = () => {
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
            voiceId: voice.id,
            apiKey: elevenlabsKey
          })
        });

        if (!response.ok) {
          throw new Error('Synthesis failed');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Cache the preview url
        setPreviewUrls(prev => ({ ...prev, [voice.id]: url }));
        setIsPreviewLoading(null);
        setCurrentPreviewVoiceId(voice.id);

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setCurrentPreviewVoiceId(null);
        audio.onerror = () => {
          toast.error('Ошибка воспроизведения превью');
          stopCurrentPreview();
        };
        audio.play();
      } catch (err) {
        console.error('[VOICE PREVIEW] ElevenLabs preview error:', err);
        setIsPreviewLoading(null);
        toast.warning('ElevenLabs превью недоступно. Используем системный синтезатор речи...');
        triggerSpeechSynthesis(sampleText, voice);
      }
    } else {
      // 2. Fallback to Browser native speech synthesis
      triggerSpeechSynthesis(sampleText, voice);
    }
  };

  const triggerSpeechSynthesis = (text: string, voice: PodcastVoice) => {
    if (!window.speechSynthesis) {
      toast.error('Ваш браузер не поддерживает синтез речи');
      return;
    }

    try {
      setCurrentPreviewVoiceId(voice.id);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      
      const voices = window.speechSynthesis.getVoices();
      const ruVoices = voices.filter(v => v.lang.startsWith('ru'));
      
      if (voice.gender === 'female') {
        const fVoice = ruVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google'));
        if (fVoice) utterance.voice = fVoice;
        utterance.pitch = 1.15;
        utterance.rate = 1.0;
      } else {
        const mVoice = ruVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('yuri'));
        if (mVoice) utterance.voice = mVoice;
        utterance.pitch = 0.9;
        utterance.rate = 1.05;
      }

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
    <div className="space-y-8 select-none">
      {/* Module Title Header Banner */}
      <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#10B981]/10 text-[#10B981] rounded-lg flex items-center justify-center">
            <Radio size={14} className="animate-pulse" />
          </div>
          <h3 className="text-xs font-black text-neutral-800 uppercase tracking-widest leading-none">
            АКТИВНЫЕ ГОЛОСА PODCAST STUDIO
          </h3>
        </div>
        <span className="text-[10px] text-neutral-400 font-bold tracking-wider">[ElevenLabs PRO]</span>
      </div>

      <div className="space-y-10">
        
        {/* ==================================== */}
        {/* STEP 1: HOST VOICE CONFIGURATION (EMERALD ACCENTS) */}
        {/* ==================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded-md">
                ШАГ 1
              </span>
              <label className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <Mic size={13} className="text-emerald-500" />
                Голос ведущего подкаста
              </label>
            </div>
            <span className="text-[10px] text-emerald-650 font-extrabold uppercase tracking-widest bg-emerald-100/40 px-2 py-0.5 rounded-full">
              Host Identity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HOST_VOICES.map((voice) => {
              const isSelected = selection.hostVoiceId === voice.id;
              const isPlaying = currentPreviewVoiceId === voice.id;
              const isLoading = isPreviewLoading === voice.id;

              return (
                <div
                  key={voice.id}
                  onClick={() => handleHostVoiceSelect(voice.id)}
                  className={`p-4 rounded-3xl border transition-all duration-300 cursor-pointer text-left flex flex-col justify-between relative group select-none min-h-[160px] ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg shadow-emerald-500/[0.04] scale-[1.01]'
                      : 'bg-white border-neutral-200 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Glowing active animation element inside active card */}
                  {isSelected && (
                    <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  )}

                  {/* Top content */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {voice.name[0]}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-sm text-neutral-900 leading-none">{voice.name}</span>
                          <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1 py-0.2 rounded font-bold uppercase tracking-widest scale-90">
                            {voice.gender === 'male' ? 'М' : 'Ж'}
                          </span>
                        </div>
                        {/* Selected label indicator */}
                        {isSelected && (
                          <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-widest mt-0.5 block">
                            ✓ Активный Ведущий
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-500 leading-normal min-h-[40px] lines-clamp-3">
                      {voice.shortDesc}
                    </p>
                  </div>

                  {/* Wave effect when playing inside card */}
                  {isPlaying && (
                    <div className="flex items-center gap-0.5 h-3 justify-start py-1">
                      <div className="w-1 bg-emerald-500 h-2 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="w-1 bg-emerald-500 h-3 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <div className="w-1 bg-emerald-500 h-1 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  )}

                  {/* Bottom footer bar with presets and floating button */}
                  <div className="mt-3.5 pt-3.5 border-t border-neutral-100/80 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                      {voice.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className={`text-[9px] rounded-md px-1.5 py-0.5 font-bold uppercase tracking-wider ${
                            isSelected 
                              ? 'bg-emerald-100/50 text-emerald-700' 
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Unified Floating Action Button (Fulfills Req 1, 5) */}
                    <button
                      type="button"
                      onClick={(e) => playPreview(e, voice)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0 border outline-none ${
                        isPlaying
                          ? 'bg-rose-100 border-rose-250 text-rose-600 hover:bg-rose-200'
                          : isSelected
                            ? 'bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-600'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600'
                      }`}
                      title={isPlaying ? 'Остановить воспроизведение' : 'Прослушать пример голоса'}
                    >
                      {isLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : isPlaying ? (
                        <Pause size={11} fill="currentColor" />
                      ) : (
                        <Play size={11} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================== */}
        {/* STEP 2: GUEST VOICE CONFIGURATION (PURPLE ACCENTS) */}
        {/* ==================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-purple-500 text-white font-extrabold px-1.5 py-0.5 rounded-md">
                ШАГ 2
              </span>
              <label className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <User size={13} className="text-purple-500" />
                Голос приглашенного гостя ({guestName})
              </label>
            </div>
            {guestEnabled && (
              <span className="text-[10px] text-purple-650 font-extrabold uppercase tracking-widest bg-purple-100/40 px-2 py-0.5 rounded-full">
                Guest Identity
              </span>
            )}
          </div>

          {guestEnabled ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {GUEST_VOICES.map((voice) => {
                const isSelected = selection.guestVoiceId === voice.id;
                const isPlaying = currentPreviewVoiceId === voice.id;
                const isLoading = isPreviewLoading === voice.id;

                return (
                  <div
                    key={voice.id}
                    onClick={() => handleGuestVoiceSelect(voice.id)}
                    className={`p-4 rounded-3xl border transition-all duration-300 cursor-pointer text-left flex flex-col justify-between relative group select-none min-h-[160px] ${
                      isSelected
                        ? 'bg-purple-50/50 border-purple-500 ring-4 ring-purple-500/10 shadow-lg shadow-purple-500/[0.04] scale-[1.01]'
                        : 'bg-white border-neutral-200 hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Glowing active animation element for active guest card */}
                    {isSelected && (
                      <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                      </span>
                    )}

                    {/* Top content */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-purple-500 text-white' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {voice.name[0]}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-sm text-neutral-900 leading-none">{voice.name}</span>
                            <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1 py-0.2 rounded font-bold uppercase tracking-widest scale-90">
                              {voice.gender === 'male' ? 'М' : 'Ж'}
                            </span>
                          </div>
                          {/* Selected label indicator */}
                          {isSelected && (
                            <span className="text-[9px] text-purple-600 font-extrabold uppercase tracking-widest mt-0.5 block">
                              ✓ Активный Гость
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-neutral-500 leading-normal min-h-[40px] lines-clamp-3">
                        {voice.shortDesc}
                      </p>
                    </div>

                    {/* Wave effect when playing inside card */}
                    {isPlaying && (
                      <div className="flex items-center gap-0.5 h-3 justify-start py-1">
                        <div className="w-1 bg-purple-500 h-2 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-1 bg-purple-500 h-3 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                        <div className="w-1 bg-purple-500 h-1 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                      </div>
                    )}

                    {/* Bottom footer bar with presets and floating button */}
                    <div className="mt-3.5 pt-3.5 border-t border-neutral-100/80 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                        {voice.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className={`text-[9px] rounded-md px-1.5 py-0.5 font-bold uppercase tracking-wider ${
                              isSelected 
                                ? 'bg-purple-100/50 text-purple-700' 
                                : 'bg-neutral-100 text-neutral-500'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Unified Floating Action Button */}
                      <button
                        type="button"
                        onClick={(e) => playPreview(e, voice)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0 border outline-none ${
                          isPlaying
                            ? 'bg-rose-100 border-rose-250 text-rose-600 hover:bg-rose-200'
                            : isSelected
                              ? 'bg-purple-500 border-purple-400 text-white hover:bg-purple-600'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600'
                        }`}
                        title={isPlaying ? 'Остановить воспроизведение' : 'Прослушать пример голоса'}
                      >
                        {isLoading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : isPlaying ? (
                          <Pause size={11} fill="currentColor" />
                        ) : (
                          <Play size={11} fill="currentColor" className="ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-neutral-200 rounded-[2rem] bg-neutral-50/50 text-center animate-pulse">
              <Headphones size={28} className="text-neutral-300 mb-2.5" />
              <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Гость не задействован в сценарии</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-[280px] leading-relaxed mx-auto">
                Оптимизирована озвучка для одиночного ведущего (Host Only). Сценарий будет озвучен целиком выбранным голосом Adam/Josh/Rachel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
