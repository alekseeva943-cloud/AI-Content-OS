import { useState, useRef, useEffect } from 'react';
import { VoiceSelection } from '../types/podcast.types';
import { Play, Pause, Loader2, Radio, Mic, User, Volume2, Settings, Sliders, ShieldCheck } from 'lucide-react';
import { useSettingsStore } from '@/src/stores/useSettingsStore';
import { HUMAN_VOICE_LIBRARY, HOST_VOICE_IDS, GUEST_VOICE_IDS } from '../constants/voices';
import { toast } from 'sonner';

export interface VoiceAudioSettings {
  stability: number; // 0-100
  similarity_boost: number; // 0-100
  style: number; // 0-100
  energy: number; // 0-100
  speed: number; // 0.8 - 1.3
  use_speaker_boost: boolean;
  modelId: string;
}

interface PodcastVoiceSelectorProps {
  selection: VoiceSelection;
  onChange: (val: VoiceSelection) => void;
  guestEnabled: boolean;
  guestName?: string;
  hostSettings: VoiceAudioSettings;
  guestSettings: VoiceAudioSettings;
  onHostSettingsChange: (settings: VoiceAudioSettings) => void;
  onGuestSettingsChange: (settings: VoiceAudioSettings) => void;
}

export function PodcastVoiceSelector({
  selection,
  onChange,
  guestEnabled,
  guestName = 'Гость',
  hostSettings,
  guestSettings,
  onHostSettingsChange,
  onGuestSettingsChange
}: PodcastVoiceSelectorProps) {
  const elevenlabsKey = useSettingsStore((state) => state.elevenlabsKey);
  
  // Local states for voice preview playback
  const [currentPreviewVoiceId, setCurrentPreviewVoiceId] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  
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

    const voice = HUMAN_VOICE_LIBRARY[voiceId];
    const sampleText = voice?.previewText || (voiceGender === 'male'
      ? `Привет! Я с удовольствием озвучу ваш подкаст на русском языке. Как вам пример звучания?`
      : `Здравствуйте! Буду рада принять участие в записи вашего выпуска. Давайте создадим отличный диалог!`);

    const isHost = HOST_VOICE_IDS.includes(voiceId);
    const activeSettings = isHost ? hostSettings : guestSettings;

    console.log(`[VOICE PREVIEW] Play preview triggered for ${voiceName}:
      - voiceId: ${voiceId}
      - text: "${sampleText}"
      - stability: ${activeSettings.stability}%
      - similarity_boost: ${activeSettings.similarity_boost}%
      - style: ${activeSettings.style}%
      - use_speaker_boost: ${activeSettings.use_speaker_boost}
      - modelId: ${activeSettings.modelId}
      - speed: ${activeSettings.speed}x`);

    // 1. Check if ElevenLabs key is present for premium synthesis
    if (elevenlabsKey) {
      setIsPreviewLoading(voiceId);

      try {
        const response = await fetch('/api/podcast/synthesize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: sampleText,
            voiceId: voiceId,
            apiKey: elevenlabsKey,
            modelId: activeSettings.modelId,
            voiceSettings: {
              stability: activeSettings.stability / 100,
              similarity_boost: activeSettings.similarity_boost / 100,
              style: activeSettings.style / 100,
              use_speaker_boost: activeSettings.use_speaker_boost
            },
            speaker: isHost ? 'host' : 'guest',
            voiceName: voiceName
          })
        });

        if (!response.ok) {
          throw new Error('Synthesis failed');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        setIsPreviewLoading(null);
        setCurrentPreviewVoiceId(voiceId);

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.playbackRate = activeSettings.speed; // set local speech rate
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
      const voiceInfo = HUMAN_VOICE_LIBRARY[voiceId] || HUMAN_VOICE_LIBRARY['pNInz6obpgdq5TaqLwtY'];
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

      const isHost = HOST_VOICE_IDS.includes(voiceId);
      const activeSettings = isHost ? hostSettings : guestSettings;

      utterance.pitch = voiceInfo?.fallbackPitch ?? 1.0;
      utterance.rate = activeSettings.speed; // Bind instantly to browser TTS rate too!

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

      <div className="space-y-5">
        
        {/* ==================================== */}
        {/* HOST VOICE CONFIGURATION (EMERALD ACCENTS) */}
        {/* ==================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1.5 leading-none">
              <Mic size={13} className="text-[#10B981]" />
              Ведущий подкаста
            </label>
            <span className="text-[9px] text-[#10B981] font-black uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
              Host
            </span>
          </div>

          <div className="space-y-1.5">
            {HOST_VOICE_IDS.map((id) => {
              const voice = HUMAN_VOICE_LIBRARY[id];
              const isSelected = selection.hostVoiceId === id;
              const isPlaying = currentPreviewVoiceId === id;
              const isLoading = isPreviewLoading === id;

              return (
                <div
                  key={id}
                  onClick={() => handleHostVoiceSelect(id)}
                  className={`p-2.5 rounded-xl border transition-all duration-350 cursor-pointer flex items-center justify-between gap-3 relative select-none ${
                    isSelected
                      ? 'bg-emerald-50/30 border-[#10B981] ring-1 ring-emerald-500/10 shadow-sm'
                      : 'bg-white border-neutral-150 hover:border-emerald-300'
                  }`}
                >
                  {/* Avatar, name and tag info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 relative transition-all ${
                      isSelected 
                        ? 'bg-[#10B981] text-white' 
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {voice.name[0]}
                      {isPlaying && (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center border border-white scale-90">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative w-1 h-1 rounded-full bg-white"></span>
                        </span>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-1.5 leading-none">
                        <span className="font-extrabold text-xs text-neutral-850">{voice.name}</span>
                        <span className="text-[7px] bg-neutral-100 font-bold text-neutral-500 px-0.5 rounded scale-90">
                          {voice.gender === 'male' ? 'М' : 'Ж'}
                        </span>
                      </div>
                      
                      {/* Compact tag and desc line */}
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                        <span className="text-[#10B981] font-bold mr-1">{voice.tags[0]}</span> • {voice.shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* Unified play preview trigger on the right */}
                  <button
                    type="button"
                    onClick={(e) => playPreview(e, id, voice.gender, voice.name)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all shrink-0 outline-none ${
                      isPlaying
                        ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                        : isSelected
                          ? 'bg-emerald-100/50 border-emerald-200 text-emerald-800'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                    }`}
                    title={isPlaying ? 'Остановить' : 'Прослушать голос (15 сек характере)'}
                  >
                    {isLoading ? (
                      <Loader2 size={11} className="animate-spin text-[#10B981]" />
                    ) : isPlaying ? (
                      <Pause size={9} fill="currentColor" />
                    ) : (
                      <Play size={9} fill="currentColor" className="ml-0.5" />
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
        <div className="space-y-2">
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
            <div className="space-y-1.5">
              {GUEST_VOICE_IDS.map((id) => {
                const voice = HUMAN_VOICE_LIBRARY[id];
                const isSelected = selection.guestVoiceId === id;
                const isPlaying = currentPreviewVoiceId === id;
                const isLoading = isPreviewLoading === id;

                return (
                  <div
                    key={id}
                    onClick={() => handleGuestVoiceSelect(id)}
                    className={`p-2.5 rounded-xl border transition-all duration-350 cursor-pointer flex items-center justify-between gap-3 relative select-none ${
                      isSelected
                        ? 'bg-violet-50/30 border-violet-550 ring-1 ring-violet-500/10 shadow-sm'
                        : 'bg-white border-neutral-150 hover:border-violet-300'
                    }`}
                  >
                    {/* Avatar, name and tag info */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 relative transition-all ${
                        isSelected 
                          ? 'bg-violet-500 text-white' 
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {voice.name[0]}
                        {isPlaying && (
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center border border-white scale-90">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative w-1 h-1 rounded-full bg-white"></span>
                          </span>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-1.5 leading-none">
                          <span className="font-extrabold text-xs text-neutral-850">{voice.name}</span>
                          <span className="text-[7px] bg-neutral-100 font-bold text-neutral-500 px-0.5 rounded scale-90">
                            {voice.gender === 'male' ? 'М' : 'Ж'}
                          </span>
                        </div>
                        
                        {/* Compact tag and desc line */}
                        <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                          <span className="text-violet-500 font-bold mr-1">{voice.tags[0]}</span> • {voice.shortDesc}
                        </p>
                      </div>
                    </div>

                    {/* Unified play preview trigger on the right */}
                    <button
                      type="button"
                      onClick={(e) => playPreview(e, id, voice.gender, voice.name)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all shrink-0 outline-none ${
                        isPlaying
                          ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                          : isSelected
                            ? 'bg-violet-100/50 border-violet-200 text-violet-850'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                      }`}
                      title={isPlaying ? 'Остановить' : 'Прослушать голос (15 сек)'}
                    >
                      {isLoading ? (
                        <Loader2 size={11} className="animate-spin text-violet-500" />
                      ) : isPlaying ? (
                        <Pause size={9} fill="currentColor" />
                      ) : (
                        <Play size={9} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-neutral-200 rounded-xl bg-neutral-50 text-center">
              <span className="text-[9px] uppercase font-black text-neutral-400 tracking-wider">Одиночное Вещание</span>
              <p className="text-[10px] text-neutral-400 mt-1 leading-normal max-w-[220px]">
                Вся дорожка озвучивается выбранным ведущим.
              </p>
            </div>
          )}
        </div>

        {/* ==================================== */}
        {/* COLLAPSIBLE ADVANCED CONTROLS (Requirement 7) */}
        {/* ==================================== */}
        <div className="border-t border-neutral-100 pt-3 mt-1">
          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="w-full flex items-center justify-between text-xs font-black text-neutral-600 hover:text-neutral-800 transition-all uppercase tracking-wider h-8"
          >
            <span className="flex items-center gap-1.5">
              <Sliders size={13} className="text-[#10B981]" />
              Настройки интонаций (Pro)
            </span>
            <span className={`text-[10px] transform transition-transform duration-350 ${isAdvancedOpen ? 'rotate-180 text-[#10B981]' : ''}`}>
              ▼
            </span>
          </button>

          {isAdvancedOpen && (
            <div className="pt-3.5 space-y-6 text-neutral-700 animate-in fade-in duration-300">
              
              {/* Host Settings Column */}
              <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/10 space-y-3.5">
                <div className="flex items-center justify-between border-b border-emerald-100/40 pb-1.5">
                  <span className="text-[10px] font-black uppercase text-[#10B981] tracking-wider leading-none">Ведущий (Host)</span>
                  <span className="text-[8px] font-bold text-neutral-400">ID: {selection.hostVoiceId.slice(0, 5)}...</span>
                </div>

                {/* Model Selector Dropdown */}
                <div className="space-y-1 text-left">
                  <div className="flex justify-between text-[10px] font-extrabold text-neutral-500">
                    <span>Выбор Модели</span>
                  </div>
                  <select
                    value={hostSettings.modelId}
                    onChange={(e) => onHostSettingsChange({ ...hostSettings, modelId: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-lg p-1.5 text-xs font-bold text-neutral-700 focus:outline-none focus:border-[#10B981]"
                  >
                    <option value="eleven_multilingual_v2">Multilingual v2 (Premium)</option>
                    <option value="eleven_turbo_v2_5">Turbo v2.5 (Fast Conversational)</option>
                  </select>
                </div>

                {/* Sliders */}
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-extrabold text-neutral-500">
                      <span>Стабильность (Stability)</span>
                      <span className="text-neutral-700 font-black">{hostSettings.stability}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={hostSettings.stability}
                      onChange={(e) => onHostSettingsChange({ ...hostSettings, stability: parseInt(e.target.value) })}
                      className="w-full accent-[#10B981] h-1 bg-neutral-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-extrabold text-neutral-500">
                      <span>Точность (Warmth / Similarity)</span>
                      <span className="text-neutral-700 font-black">{hostSettings.similarity_boost}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={hostSettings.similarity_boost}
                      onChange={(e) => onHostSettingsChange({ ...hostSettings, similarity_boost: parseInt(e.target.value) })}
                      className="w-full accent-[#10B981] h-1 bg-neutral-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-extrabold text-neutral-500">
                      <span>Эмоциональность (Style)</span>
                      <span className="text-neutral-700 font-black">{hostSettings.style}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={hostSettings.style}
                      onChange={(e) => onHostSettingsChange({ ...hostSettings, style: parseInt(e.target.value) })}
                      className="w-full accent-[#10B981] h-1 bg-neutral-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-extrabold text-neutral-500">
                      <span>Энергичность (Energy)</span>
                      <span className="text-neutral-700 font-black">{hostSettings.energy}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={hostSettings.energy}
                      onChange={(e) => onHostSettingsChange({ ...hostSettings, energy: parseInt(e.target.value) })}
                      className="w-full accent-[#10B981] h-1 bg-neutral-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-extrabold text-neutral-500">
                      <span>Скорость речи (Speed)</span>
                      <span className="text-neutral-700 font-black">{hostSettings.speed}x</span>
                    </div>
                    <input
                      type="range" min="80" max="130" value={Math.round(hostSettings.speed * 100)}
                      onChange={(e) => onHostSettingsChange({ ...hostSettings, speed: parseFloat((parseInt(e.target.value) / 100).toFixed(2)) })}
                      className="w-full accent-[#10B981] h-1 bg-neutral-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold text-neutral-600 pt-1">
                    <span className="flex items-center gap-1">Speaker Boost (Бустер)</span>
                    <input
                      type="checkbox"
                      checked={hostSettings.use_speaker_boost}
                      onChange={(e) => onHostSettingsChange({ ...hostSettings, use_speaker_boost: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#10B981]"
                    />
                  </div>
                </div>
              </div>

              {/* Guest Settings Column */}
              {guestEnabled ? (
                <div className="p-3.5 rounded-xl border border-violet-100 bg-violet-50/10 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-violet-100/40 pb-1.5">
                    <span className="text-[10px] font-black uppercase text-violet-500 tracking-wider leading-none">Гость ({guestName})</span>
                    <span className="text-[8px] font-bold text-neutral-400">ID: {selection.guestVoiceId?.slice(0, 5)}...</span>
                  </div>

                  {/* Model Selector Dropdown */}
                  <div className="space-y-1 text-left">
                    <div className="flex justify-between text-[10px] font-extrabold text-neutral-500">
                      <span>Выбор Модели</span>
                    </div>
                    <select
                      value={guestSettings.modelId}
                      onChange={(e) => onGuestSettingsChange({ ...guestSettings, modelId: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-lg p-1.5 text-xs font-bold text-neutral-700 focus:outline-none focus:border-violet-500"
                    >
                      <option value="eleven_multilingual_v2">Multilingual v2 (Premium)</option>
                      <option value="eleven_turbo_v2_5">Turbo v2.5 (Fast Conversational)</option>
                    </select>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-extrabold text-neutral-500">
                        <span>Стабильность (Stability)</span>
                        <span className="text-neutral-700 font-black">{guestSettings.stability}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" value={guestSettings.stability}
                        onChange={(e) => onGuestSettingsChange({ ...guestSettings, stability: parseInt(e.target.value) })}
                        className="w-full accent-violet-500 h-1 bg-neutral-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-extrabold text-neutral-500">
                        <span>Точность (Warmth / Similarity)</span>
                        <span className="text-neutral-700 font-black">{guestSettings.similarity_boost}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" value={guestSettings.similarity_boost}
                        onChange={(e) => onGuestSettingsChange({ ...guestSettings, similarity_boost: parseInt(e.target.value) })}
                        className="w-full accent-violet-500 h-1 bg-neutral-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-extrabold text-neutral-500">
                        <span>Эмоциональность (Style)</span>
                        <span className="text-neutral-700 font-black">{guestSettings.style}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" value={guestSettings.style}
                        onChange={(e) => onGuestSettingsChange({ ...guestSettings, style: parseInt(e.target.value) })}
                        className="w-full accent-violet-500 h-1 bg-neutral-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-extrabold text-neutral-500">
                        <span>Энергичность (Energy)</span>
                        <span className="text-neutral-700 font-black">{guestSettings.energy}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" value={guestSettings.energy}
                        onChange={(e) => onGuestSettingsChange({ ...guestSettings, energy: parseInt(e.target.value) })}
                        className="w-full accent-violet-500 h-1 bg-neutral-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-extrabold text-neutral-500">
                        <span>Скорость речи (Speed)</span>
                        <span className="text-neutral-700 font-black">{guestSettings.speed}x</span>
                      </div>
                      <input
                        type="range" min="80" max="130" value={Math.round(guestSettings.speed * 100)}
                        onChange={(e) => onGuestSettingsChange({ ...guestSettings, speed: parseFloat((parseInt(e.target.value) / 100).toFixed(2)) })}
                        className="w-full accent-violet-500 h-1 bg-neutral-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-neutral-600 pt-1">
                      <span className="flex items-center gap-1">Speaker Boost (Бустер)</span>
                      <input
                        type="checkbox"
                        checked={guestSettings.use_speaker_boost}
                        onChange={(e) => onGuestSettingsChange({ ...guestSettings, use_speaker_boost: e.target.checked })}
                        className="w-3.5 h-3.5 accent-violet-500"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center gap-2 p-2 bg-neutral-55 rounded-xl border border-neutral-100 text-[10px] text-neutral-500 font-medium">
                <ShieldCheck size={14} className="text-[#10B981] shrink-0" />
                <span>Настройки сохраняются на лету! Прослушайте превью сверху, чтобы сразу услышать изменения.</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
