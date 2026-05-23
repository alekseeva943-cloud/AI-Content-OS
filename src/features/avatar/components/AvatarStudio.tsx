import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Play, Download, Pause, Video, User, Clock, ArrowRight, 
  Edit2, Save, X, RotateCcw, FileText, Settings, Layers, Activity, 
  CheckCircle2, AlertTriangle, Trash2, HelpCircle, Volume2, Briefcase, 
  Glasses, BookOpen, Palette, Info, Copy, Share2
} from 'lucide-react';

import { useAvatarStudio } from '../hooks/useAvatarStudio';
import { DEFAULT_AVATARS, CATEGORY_LABELS, GENDER_LABELS } from '../constants/avatar.constants';
import { Avatar, ScriptScene } from '../types/avatar.types';

export function AvatarStudio() {
  const {
    topic, setTopic,
    context, setContext,
    durationMinutes, setDurationMinutes,
    selectedAvatar, setSelectedAvatar,
    script, setScript,
    isGeneratingScript,
    generateScript,

    // Editing State
    hookEditVal, setHookEditVal,
    scenesEditVals, setScenesEditVals,
    isEditingHook, setIsEditingHook,
    editingSceneId, setEditingSceneId,
    isDirty, setIsDirty,
    handleSaveHook,
    handleSaveScene,

    // Generation Progress
    stage,
    progressPercent,
    statusMessage,
    elapsedSeconds,
    renderedVideoUrl,
    renderedThumbnailUrl,
    estimatedCost,
    requestCount,
    errorMessage,
    triggerVideoRender,
    cancelGeneration,
    heygenApiKey,
    renderHistory,
    selectHistoryItem,
    deleteHistoryItem
  } = useAvatarStudio();

  // Local states for video player, downloads and debug diagnostics (Requirements 5 & 6)
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackStatus, setPlaybackStatus] = useState<'paused' | 'playing' | 'ended'>('paused');
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'completed' | 'error'>('idle');
  const [blobSize, setBlobSize] = useState<string>('N/A');
  const [isPlayerInitialized, setIsPlayerInitialized] = useState<boolean>(false);

  const handleDownloadMp4 = async () => {
    if (!renderedVideoUrl) return;
    setDownloadStatus('downloading');
    try {
      const resp = await fetch(renderedVideoUrl);
      const blob = await resp.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `avatar_studio_${selectedAvatar.id}_render.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      setDownloadStatus('completed');
      
      const sizeMb = (blob.size / (1024 * 1024)).toFixed(2);
      setBlobSize(`${sizeMb} MB`);
    } catch (err) {
      console.error("Direct download failed, opening URL in new tab instead", err);
      // fallback
      window.open(renderedVideoUrl, '_blank');
      setDownloadStatus('error');
    }
  };

  const handleReplayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(e => console.log('Replay error', e));
    }
  };

  // Avatar filter states
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'business' | 'casual' | 'educational' | 'creative'>('all');
  const [hoveredAvatarId, setHoveredAvatarId] = useState<string | null>(null);

  // Filtered avatars helper
  const filteredAvatars = DEFAULT_AVATARS.filter(av => {
    const gdMatch = selectedGender === 'all' || av.gender === selectedGender;
    const catMatch = selectedCategory === 'all' || av.category === selectedCategory;
    return gdMatch && catMatch;
  });

  // Track active scene audio preview state (simulating voice preview)
  const [playingVoiceAvatarId, setPlayingVoiceAvatarId] = useState<string | null>(null);
  const voiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startVoicePreview = (avatar: Avatar) => {
    if (playingVoiceAvatarId) {
      stopVoicePreview();
      return;
    }
    setPlayingVoiceAvatarId(avatar.id);
    
    // Play synthesis voice preview audio (Requirement 4: improved humanized voice preview loop)
    const previewTexts = [
      'Привет! Я Ваш персональный ИИ аватар. Сгенерируйте сценарий, и мы запишем профессиональное видео за считанные минуты.',
      'Рада общению! Мой голос оптимизирован для естественного звучания, без роботизированной монотонности.',
      'Здравствуйте! Давайте вместе соберем кинематографичное образовательное видео по вашему сценарию.'
    ];

    const synthesis = window.speechSynthesis;
    if (synthesis) {
      synthesis.cancel();
      const randomText = previewTexts[Math.floor(Math.random() * previewTexts.length)];
      const utterance = new SpeechSynthesisUtterance(randomText);
      utterance.lang = 'ru-RU';
      utterance.rate = 1.0;
      utterance.onend = () => {
        setPlayingVoiceAvatarId(null);
      };
      utterance.onerror = () => {
        setPlayingVoiceAvatarId(null);
      };
      synthesis.speak(utterance);
    } else {
      voiceTimeoutRef.current = setTimeout(() => {
        setPlayingVoiceAvatarId(null);
      }, 3500);
    }
  };

  const stopVoicePreview = () => {
    const synthesis = window.speechSynthesis;
    if (synthesis) {
      synthesis.cancel();
    }
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
    }
    setPlayingVoiceAvatarId(null);
  };

  useEffect(() => {
    return () => {
      stopVoicePreview();
    };
  }, []);

  const [copiedScript, setCopiedScript] = useState(false);
  const handleCopyFullScript = () => {
    if (!script) return;
    const fullText = `[Заголовок]: ${script.title}\n[Описание]: ${script.description}\n\n[Хук (Вступление)]:\n${script.hook}\n\n` + 
      script.scenes.map((s, idx) => `[Сцена ${idx+1}]:\n- Описание кадра: ${s.visuals}\n- Реплика спикера: ${s.narration}`).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const getStageLabel = (curStage: string) => {
    switch (curStage) {
      case 'building_script': return '[1] Создание структуры';
      case 'preparing_payload': return '[2] Конфигурация полезной нагрузки';
      case 'sending_request': return '[3] Постановка в очередь HeyGen';
      case 'waiting_render': return '[4] Синхронный рендеринг видео в облаке';
      case 'fetching_asset': return '[5] Загрузка готового медиафайла';
      case 'finalizing_player': return '[6] Финализация медиаплеера';
      default: return 'Ожидание';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-slate-50 min-h-screen text-slate-800 font-sans" id="avatar_studio_root">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 mb-8" id="studio_header_wrapper">
        <div id="studio_title_meta">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-rose-500/10 text-rose-600 text-[10px] font-mono font-medium uppercase tracking-widest px-2.5 py-1 rounded-full border border-rose-500/20">
              Podcast Studio Add-On
            </span>
            <span className="bg-indigo-500/10 text-indigo-600 text-[10px] font-mono font-medium uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-500/20">
              V2 Engine
            </span>
          </div>
          <h1 className="text-3xl font-normal tracking-tight text-slate-900" id="studio_title">
            AI Avatar Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Полноценная видеорепликация аватаров на движке HeyGen и улучшенном ElevenLabs голосовом конвейере подкастов.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm" id="studio_top_counters">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-slate-400">Пул генераций</div>
            <div className="text-sm font-semibold text-slate-800">{requestCount} попыток</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-slate-400">Баланс HeyGen</div>
            <div className="text-sm font-semibold text-emerald-600">Активен (Ключ {heygenApiKey ? 'задан' : 'Sim'})</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="studio_workspace_grid">
        {/* Left Control Column (Steps 1 to 3) */}
        <div className="lg:col-span-4 space-y-6" id="left_config_column">
          
          {/* Step 1: Topic Selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4" id="step_1_box">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-5 h-5 flex items-center justify-center bg-slate-900 text-white rounded-full text-xs font-mono">1</span>
              <h3 className="font-medium text-slate-900 text-sm tracking-tight">Тема выпуска</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">О чем видео-аватар?</label>
                <input
                  type="text"
                  placeholder="Пример: Топ-3 тренда в ИИ на 2026 год"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50"
                  id="avatar_topic_input"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Дополнительный контекст / Целевые тезисы</label>
                <textarea
                  placeholder="Добавьте факты, ссылки, цифры или манеру повествования..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 resize-none"
                  id="avatar_context_input"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Duration settings Selector */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4" id="step_3_box">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-5 h-5 flex items-center justify-center bg-slate-900 text-white rounded-full text-xs font-mono">2</span>
              <h3 className="font-medium text-slate-900 text-sm tracking-tight">Длительность и тайминги</h3>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-500 block">Целевой хронометраж: {durationMinutes} мин.</label>
              
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 5, 10].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                      durationMinutes === mins 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {mins} мин
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                При изменении длительности ИИ адаптирует количество сцен и глубинность устных аргументов.
              </p>
            </div>
          </div>

          {/* Action Trigger for Script Generation */}
          <div className="space-y-3" id="script_generate_trigger_area">
            <button
              onClick={generateScript}
              disabled={isGeneratingScript || !topic.trim() || stage !== 'idle'}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed py-3.5 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
              id="script_generate_btn"
            >
              {isGeneratingScript ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Сочиняем сценарий...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Сгенерировать сценарий ИИ</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              * Раздельная архитектура: Сценарий можно редактировать перед запуском видео-рендеринга.
            </p>
          </div>

          {/* Step 2: Avatar selection Library Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4" id="step_2_box">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-slate-900 text-white rounded-full text-xs font-mono">3</span>
                <h3 className="font-medium text-slate-900 text-sm tracking-tight">Библиотека аватаров v2</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {DEFAULT_AVATARS.length} профилей
              </span>
            </div>

            {/* Avatar Filters */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 overflow-x-auto pb-1" id="gender_filter_row">
                <button
                  onClick={() => setSelectedGender('all')}
                  className={`px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider rounded-md border transition-all ${
                    selectedGender === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Все полы
                </button>
                <button
                  onClick={() => setSelectedGender('male')}
                  className={`px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider rounded-md border transition-all ${
                    selectedGender === 'male' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {GENDER_LABELS.male}
                </button>
                <button
                  onClick={() => setSelectedGender('female')}
                  className={`px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider rounded-md border transition-all ${
                    selectedGender === 'female' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {GENDER_LABELS.female}
                </button>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1" id="category_filter_row">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded-md border transition-all ${
                    selectedCategory === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Все стили
                </button>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as any)}
                    className={`px-2.5 py-1 text-[10px] font-mono whitespace-nowrap rounded-md border transition-all ${
                      selectedCategory === key ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Cards Grid */}
            <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1" id="avatar_cards_grid">
              {filteredAvatars.map((avatar) => {
                const isSelected = selectedAvatar.id === avatar.id;
                const isHovered = hoveredAvatarId === avatar.id;
                const isPlayingVoice = playingVoiceAvatarId === avatar.id;

                return (
                  <div
                    key={avatar.id}
                    onMouseEnter={() => setHoveredAvatarId(avatar.id)}
                    onMouseLeave={() => setHoveredAvatarId(null)}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`relative rounded-2xl overflow-hidden border cursor-pointer group transition-all duration-300 ${
                      isSelected 
                        ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-2' 
                        : 'border-slate-200 hover:border-slate-400 bg-slate-50'
                    }`}
                    id={`avatar_card_${avatar.id}`}
                  >
                    {/* Visual Anchor Container (Image or Autoplay Video) */}
                    <div className="aspect-square relative w-full overflow-hidden bg-slate-100">
                      {isHovered ? (
                        <video
                          src={avatar.previewVideo}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={avatar.thumbnail}
                          alt={avatar.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      {/* Micro Visual Hover Indicator Badge */}
                      <span className="absolute top-2 left-2 bg-slate-900/85 text-white text-[9px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                        {CATEGORY_LABELS[avatar.category]}
                      </span>

                      {/* Play Preview Audio Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startVoicePreview(avatar);
                        }}
                        className={`absolute bottom-2 right-2 p-1.5 rounded-full backdrop-blur shadow-md transition-all ${
                          isPlayingVoice 
                            ? 'bg-rose-500 text-white' 
                            : 'bg-white/85 text-slate-700 hover:bg-white'
                        }`}
                        title="Прослушать образец голоса"
                      >
                        {isPlayingVoice ? (
                          <Volume2 className="w-3_5 h-3_5 animate-pulse" />
                        ) : (
                          <Play className="w-3_5 h-3_5" />
                        )}
                      </button>
                    </div>

                    <div className="p-2.5 bg-white">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-slate-800">{avatar.name}</span>
                        <span className="text-[9px] font-mono text-slate-400">{avatar.language.split(' ')[0]}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate leading-tight">
                        {avatar.speakingStyle}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-slate-100">
                        <span className="text-[9px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                          Энергия: {avatar.energyLevel}/10
                        </span>
                        <span className="text-[9px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                          {avatar.avatarStyle === 'close-up' ? 'Крупно' : 'Норм'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Selected Details */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-500" id="avatar_details_footer">
              <div className="font-semibold text-slate-700 mb-1">Выбран: {selectedAvatar.name}</div>
              <p className="leading-relaxed leading-normal">{selectedAvatar.description}</p>
            </div>
          </div>

        </div>

        {/* Right Stage Column (Steps 4 to 7) */}
        <div className="lg:col-span-8 space-y-6" id="right_stage_column">
          
          {/* Main Empty State or Interactive Scripting panel */}
          {!script && !isGeneratingScript ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center min-h-[450px]" id="empty_studio_panel">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <Video className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-normal text-slate-800 mt-2">Сценарий еще не спроектирован</h2>
              <p className="text-sm text-slate-400 max-w-md mt-2 leading-relaxed">
                Введите тему и тезисы вашего видео-аватара слева, настройте общую длительность и нажмите кнопку создания. Сценарий будет разделен на Hook-отсек и серию сцен с визуальной раскадровкой.
              </p>
            </div>
          ) : isGeneratingScript ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center h-full flex flex-col items-center justify-center min-h-[450px]" id="loading_studio_panel">
              <div className="relative mb-6">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                <Sparkles className="w-5 h-5 text-slate-600 absolute top-3.5 left-3.5 animate-bounce" />
              </div>
              <h2 className="text-base font-semibold text-slate-850">Choreographing scenes & scripts...</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Мы создаем цепляющий Hook, продумываем мимику, жесты, детальные описания визуального наполнения слайдов и наполняем контент фактурой.
              </p>
            </div>
          ) : (
            // Steps 4 & 5: Script Loaded & Editor mode active
            <div className="space-y-6" id="script_loaded_workspace">
              
              {/* Script Title & Metadata Header Summary */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4" id="script_details_box">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border border-emerald-500/20">
                        Сценарий готов
                      </span>
                      {isDirty && (
                        <span className="bg-amber-500/10 text-amber-600 text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                          Модифицирован
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-slate-850 mt-1.5">{script.title}</h2>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyFullScript}
                      className="py-1.5 px-3 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedScript ? 'Скопировано!' : 'Копировать'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-slate-400 block mb-0.5">Краткое резюме выпуска</span>
                    <p className="text-slate-600 leading-relaxed">{script.summary}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400 block mb-0.5">Caption Styles (Субтитры)</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono text-[10px]">Шрифт: {script.captionStyles?.font}</span>
                      <span className="bg-slate-150 text-slate-700 px-2 py-1 rounded font-mono text-[10px]" style={{ color: script.captionStyles?.color }}>Цвет: {script.captionStyles?.color}</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono text-[10px]">Эффект: {script.captionStyles?.animation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5: Inline script editing Section (No modals constraint) */}
              <div className="space-y-4" id="inline_editor_layout">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold tracking-tight text-slate-800 uppercase font-mono">
                    Конвейер Реплик Спикера ({script.scenes.length + 1})
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Нажмите кнопку изменения, чтобы скорректировать текст без всплывающих окон.
                  </span>
                </div>

                {/* Part A: The Hook */}
                <div className="bg-gradient-to-r from-violet-500/5 to-indigo-500/5 p-5 rounded-2xl border border-indigo-100 shadow-sm" id="hook_section_interactive">
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <span className="inline-block bg-indigo-500 text-white text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-md mb-1 shadow-sm">
                        Хук (Вступление)
                      </span>
                      <h4 className="text-[11px] font-mono text-slate-400">Стартовая фраза удержания аудитории (первых 5 секунд)</h4>
                    </div>

                    {!isEditingHook ? (
                      <button
                        onClick={() => setIsEditingHook(true)}
                        className="p-1 px-2.5 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Изменить</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleSaveHook}
                          className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <Save className="w-3" />
                          <span>Сохранить</span>
                        </button>
                        <button
                          onClick={() => {
                            setHookEditVal(script.hook);
                            setIsEditingHook(false);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditingHook ? (
                    <blockquote className="text-sm text-indigo-950 font-normal italic pl-3 border-l-2 border-indigo-400 leading-relaxed">
                      "{script.hook}"
                    </blockquote>
                  ) : (
                    <div className="space-y-2 mt-1.5">
                      <textarea
                        value={hookEditVal}
                        onChange={(e) => setHookEditVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            handleSaveHook();
                          }
                        }}
                        rows={2}
                        className="w-full text-sm p-3 rounded-xl border border-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                        placeholder="Напишите цепляющее введение..."
                      />
                      <span className="text-[10px] text-slate-400 text-right block">Ctrl + Enter для сохранения</span>
                    </div>
                  )}
                </div>

                {/* Part B: Scene by Scene sequence */}
                <div className="space-y-3.5" id="scenes_stack">
                  {script.scenes.map((scene, idx) => {
                    const isEditing = editingSceneId === scene.id;
                    const editVals = scenesEditVals[scene.id] || { narration: '', visuals: '' };

                    return (
                      <div
                        key={scene.id}
                        className={`p-5 rounded-2xl border transition-all duration-300 ${
                          isEditing 
                            ? 'bg-emerald-50/20 border-emerald-200 shadow-md' 
                            : 'bg-white border-slate-200 hover:border-slate-350 shadow-sm'
                        }`}
                        id={`scene_editor_item_${scene.id}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 flex items-center justify-center bg-slate-900 text-white rounded-full text-[10px] font-mono leading-none font-bold">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400">
                                Сцена сценария
                              </span>
                              <div className="flex items-center gap-2.5 mt-0.5">
                                <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 rounded font-medium">Эмоции: {scene.emotion}</span>
                                <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 rounded font-medium">Жест: {scene.gesture}</span>
                              </div>
                            </div>
                          </div>

                          {!isEditing ? (
                            <button
                              onClick={() => setEditingSceneId(scene.id)}
                              className="p-1 px-2.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Изменить</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleSaveScene(scene.id, editVals.narration, editVals.visuals)}
                                className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                              >
                                <Save className="w-3" />
                                <span>Сохранить</span>
                              </button>
                              <button
                                onClick={() => {
                                  const resetVals = { ...scenesEditVals };
                                  resetVals[scene.id] = { narration: scene.narration, visuals: scene.visuals };
                                  setScenesEditVals(resetVals);
                                  setEditingSceneId(null);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-600 transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {!isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
                            {/* Visual instructions column */}
                            <div className="md:col-span-5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block mb-1">Визуальный план</span>
                              <p className="text-xs text-slate-600 leading-normal font-medium">{scene.visuals}</p>
                            </div>

                            {/* Narration voice column */}
                            <div className="md:col-span-7 pl-1">
                              <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block mb-1">Реплика спикера</span>
                              <p className="text-sm text-slate-800 leading-relaxed font-normal">"{scene.narration}"</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 mt-3">
                            <div>
                              <label className="text-[9px] font-mono uppercase font-bold text-slate-400 block mb-1">Раскадровка / Инструкции кадра</label>
                              <input
                                type="text"
                                value={editVals.visuals}
                                onChange={(e) => {
                                  const updated = { ...scenesEditVals };
                                  updated[scene.id] = { ...editVals, visuals: e.target.value };
                                  setScenesEditVals(updated);
                                }}
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                                placeholder="Что описывает слайд или презентует аватар..."
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-mono uppercase font-bold text-slate-400 block mb-1">Озвучиваемый текст аватара</label>
                              <textarea
                                value={editVals.narration}
                                onChange={(e) => {
                                  const updated = { ...scenesEditVals };
                                  updated[scene.id] = { ...editVals, narration: e.target.value };
                                  setScenesEditVals(updated);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    handleSaveScene(scene.id, editVals.narration, editVals.visuals);
                                  }
                                }}
                                rows={2}
                                className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-white"
                                placeholder="Текст для озвучки..."
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 text-right block">Ctrl + Enter для сохранения</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 6 & 7: Trigger Cloud Rendering Block */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5" id="rendering_progress_panel">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-150 pb-4 gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base">Медиаконвейер рендеринга</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Компиляция озвученного текста на основе выбранной мимики {selectedAvatar.name}.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-150">
                      Эст. расход: <b className="font-semibold text-rose-600">${estimatedCost > 0 ? estimatedCost : '0.40'}</b> / миссия
                    </span>
                  </div>
                </div>

                {stage === 'idle' && !renderedVideoUrl ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-4">
                    <div className="w-12 h-12 bg-white text-slate-500 rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-slate-800 text-sm">Все готово к выпуску</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal">
                        Конвейер готов собрать воедино аватар <b>{selectedAvatar.name}</b>, настроить голос <b>{selectedAvatar.gender === 'male' ? 'Adam' : 'Rachel'}</b> и экспортировать в HD MP4.
                      </p>
                    </div>

                    <button
                      onClick={triggerVideoRender}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-6 rounded-xl text-xs transition-all tracking-tight inline-flex items-center gap-2 shadow-sm"
                      id="launch_render_btn"
                    >
                      <Activity className="w-4 h-4 animate-pulse" />
                      <span>Генерировать видео-аватар</span>
                    </button>
                  </div>
                ) : (stage !== 'idle' && stage !== 'error') ? (
                  // Requirements 8 & 9: Detailed multi-stage progress pipeline metrics
                  <div className="space-y-4 p-5 bg-slate-950 text-slate-100 rounded-2xl shadow-xl font-mono relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-rose-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                      <span>{getStageLabel(stage)}</span>
                      <span className="text-emerald-400">{progressPercent}%</span>
                    </div>

                    {/* Sequential Trace Timers */}
                    <div className="space-y-1 text-[10px] text-slate-350">
                      <div className="flex justify-between">
                        <span>[1] Создание структуры:</span>
                        <span className={progressPercent >= 15 ? 'text-emerald-400' : 'text-slate-500'}>
                          {progressPercent >= 15 ? 'ВЫПОЛНЕНО ✓' : 'РЕНДЕРИНГ...'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>[2] Конфигурация payload:</span>
                        <span className={progressPercent >= 30 ? 'text-emerald-400' : (progressPercent >= 15 ? 'МЕППИНГ...' : 'ОЖИДАНИЕ')}>
                          {progressPercent >= 30 ? 'ВЫПОЛНЕНО ✓' : (progressPercent >= 15 ? 'ОБРАБОТКА...' : 'ОЖИДАНИЕ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>[3] HeyGen API Call:</span>
                        <span className={progressPercent >= 40 ? 'text-emerald-400' : (progressPercent >= 30 ? 'ЗАПРОС...' : 'ОЖИДАНИЕ')}>
                          {progressPercent >= 40 ? 'УСПЕШНО queued ✓' : (progressPercent >= 30 ? 'ОБРАЩЕНИЕ...' : 'ОЖИДАНИЕ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>[4] Облачный рендеринг:</span>
                        <span className={progressPercent >= 95 ? 'text-emerald-400' : (progressPercent >= 40 ? 'ПОТОКОВЫЙ РЕНДЕР...' : 'ОЖИДАНИЕ')}>
                          {progressPercent >= 95 ? 'ВЫПОЛНЕНО ✓' : (progressPercent >= 40 ? 'РЕНДЕРИНГ И ЯДРО (polling)...' : 'ОЖИДАНИЕ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px]">Времени прошло:</span>
                        <span className="text-rose-400 font-bold">{elapsedSeconds} сек</span>
                      </div>
                      
                      <button
                        onClick={cancelGeneration}
                        className="py-1 px-3 bg-red-950/40 text-red-400 hover:bg-red-900/30 border border-red-900/40 rounded text-[10px] transition-all"
                      >
                        Отменить
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-500 leading-normal text-center pt-1.5 border-t border-slate-900">
                      {statusMessage}
                    </div>
                  </div>
                ) : errorMessage ? (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-150 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-red-800">Ошибка конвейера</div>
                      <p className="mt-1 leading-normal leading-relaxed">{errorMessage}</p>
                    </div>
                  </div>
                ) : null}

                {/* Step 7: Final Player Output */}
                {renderedVideoUrl && (
                  <div className="space-y-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm" id="player_terminal">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-slate-800">Финальный видеорендер ({selectedAvatar.name})</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">ID: {selectedAvatar.id}</span>
                    </div>

                    {/* Embedding Video Player */}
                    <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-105 shadow-md relative bg-black">
                      <video
                        ref={videoRef}
                        src={renderedVideoUrl}
                        controls
                        poster={renderedThumbnailUrl || undefined}
                        className="w-full h-full object-contain"
                        id="rendered_player_tag"
                        onPlay={() => setPlaybackStatus('playing')}
                        onPause={() => setPlaybackStatus('paused')}
                        onEnded={() => setPlaybackStatus('ended')}
                        onLoadedMetadata={() => setIsPlayerInitialized(true)}
                        preload="auto"
                      />
                    </div>

                    {/* VIDEO DEBUG PANEL (Requirement 5) */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs font-mono text-slate-600 animate-fade-in" id="video_debug_panel">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5 mb-1 font-semibold text-slate-800">
                        <Activity className="w-3.5 h-3.5 text-indigo-500" />
                        <span>AVATAR VIDEO DIAGNOSTICS DETAILED</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400">render_id: </span>
                          <span className="text-slate-800 select-all font-semibold break-all">
                            {renderedVideoUrl.split('?')[0].split('/').pop() || 'sim_render_hash'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">avatar_id: </span>
                          <span className="text-slate-800 font-semibold">{selectedAvatar.id}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">playback status: </span>
                          <span className={`font-semibold capitalize ${playbackStatus === 'playing' ? 'text-emerald-600' : 'text-slate-500'}`}>
                            • {playbackStatus}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">preload state: </span>
                          <span className="text-slate-800 font-semibold">{isPlayerInitialized ? 'Loaded (Buffer Ready)' : 'Preloading...'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">blob size: </span>
                          <span className="text-slate-800 font-semibold">{blobSize}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">download status: </span>
                          <span className={`font-semibold ${downloadStatus === 'downloading' ? 'text-amber-600' : (downloadStatus === 'completed' ? 'text-emerald-600' : 'text-slate-500')}`}>
                            {downloadStatus}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 mt-2 text-[10px] break-all leading-normal flex items-center justify-between">
                        <div>
                          <span className="text-slate-400">resolved video_url: </span>
                          <a href={renderedVideoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">
                            {renderedVideoUrl}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Replay Download, copy Script button, voice actions */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2" id="player_actions">
                      <button
                        onClick={handleDownloadMp4}
                        disabled={downloadStatus === 'downloading'}
                        className="py-2.5 px-4 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        {downloadStatus === 'downloading' ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{downloadStatus === 'downloading' ? 'Загрузка...' : 'Скачать MP4 видео'}</span>
                      </button>

                      <button
                        onClick={handleReplayVideo}
                        className="py-2.5 px-4 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Повторить (Replay)</span>
                      </button>

                      <button
                        onClick={triggerVideoRender}
                        className="py-2.5 px-4 bg-white text-slate-750 border border-slate-200 hover:bg-slate-50 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Пересобрать видео</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Render History Panel (Requirement 11) */}
                {renderHistory.length > 0 && (
                  <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-3" id="render_history_panel">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                       <div className="flex items-center gap-1.5">
                         <Layers className="w-4 h-4 text-slate-500" />
                         <span className="text-xs uppercase font-mono tracking-wider font-bold text-slate-500">Последние рендеры (История)</span>
                       </div>
                       <span className="text-[10px] text-slate-400">Сохранено: {renderHistory.length}/5</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {renderHistory.map((item) => {
                        const isCurrentActive = renderedVideoUrl === item.videoUrl;
                        return (
                          <button 
                            key={item.id}
                            onClick={() => selectHistoryItem(item)}
                            className={`p-1.5 rounded-xl border transition-all cursor-pointer group text-left relative block focus:outline-none ${
                              isCurrentActive 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-1 ring-slate-900' 
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-200 relative">
                              <img src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-all flex items-center justify-center">
                                <Play className="w-5 h-5 text-white drop-shadow-md" />
                              </div>
                            </div>
                            <div className="mt-1.5 px-0.5">
                              <p className={`text-[10px] font-semibold truncate leading-tight ${isCurrentActive ? 'text-white' : 'text-slate-800'}`}>
                                {item.topic}
                              </p>
                              <div className="flex items-center justify-between mt-1 text-[8px] opacity-70">
                                <span className="font-mono">{item.avatar.name}</span>
                                <span>{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => deleteHistoryItem(item.id, e)}
                              className="absolute top-2 right-2 p-1 bg-white/90 text-red-600 hover:bg-white rounded-full shadow transition-opacity opacity-0 group-hover:opacity-100"
                              title="Удалить рендер"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
