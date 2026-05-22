import { useState, useRef, useEffect } from 'react';
import { generatePodcastAudio } from '../services/generatePodcastAudio';
import { useSettingsStore } from '@/src/stores/useSettingsStore';
import { ScriptSegment, VoiceSelection } from '../types/podcast.types';
import { toast } from 'sonner';

export interface AudioCacheEntry {
  url: string;
  blob: Blob;
  voiceId: string;
}

export function usePodcastAudio() {
  const elevenlabsKey = useSettingsStore((state) => state.elevenlabsKey);
  
  // Custom safe cache for segment audios: keyed by "segmentId_voiceId_speed_emotion"
  const [audioCache, setAudioCache] = useState<Record<string, AudioCacheEntry>>({});
  
  const [synthesizingId, setSynthesizingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  
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

  const getCacheKey = (segmentId: string, voiceId: string, speed = '1.0', emotion = 'neutral') => {
    return `${segmentId}_${voiceId}_${speed}_${emotion}`;
  };

  const playLocalSpeech = (text: string, isGuest: boolean, segmentId: string) => {
    if (!window.speechSynthesis) {
      toast.error('Веб-озвучка не поддерживается вашим браузером');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      
      const voices = window.speechSynthesis.getVoices();
      const ruVoices = voices.filter(v => v.lang.startsWith('ru'));
      
      if (isGuest) {
        const femaleVoice = ruVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('milena'));
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.pitch = 1.12;
        utterance.rate = 1.05;
      } else {
        const maleVoice = ruVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('yuri') || v.name.toLowerCase().includes('microsoft') || v.name.toLowerCase().includes('pavel'));
        if (maleVoice) utterance.voice = maleVoice;
        utterance.pitch = 0.9;
        utterance.rate = 1.0;
      }

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
      console.error(err);
      toast.error('Ошибка встроенного воспроизведения');
    }
  };

  const synthesizeSegmentDirectly = async (segmentId: string, text: string, voiceId: string): Promise<AudioCacheEntry> => {
    const key = getCacheKey(segmentId, voiceId);
    
    // Check cache
    if (audioCache[key]) {
      return audioCache[key];
    }

    if (!elevenlabsKey) {
      throw new Error('ElevenLabs key not configured');
    }

    // Call synthesizer backend
    const response = await fetch('/api/podcast/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceId,
        apiKey: elevenlabsKey
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to synthesize segment audio');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const entry = { url, blob, voiceId };

    // Update state cache immediately
    setAudioCache(prev => ({ ...prev, [key]: entry }));
    return entry;
  };

  const togglePlaySegment = async (segmentId: string, text: string, voiceId: string) => {
    if (playingId === segmentId) {
      stopCurrentAudio();
    } else {
      const key = getCacheKey(segmentId, voiceId);
      const cached = audioCache[key];

      if (cached) {
        playUrl(cached.url, segmentId);
      } else {
        if (!elevenlabsKey) {
          toast.warning('ElevenLabs API-ключ не настроен. Используем локальный синтезатор...');
          playLocalSpeech(text, voiceId.includes('guest') || voiceId === 'ErXwobaYiN019PkySvjV' || voiceId === 'AZnzlk1XvdvUeBnXmlld' || voiceId === 'EXAVITQu4vr4xnSDxMaL', segmentId);
          return;
        }

        setSynthesizingId(segmentId);
        try {
          const entry = await synthesizeSegmentDirectly(segmentId, text, voiceId);
          toast.success('Сегмент успешно озвучен в ElevenLabs!');
          // Invalidate merged full episode if a segment gets regenerated
          setFullEpisodeUrl(null);
          setFullEpisodeBlob(null);
          playUrl(entry.url, segmentId);
        } catch (err: any) {
          console.error(err);
          toast.error(`Ошибка ElevenLabs: ${err.message || 'Связь прервана'}. Используем локальный синтезатор...`);
          playLocalSpeech(text, voiceId.includes('guest') || voiceId === 'ErXwobaYiN019PkySvjV' || voiceId === 'AZnzlk1XvdvUeBnXmlld' || voiceId === 'EXAVITQu4vr4xnSDxMaL', segmentId);
        } finally {
          setSynthesizingId(null);
        }
      }
    }
  };

  const playUrl = (url: string, segmentId: string) => {
    stopCurrentAudio();
    const audio = new Audio(url);
    audioRef.current = audio;
    
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

  const downloadSegmentMp3 = async (segmentId: string, text: string, voiceId: string, title: string) => {
    const key = getCacheKey(segmentId, voiceId);
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
        const entry = await synthesizeSegmentDirectly(segmentId, text, voiceId);
        triggerBrowserDownload(entry.url, `${title}.mp3`);
        toast.success('Аудио успешно загружено на компьютер!', { id: toastId });
      } catch (err: any) {
        console.error(err);
        toast.error(`Ошибка импорта: ${err.message}`, { id: toastId });
      }
    }
  };

  // Compile and merge the entire podcast episodes
  const synthesizeAndMergeFullEpisode = async (script: ScriptSegment[], voiceSelection: VoiceSelection) => {
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
        const voiceId = isHost ? voiceSelection.hostVoiceId : (voiceSelection.guestVoiceId || 'pNInz6obpgdq5TaqLwtY');
        const key = getCacheKey(segment.id, voiceId);
        
        setFullProgress(`Озвучка [${i + 1}/${totalCount}]: Реплика "${segment.speakerName}"...`);
        
        let entry = audioCache[key];
        if (!entry) {
          // Synthesize on the fly and update state cache
          entry = await synthesizeSegmentDirectly(segment.id, segment.text, voiceId);
          // Small pause to prevent hitting API limits too rapidly
          await new Promise(res => setTimeout(res, 200));
        }
        
        blobsToMerge.push(entry.blob);
      }

      // Merge sequentially. MP3 streams can be safely concatenated simply as files!
      setFullProgress('Объединение звуковых дорожек и очистка артефактов...');
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
    togglePlaySegment,
    downloadSegmentMp3,
    stopCurrentAudio,
    
    // Full Episode Support
    isSynthesizingFull,
    fullProgress,
    fullEpisodeUrl,
    fullEpisodeBlob,
    synthesizeAndMergeFullEpisode,
    downloadFullEpisode
  };
}
