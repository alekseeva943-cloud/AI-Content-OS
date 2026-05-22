import { useState, useRef, useEffect } from 'react';
import { generatePodcastAudio } from '../services/generatePodcastAudio';
import { useSettingsStore } from '@/src/stores/useSettingsStore';
import { toast } from 'sonner';

export function usePodcastAudio() {
  const elevenlabsKey = useSettingsStore((state) => state.elevenlabsKey);
  const [synthesizedUrls, setSynthesizedUrls] = useState<Record<string, string>>({});
  const [synthesizingId, setSynthesizingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activePlayback, setActivePlayback] = useState<{ segmentId: string; blockIndex: number } | null>(null);
  
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

  const playLocalSpeech = (text: string, isGuest: boolean, segmentId: string) => {
    if (!window.speechSynthesis) {
      toast.error('Веб-озвучка не поддерживается вашим браузером');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      
      // Try to find natural sounding Russian voices
      const voices = window.speechSynthesis.getVoices();
      const ruVoices = voices.filter(v => v.lang.startsWith('ru'));
      
      if (isGuest) {
        // Find a second voice or adjust pitch/rate
        const femaleVoice = ruVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google'));
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.pitch = 1.1;
        utterance.rate = 1.05;
      } else {
        const maleVoice = ruVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('yuri') || v.name.toLowerCase().includes('microsoft'));
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

  const synthesizeSegment = async (segmentId: string, text: string, voiceId: string) => {
    if (!elevenlabsKey) {
      toast.error('Ключ ElevenLabs не настроен в Настройках. Используем локальный синтез речи...', {
        duration: 4000
      });
      playLocalSpeech(text, voiceId.includes('guest'), segmentId);
      return;
    }

    setSynthesizingId(segmentId);
    try {
      const audioUrl = await generatePodcastAudio({
        text,
        voiceId,
        apiKey: elevenlabsKey,
      });

      setSynthesizedUrls(prev => ({ ...prev, [segmentId]: audioUrl }));
      toast.success('Эпизод успешно озвучен в ElevenLabs!');
      
      // Auto play
      playUrl(audioUrl, segmentId);
    } catch (err: any) {
      console.error(err);
      toast.error(`Ошибка ElevenLabs: ${err.message || 'Связь прервана'}. Используем локальный синтезатор...`);
      playLocalSpeech(text, voiceId.includes('guest'), segmentId);
    } finally {
      setSynthesizingId(null);
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

  const togglePlaySegment = (segmentId: string, text: string, voiceId: string) => {
    if (playingId === segmentId) {
      stopCurrentAudio();
    } else {
      const existingUrl = synthesizedUrls[segmentId];
      if (existingUrl) {
        playUrl(existingUrl, segmentId);
      } else {
        // Fallback or synthesize
        synthesizeSegment(segmentId, text, voiceId);
      }
    }
  };

  const downloadSegmentMp3 = async (segmentId: string, text: string, voiceId: string, title: string) => {
    const existingUrl = synthesizedUrls[segmentId];
    if (existingUrl) {
      triggerBrowserDownload(existingUrl, `${title}.mp3`);
    } else {
      if (!elevenlabsKey) {
        toast.error('Необходим ElevenLabs API-ключ для экспорта MP3-файлов');
        return;
      }
      
      const toastId = toast.loading('Генерация MP3 пакета от ElevenLabs...');
      try {
        const audioUrl = await generatePodcastAudio({
          text,
          voiceId,
          apiKey: elevenlabsKey,
        });
        setSynthesizedUrls(prev => ({ ...prev, [segmentId]: audioUrl }));
        triggerBrowserDownload(audioUrl, `${title}.mp3`);
        toast.success('Аудио загружено на компьютер!', { id: toastId });
      } catch (err: any) {
        console.error(err);
        toast.error(`Сбой: ${err.message}`, { id: toastId });
      }
    }
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
    synthesizedUrls,
    synthesizingId,
    playingId,
    togglePlaySegment,
    downloadSegmentMp3,
    stopCurrentAudio
  };
}
