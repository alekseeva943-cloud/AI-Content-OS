import { useState, useRef, useEffect } from 'react';
import { PodcastVoice, VoiceSelection } from '../types/podcast.types';
import { Volume2, Check, User, Sparkles, Play, Pause, Loader2 } from 'lucide-react';
import { useSettingsStore } from '@/src/stores/useSettingsStore';
import { toast } from 'sonner';

const HOST_VOICES: PodcastVoice[] = [
  { id: 'pNInz6obpgdq5TaqLwtY', name: 'Adam', gender: 'male', description: 'Глубокий, профессиональный и размеренный экспертный голос (Бизнес)' },
  { id: 'TxGEqn7nUaNZTRmsh7M3', name: 'Josh', gender: 'male', description: 'Энергичный, живой, позитивный подкаст-стиль общения' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female', description: 'Приятный, доверительный, экспертный женский голос' }
];

const GUEST_VOICES: PodcastVoice[] = [
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'male', description: 'Теплый, интригующий и повествовательный рассказчик' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'female', description: 'Мягкий, обволакивающий, спокойный голос' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female', description: 'Естественный, вовлеченный и общительный тембр' }
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
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-100">
        <Sparkles size={16} className="text-[#10B981]" />
        <h3 className="text-xs font-black text-neutral-800 uppercase tracking-widest leading-none">
          Голоса подкаста (ElevenLabs)
        </h3>
      </div>

      <div className="space-y-8">
        {/* Host Section */}
        <div className="space-y-3.5">
          <label className="text-[11px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
            <User size={13} className="text-[#10B981]" />
            Ведущий подкаста (Host)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
            {HOST_VOICES.map((voice) => {
              const isSelected = selection.hostVoiceId === voice.id;
              const isPlaying = currentPreviewVoiceId === voice.id;
              const isLoading = isPreviewLoading === voice.id;

              return (
                <div
                  key={voice.id}
                  onClick={() => handleHostVoiceSelect(voice.id)}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer text-left flex items-start gap-3.5 group relative select-none ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500/20 shadow-md shadow-emerald-500/[0.04]'
                      : 'bg-white border-neutral-250 hover:border-neutral-350 hover:shadow-sm hover:-translate-y-0.5'
                  }`}
                >
                  {/* Left avatar badge */}
                  <div className={`p-2.5 rounded-xl shrink-0 transition-colors self-center ${
                    isSelected 
                      ? 'bg-emerald-500/10 text-emerald-600' 
                      : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200'
                  }`}>
                    <Volume2 size={16} />
                  </div>

                  {/* Middle content / Text info */}
                  <div className="flex-1 min-w-0 pr-10">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm text-neutral-800">{voice.name}</span>
                      <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        {voice.gender === 'male' ? 'Муж' : 'Жен'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1 lines-clamp-2 leading-relaxed">
                      {voice.description}
                    </p>
                  </div>

                  {/* Right side integrated preview and selection indicators */}
                  <div className="absolute right-3.5 top-0 bottom-0 flex items-center gap-1.5">
                    {/* Play Sample Button */}
                    <button
                      type="button"
                      onClick={(e) => playPreview(e, voice)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                        isPlaying
                          ? 'bg-rose-100 border-rose-200 text-rose-600 hover:bg-rose-200'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600'
                      }`}
                      title={isPlaying ? 'Остановить воспроизведение' : 'Прослушать пример голоса'}
                    >
                      {isLoading ? (
                        <Loader2 size={13} className="animate-spin text-emerald-600" />
                      ) : isPlaying ? (
                        <Pause size={12} fill="currentColor" />
                      ) : (
                        <Play size={12} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>

                    {/* Active Selected Checkmark */}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-emerald-400">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guest Section */}
        <div className="space-y-3.5">
          <label className="text-[11px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
            <User size={13} className="text-indigo-500" />
            Приглашенный гость ({guestName})
          </label>
          {guestEnabled ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
              {GUEST_VOICES.map((voice) => {
                const isSelected = selection.guestVoiceId === voice.id;
                const isPlaying = currentPreviewVoiceId === voice.id;
                const isLoading = isPreviewLoading === voice.id;

                return (
                  <div
                    key={voice.id}
                    onClick={() => handleGuestVoiceSelect(voice.id)}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer text-left flex items-start gap-3.5 group relative select-none ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500/20 shadow-md shadow-emerald-500/[0.04]'
                        : 'bg-white border-neutral-250 hover:border-neutral-350 hover:shadow-sm hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Left avatar badge */}
                    <div className={`p-2.5 rounded-xl shrink-0 transition-colors self-center ${
                      isSelected 
                        ? 'bg-emerald-500/10 text-emerald-600' 
                        : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200'
                    }`}>
                      <Volume2 size={16} />
                    </div>

                    {/* Middle content / Text info */}
                    <div className="flex-1 min-w-0 pr-10">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-sm text-neutral-800">{voice.name}</span>
                        <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          {voice.gender === 'male' ? 'Муж' : 'Жен'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 lines-clamp-2 leading-relaxed">
                        {voice.description}
                      </p>
                    </div>

                    {/* Right side integrated preview and selection indicators */}
                    <div className="absolute right-3.5 top-0 bottom-0 flex items-center gap-1.5">
                      {/* Play Sample Button */}
                      <button
                        type="button"
                        onClick={(e) => playPreview(e, voice)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                          isPlaying
                            ? 'bg-rose-100 border-rose-200 text-rose-600 hover:bg-rose-200'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600'
                        }`}
                        title={isPlaying ? 'Остановить воспроизведение' : 'Прослушать пример голоса'}
                      >
                        {isLoading ? (
                          <Loader2 size={13} className="animate-spin text-emerald-600" />
                        ) : isPlaying ? (
                          <Pause size={12} fill="currentColor" />
                        ) : (
                          <Play size={12} fill="currentColor" className="ml-0.5" />
                        )}
                      </button>

                      {/* Active Selected Checkmark */}
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-emerald-400">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50 text-center">
              <User size={24} className="text-neutral-300 mb-2" />
              <p className="text-[11px] font-extrabold text-neutral-450 uppercase tracking-widest">Гость отключен</p>
              <p className="text-[10px] text-neutral-400 mt-1 max-w-[180px] leading-relaxed">
                Будет сгенерирован сольный выпуск с участием только Ведущего
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
