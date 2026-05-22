import { useState, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/src/stores/useSettingsStore';
import { ScriptSegment, VoiceSelection, VoiceDiagnostic } from '../types/podcast.types';
import { HUMAN_VOICE_LIBRARY } from '../constants/voices';
import { VoiceAudioSettings } from '../components/PodcastVoiceSelector';
import { toast } from 'sonner';

export interface AudioCacheEntry {
  url: string;
  blob: Blob;
  voiceId: string;
}

// 10. Humanization Engine v2 (Preprocesses text, injects conversational cadence, breath cues and personality-based fillers to break synthetic monotony)
export function applySpeechRhythm(text: string, settings?: VoiceAudioSettings, voiceId?: string): string {
  if (!text) return text;
  
  let processed = text;
  
  // Clean up punctuation and standardise
  processed = processed.replace(/["\n\r]/g, ' ').replace(/\s+/g, ' ').trim();

  // Load voice profile defaults
  const voiceInfo = voiceId ? HUMAN_VOICE_LIBRARY[voiceId] : null;
  const profile = voiceInfo?.voiceProfile;

  // Read combined metrics (prioritize UI slider values if available, else fall back to voiceProfile)
  const stability = settings ? settings.stability : (profile ? profile.stability : 45);
  const similarity_boost = settings ? settings.similarity_boost : (profile ? profile.similarity_boost : 75);
  const style = settings ? settings.style : (profile ? profile.style : 45);
  const energy = settings ? settings.energy : (profile ? profile.emotionality : 50);
  const speed = settings ? settings.speed : (profile ? profile.rate : 1.0);

  // 1. Sentence pacing and dynamic pause insertion
  // We use " ... " for organic breathing breaks.
  if (speed < 0.90) {
    // Slow, deep, deliberate talking mode
    processed = processed.replace(/, /g, ', ... ');
    processed = processed.replace(/\. /g, '. ... ... ');
    processed = processed.replace(/\? /g, '? ... ... ');
    processed = processed.replace(/\! /g, '! ... ... ');
  } else if (speed > 1.15) {
    // Snappy, fast delivery, tight gaps
    processed = processed.replace(/, /g, ', ');
    processed = processed.replace(/\. /g, '. ... ');
    processed = processed.replace(/\? /g, '? ... ');
    processed = processed.replace(/\! /g, '! ... ');
  } else {
    // Standard human tempo, balanced breaths
    processed = processed.replace(/, /g, ', ... ');
    processed = processed.replace(/\. /g, '. ... ... ');
    processed = processed.replace(/\? /g, '? ... ... ');
    processed = processed.replace(/\! /g, '! ... ');
    processed = processed.replace(/ - /g, ' — ... ');
    processed = processed.replace(/ – /g, ' — ... ');
  }

  // 2. Style & Emotional cadence amplification (modifying text based on style/energy settings)
  if (style > 70 || energy > 75) {
    // High emotional resonance -> add expressive punctuation shaping
    processed = processed.replace(/\. \.\.\./g, '! ...');
    processed = processed.replace(/\? \.\.\./g, '?! ...');
    
    // Inject dynamic conversational fillers based on character role/archetype to convey emotional cadence
    if (voiceId) {
      if (profile?.cadence === 'rapid' || profile?.cadence === 'conversational') {
        const energeticFillers = ['Слушайте, это... ', 'Просто вау! ', 'Серьёзно, ', 'Представьте себе, '];
        const randomFiller = energeticFillers[Math.floor(Math.random() * energeticFillers.length)];
        if (Math.random() > 0.45) {
          processed = randomFiller + processed;
        }
      } else if (profile?.cadence === 'deep' || profile?.cadence === 'steady') {
        const deepFillers = ['Но погодите... ', 'Задумайтесь на миг: ', 'Собственно говоря, ', 'И это поразительно... '];
        const randomFiller = deepFillers[Math.floor(Math.random() * deepFillers.length)];
        if (Math.random() > 0.45) {
          processed = randomFiller + processed;
        }
      } else {
        const warmFillers = ['Знаете... ', 'Это действительно... ', 'Интересно, что ', 'Ой, ну надо же... '];
        const randomFiller = warmFillers[Math.floor(Math.random() * warmFillers.length)];
        if (Math.random() > 0.45) {
          processed = randomFiller + processed;
        }
      }
    }
  } else if (style < 35 || energy < 30) {
    // Whispering, flat, or relaxed docu style -> soft punctuation behavior & decay
    processed = processed.replace(/!/g, '.');
    processed = processed.replace(/\. \.\.\./g, '... ...');
    
    if (voiceId && (profile?.cadence === 'deep' || profile?.cadence === 'steady')) {
      const slowFillers = ['Видите ли... ', 'Если подумать... ', 'Так сказать... '];
      const randomFiller = slowFillers[Math.floor(Math.random() * slowFillers.length)];
      if (Math.random() > 0.5) {
        processed = randomFiller + processed;
      }
    }
  }

  // Clean punctuation clumps
  processed = processed.replace(/\s+/g, ' ');
  processed = processed.replace(/\.\.\.\s*\.\.\./g, '...');
  processed = processed.replace(/\.\.\.\s*,/g, '...');
  processed = processed.replace(/,\s*\.\.\./g, ', ...');
  
  if (processed.endsWith('... ...')) {
    processed = processed.substring(0, processed.length - 4);
  }

  return processed;
}

export function usePodcastAudio(
  voiceSelection?: VoiceSelection,
  hostSettings?: VoiceAudioSettings,
  guestSettings?: VoiceAudioSettings
) {
  const elevenlabsKey = useSettingsStore((state) => state.elevenlabsKey);
  
  // Custom safe cache: keyed by exact combination of parameters to ensure robust realtime invalidation
  const [audioCache, setAudioCache] = useState<Record<string, AudioCacheEntry>>({});
  
  const [synthesizingId, setSynthesizingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [lastSynthesisDiagnostic, setLastSynthesisDiagnostic] = useState<VoiceDiagnostic | null>(null);
  
  // Full Episode States
  const [isSynthesizingFull, setIsSynthesizingFull] = useState(false);
  const [fullProgress, setFullProgress] = useState<string | null>(null);
  const [fullEpisodeUrl, setFullEpisodeUrl] = useState<string | null>(null);
  const [fullEpisodeBlob, setFullEpisodeBlob] = useState<Blob | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, []);

  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlayingId(null);
  };

  // Generate complete, distinct cache keys that encompass exact slider variables as requested by Requirement 2
  const getCacheKey = (
    segmentId: string, 
    voiceId: string, 
    stability = 45, 
    similarity = 75, 
    style = 45, 
    energy = 50,
    speed = 1.0, 
    useSpeakerBoost = true,
    modelId = 'eleven_multilingual_v2'
  ) => {
    return `${segmentId}_${voiceId}_st${stability}_sm${similarity}_sy${style}_en${energy}_sp${speed.toFixed(2)}_sb${useSpeakerBoost ? 1 : 0}_${modelId}`;
  };

  const playLocalSpeech = (text: string, voiceId: string, segmentId: string) => {
    if (!window.speechSynthesis) {
      toast.error('Веб-озвучка не поддерживается вашим браузером');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const voiceInfo = HUMAN_VOICE_LIBRARY[voiceId] || HUMAN_VOICE_LIBRARY['pNInz6obpgdq5TaqLwtY'];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      
      const voices = window.speechSynthesis.getVoices();
      const ruVoices = voices.filter(v => v.lang.startsWith('ru') || v.lang.startsWith('ru-RU'));
      
      const isFemale = voiceInfo?.gender === 'female';
      if (isFemale) {
        const femaleVoice = ruVoices.find(v => 
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('google') || 
          v.name.toLowerCase().includes('milena') || 
          v.name.toLowerCase().includes('irina')
        );
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        } else if (ruVoices.length > 0) {
          utterance.voice = ruVoices[0];
        }
      } else {
        const maleVoice = ruVoices.find(v => 
          v.name.toLowerCase().includes('male') || 
          v.name.toLowerCase().includes('yuri') || 
          v.name.toLowerCase().includes('microsoft') || 
          v.name.toLowerCase().includes('pavel') || 
          v.name.toLowerCase().includes('alexander')
        );
        if (maleVoice) {
          utterance.voice = maleVoice;
        } else if (ruVoices.length > 0) {
          utterance.voice = ruVoices[0];
        }
      }

      const isHost = voiceId === voiceSelection?.hostVoiceId;
      const activeSettings = isHost ? hostSettings : guestSettings;
      const speedSetting = activeSettings?.speed ?? 1.0;

      utterance.pitch = voiceInfo?.fallbackPitch ?? 1.0;
      utterance.rate = (voiceInfo?.fallbackRate ?? 1.0) * speedSetting;

      utterance.onstart = () => {
        setPlayingId(segmentId);
      };

      utterance.onend = () => {
        setPlayingId(null);
      };

      utterance.onerror = () => {
        setPlayingId(null);
      };

      synthUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);

    } catch (err) {
      console.error('[VOICE TTS EXCEPTION]', err);
      toast.error('Ошибка встроенного воспроизведения');
    }
  };

  const synthesizeSegmentDirectly = async (
    segmentId: string, 
    text: string, 
    voiceId: string, 
    isHost: boolean
  ): Promise<AudioCacheEntry> => {
    const activeSettings = isHost ? hostSettings : guestSettings;
    
    const key = getCacheKey(
      segmentId,
      voiceId,
      activeSettings?.stability,
      activeSettings?.similarity_boost,
      activeSettings?.style,
      activeSettings?.energy,
      activeSettings?.speed,
      activeSettings?.use_speaker_boost,
      activeSettings?.modelId
    );
    
    // Check cache
    if (audioCache[key]) {
      console.log(`[VOICE STATUS] Cache HIT for key="${key}"`);
      return audioCache[key];
    }

    if (!elevenlabsKey) {
      throw new Error('ElevenLabs key not configured');
    }

    const startMs = Date.now();

    // Apply speech rhythm engine BEFORE sending text to Elevenlabs as requested by Requirement 10
    const enhancedText = applySpeechRhythm(text, activeSettings, voiceId);

    const voiceInfo = HUMAN_VOICE_LIBRARY[voiceId] || HUMAN_VOICE_LIBRARY['pNInz6obpgdq5TaqLwtY'];
    
    const payload = {
      text: enhancedText,
      voiceId,
      apiKey: elevenlabsKey,
      modelId: activeSettings?.modelId || 'eleven_multilingual_v2',
      voiceSettings: activeSettings ? {
        stability: activeSettings.stability / 100,
        similarity_boost: activeSettings.similarity_boost / 100,
        style: activeSettings.style / 100,
        use_speaker_boost: activeSettings.use_speaker_boost
      } : undefined,
      speaker: isHost ? 'host' : 'guest',
      voiceName: voiceInfo?.name
    };

    console.log(`[VOICE SYNTHESIS PIPELINE] Launching raw ElevenLabs call with actual settings:`, payload);

    // Call synthesizer backend
    const response = await fetch('/api/podcast/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[VOICE STATUS] Elevenlabs Synthesis HTTP Failure:`, errorText);
      throw new Error(errorText || 'Failed to synthesize segment audio');
    }

    const durationMs = Date.now() - startMs;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const entry = { url, blob, voiceId };

    console.log(`[VOICE STATUS] Elevenlabs Synthesis Success. Key cached: "${key}"`);

    // Update diagnosis
    const profile = voiceInfo?.voiceProfile;
    setLastSynthesisDiagnostic({
      voiceId,
      voiceName: voiceInfo?.name || 'Unknown',
      modelId: payload.modelId,
      stability: activeSettings?.stability ?? 45,
      similarity_boost: activeSettings?.similarity_boost ?? 75,
      style: activeSettings?.style ?? 45,
      speed: activeSettings?.speed ?? 1.0,
      energy: activeSettings?.energy ?? 50,
      cacheHit: false,
      durationMs,
      rawPayload: payload,
      textRef: text,
      pitch: profile?.pitch ?? 1.0,
      energy_curve: profile?.energy_curve ?? 'dynamic',
      punctuation_behavior: profile?.punctuation_behavior ?? 'natural',
      pause_density: profile?.pause_density ?? 'medium',
      emotionality: profile?.emotionality ?? 50,
      cadence: profile?.cadence ?? 'steady'
    });

    // Update state cache immediately
    setAudioCache(prev => ({ ...prev, [key]: entry }));
    return entry;
  };

  const togglePlaySegment = async (segmentId: string, text: string, voiceId: string, speaker?: 'host' | 'guest') => {
    const isHost = speaker === 'host' || voiceId === voiceSelection?.hostVoiceId;
    const activeSettings = isHost ? hostSettings : guestSettings;

    if (playingId === segmentId) {
      stopCurrentAudio();
    } else {
      const key = getCacheKey(
         segmentId,
         voiceId,
         activeSettings?.stability,
         activeSettings?.similarity_boost,
         activeSettings?.style,
         activeSettings?.energy,
         activeSettings?.speed,
         activeSettings?.use_speaker_boost,
         activeSettings?.modelId
      );
      const cached = audioCache[key];

      if (cached) {
        console.log(`[VOICE PLAY] Playing from audio cache key: "${key}"`);
        const voiceInfo = HUMAN_VOICE_LIBRARY[voiceId] || HUMAN_VOICE_LIBRARY['pNInz6obpgdq5TaqLwtY'];
        const profile = voiceInfo?.voiceProfile;
        
        setLastSynthesisDiagnostic({
          voiceId,
          voiceName: voiceInfo?.name || 'Unknown',
          modelId: activeSettings?.modelId || 'eleven_multilingual_v2',
          stability: activeSettings?.stability ?? 45,
          similarity_boost: activeSettings?.similarity_boost ?? 75,
          style: activeSettings?.style ?? 45,
          speed: activeSettings?.speed ?? 1.0,
          energy: activeSettings?.energy ?? 50,
          cacheHit: true,
          durationMs: 0,
          rawPayload: {
            text: "... (cached stream reference) ...",
            voiceId,
            modelId: activeSettings?.modelId || 'eleven_multilingual_v2'
          },
          textRef: text,
          pitch: profile?.pitch ?? 1.0,
          energy_curve: profile?.energy_curve ?? 'dynamic',
          punctuation_behavior: profile?.punctuation_behavior ?? 'natural',
          pause_density: profile?.pause_density ?? 'medium',
          emotionality: profile?.emotionality ?? 50,
          cadence: profile?.cadence ?? 'steady'
        });

        playUrl(cached.url, segmentId, isHost);
      } else {
        if (!elevenlabsKey) {
          console.warn(`[VOICE PLAY] No Elevenlabs Key or missing configuration. Using native browser speech synthesis for voiceId=${voiceId}`);
          toast.warning('ElevenLabs API-ключ не настроен. Используем локальный синтезатор...');
          playLocalSpeech(text, voiceId, segmentId);
          return;
        }

        setSynthesizingId(segmentId);
        try {
          const entry = await synthesizeSegmentDirectly(segmentId, text, voiceId, isHost);
          // Invalidate merged full episode if a segment gets regenerated
          setFullEpisodeUrl(null);
          setFullEpisodeBlob(null);
          playUrl(entry.url, segmentId, isHost);
        } catch (err: any) {
          console.error(`[VOICE ERROR] Synthesis failed, falling back to WebSpeechTTS:`, err);
          toast.error(`Ошибка ElevenLabs: ${err.message || 'Связь прервана'}. Используем локальный синтезатор...`);
          playLocalSpeech(text, voiceId, segmentId);
        } finally {
          setSynthesizingId(null);
        }
      }
    }
  };

  const playUrl = (url: string, segmentId: string, isHost: boolean) => {
    stopCurrentAudio();
    const audio = new Audio(url);
    audioRef.current = audio;
    
    // Read local/realtime settings to apply playback rate dynamically
    const activeSettings = isHost ? hostSettings : guestSettings;
    const baseSpeed = activeSettings?.speed ?? 1.0;
    
    // Map ENERGY directly to human speech rate micro-adjustments
    const energyMod = activeSettings?.energy ? (activeSettings.energy - 50) / 400 : 0;
    const finalSpeed = Math.max(0.7, Math.min(1.5, baseSpeed + energyMod));

    // Ensure playback rate is applied even after resource finishes buffering
    audio.oncanplay = () => {
      audio.playbackRate = finalSpeed;
    };
    audio.playbackRate = finalSpeed;

    console.log(`[PLAYER ENGINE] Playing segment ID: ${segmentId}. Base rate: ${baseSpeed}x. Modified by energy: ${finalSpeed.toFixed(2)}x`);

    audio.onplay = () => {
      setPlayingId(segmentId);
    };

    audio.onended = () => {
      setPlayingId(null);
    };

    audio.onerror = () => {
      toast.error('Ошибка аудио-плеера');
      setPlayingId(null);
    };

    audio.play();
  };

  const downloadSegmentMp3 = async (
    segmentId: string, 
    text: string, 
    voiceId: string, 
    title: string,
    speaker?: 'host' | 'guest'
  ) => {
    const isHost = speaker === 'host' || voiceId === voiceSelection?.hostVoiceId;
    const activeSettings = isHost ? hostSettings : guestSettings;
    
    const key = getCacheKey(
      segmentId,
      voiceId,
      activeSettings?.stability,
      activeSettings?.similarity_boost,
      activeSettings?.style,
      activeSettings?.energy,
      activeSettings?.speed,
      activeSettings?.use_speaker_boost,
      activeSettings?.modelId
    );
    const cached = audioCache[key];

    if (cached) {
      triggerBrowserDownload(cached.url, `${title}.mp3`);
    } else {
      if (!elevenlabsKey) {
        toast.error('Необходим ElevenLabs API-ключ для экспорта MP3 файлов');
        return;
      }
      
      const toastId = toast.loading('Генерация MP3-версии сегмента от ElevenLabs...');
      try {
        const entry = await synthesizeSegmentDirectly(segmentId, text, voiceId, isHost);
        triggerBrowserDownload(entry.url, `${title}.mp3`);
        toast.success('Аудио успешно загружено на компьютер!', { id: toastId });
      } catch (err: any) {
        console.error(err);
        toast.error(`Ошибка импорта: ${err.message}`, { id: toastId });
      }
    }
  };

  // Compile and merge the entire podcast episodes
  const synthesizeAndMergeFullEpisode = async (script: ScriptSegment[], currentVoiceSelection: VoiceSelection) => {
    if (!elevenlabsKey) {
      toast.error('ElevenLabs API-ключ не настроен в Настройках. Пожалуйста, укажите его для объединения озвученных дорожек.');
      return;
    }

    setIsSynthesizingFull(true);
    setFullProgress('Запуск компиляции полного выпуска подкаста...');
    
    try {
      const blobsToMerge: Blob[] = [];
      const totalCount = script.length;

      for (let i = 0; i < totalCount; i++) {
        const segment = script[i];
        const isHost = segment.speaker === 'host';
        const voiceId = isHost ? currentVoiceSelection.hostVoiceId : (currentVoiceSelection.guestVoiceId || 'pNInz6obpgdq5TaqLwtY');
        
        const activeSettings = isHost ? hostSettings : guestSettings;
        const key = getCacheKey(
          segment.id,
          voiceId,
          activeSettings?.stability,
          activeSettings?.similarity_boost,
          activeSettings?.style,
          activeSettings?.energy,
          activeSettings?.speed,
          activeSettings?.use_speaker_boost,
          activeSettings?.modelId
        );
        
        setFullProgress(`Озвучка [${i + 1}/${totalCount}]: Реплика "${segment.speakerName}"...`);
        
        let entry = audioCache[key];
        if (!entry) {
          entry = await synthesizeSegmentDirectly(segment.id, segment.text, voiceId, isHost);
          // Wait briefly to avoid hitting rate limits too fast
          await new Promise(res => setTimeout(res, 220));
        }
        
        blobsToMerge.push(entry.blob);
      }

      setFullProgress('Объединение звуковых дорожек и сведение подкаста...');
      const mergedBlob = new Blob(blobsToMerge, { type: 'audio/mpeg' });
      const mergedUrl = URL.createObjectURL(mergedBlob);
      
      setFullEpisodeBlob(mergedBlob);
      setFullEpisodeUrl(mergedUrl);
      toast.success('Полная дорожка выпуска успешно сведена! Плеер готов.');
    } catch (err: any) {
      console.error('[MERGE PODCAST] Compilation failed:', err);
      toast.error(`Ошибка сведения выпуска: ${err.message || 'Связь с ElevenLabs оборвалась.'}`);
    } finally {
      setIsSynthesizingFull(false);
      setFullProgress(null);
    }
  };

  const downloadFullEpisode = (filename = 'podcast_episode.mp3') => {
    if (!fullEpisodeUrl) {
      toast.error('Сначала озвучьте полный выпуск подкаста');
      return;
    }
    triggerBrowserDownload(fullEpisodeUrl, filename);
  };

  const triggerBrowserDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return {
    audioCache,
    synthesizingId,
    playingId,
    lastSynthesisDiagnostic,
    togglePlaySegment,
    downloadSegmentMp3,
    stopCurrentAudio,
    getCacheKey, // export helper
    
    // Full Episode Support
    isSynthesizingFull,
    fullProgress,
    fullEpisodeUrl,
    fullEpisodeBlob,
    synthesizeAndMergeFullEpisode,
    downloadFullEpisode
  };
}
