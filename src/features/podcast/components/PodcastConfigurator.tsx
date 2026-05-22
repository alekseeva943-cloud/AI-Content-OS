import React, { useState, useEffect } from 'react';
import { PodcastConfig, GuestConfig } from '../types/podcast.types';
import { useWorkspaceStore } from '@/src/stores/workspaceStore';
import { Button } from '@/src/shared/components/UI';
import { 
  Sliders, 
  Mic, 
  UserPlus, 
  Sparkles, 
  Clock, 
  Lightbulb, 
  Activity, 
  MessageCircle,
  Zap,
  ChevronDown
} from 'lucide-react';

interface PodcastConfiguratorProps {
  onGenerate: (config: PodcastConfig) => void;
  isGenerating: boolean;
}

const DEFAULT_TOPICS = [
  'Как нейросети меняют маркетинг в 2026 году',
  'Масштабирование бизнеса через франчайзинг',
  'Эмоциональное выгорание в IT и способы борьбы',
  'Личный бренд эксперта с нуля без бюджетов'
];

export function PodcastConfigurator({ onGenerate, isGenerating }: PodcastConfiguratorProps) {
  // Pull topics from Planner
  const plannerModule = useWorkspaceStore((state) => state.modules['planner']);
  const plannerItems = plannerModule?.result?.items || [];
  const plannerTopics = Array.from(new Set(plannerItems.map((item: any) => item.topic))).filter(Boolean) as string[];
  const finalTopics = [...plannerTopics, ...DEFAULT_TOPICS];

  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(10); // Default 10 minutes
  const [guestEnabled, setGuestEnabled] = useState(true);
  
  // Guest params
  const [guestName, setGuestName] = useState('Сергей Федоров');
  const [guestExpertise, setGuestExpertise] = useState('Венчурный инвестор, фаундер синдиката');
  const [guestStyle, setGuestStyle] = useState('expert'); // expert, casual, storyteller, bold
  const [energyLevel, setEnergyLevel] = useState(8); // 1 to 10

  // Dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Set first topic as default if available
  useEffect(() => {
    if (finalTopics.length > 0 && !topic) {
      setTopic(finalTopics[0]);
    }
  }, [plannerItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const guestConfig: GuestConfig = {
      name: guestName,
      expertise: guestExpertise,
      speakingStyle: guestStyle,
      energyLevel: energyLevel
    };

    onGenerate({
      topic,
      durationMinutes: duration,
      guestEnabled,
      guest: guestConfig
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left bg-white p-8 md:p-10 border border-neutral-200 shadow-xl rounded-[2.5rem] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-50 to-transparent -z-10 rounded-full" />
      
      {/* Title block */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#047857] text-white flex items-center justify-center shadow-lg shadow-emerald-200">
           <Mic size={24} />
        </div>
        <div>
          <span className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em] block leading-none mb-1">AI Studio</span>
          <h2 className="text-2xl font-bold text-neutral-800 tracking-tight font-display">Настройка выпуска</h2>
        </div>
      </div>

      {/* Topics */}
      <div className="space-y-2">
        <label className="text-[11px] font-black text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 leading-none">
          <Lightbulb size={13} className="text-[#10B981]" />
          Тема выпуска
        </label>
        <div className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Введите тему или выберите из списка..."
              className="flex-1 px-5 py-3.5 rounded-2xl border border-neutral-200 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-sm text-neutral-800 placeholder-neutral-400 bg-white"
            />
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 text-[#10B981] transition-all flex items-center justify-center"
              title="Выбрать готовую тему"
            >
              <ChevronDown size={20} className={`转变-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 p-2 bg-white border border-neutral-100 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest p-2 border-b border-neutral-50">Быстрый выбор темы:</p>
              {finalTopics.map((t, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setTopic(t);
                    setDropdownOpen(false);
                  }}
                  className="p-3 text-xs text-neutral-700 hover:bg-emerald-50 rounded-xl cursor-pointer font-medium transition-all text-left"
                >
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-[11px] text-neutral-400 leading-normal pl-1">
          Вы можете использовать темы, сгенерированные в Планировщике, или ввести совершенно новую.
        </p>
      </div>

      {/* Duration slider */}
      <div className="space-y-3 p-5 rounded-3xl bg-neutral-50/50 border border-neutral-100">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 leading-none">
            <Clock size={13} className="text-[#10B981]" />
            Планируемая длительность
          </label>
          <span className="text-sm font-black text-[#10B981] bg-emerald-100/60 px-2.5 py-1 rounded-full">{duration} минут</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold text-neutral-400">1 мин</span>
          <input
            type="range"
            min="1"
            max="60"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="flex-1 accent-[#10B981] cursor-pointer"
          />
          <span className="text-[11px] font-bold text-neutral-400">60 мин</span>
        </div>
        <p className="text-[11px] text-neutral-400 italic">
          💡 AI автоматически адаптирует глубину сценария, структуру, число реплик и тайминги подкаста под выбранное время.
        </p>
      </div>

      {/* Guest Switch */}
      <div className="flex items-center justify-between p-4 rounded-3xl border border-neutral-150 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <UserPlus size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-800 leading-tight">Пригласить гостя подкаста</h4>
            <p className="text-[11px] text-neutral-500 mt-1">Добавляет второе действующее лицо в сценарии</p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={guestEnabled}
          onChange={(e) => setGuestEnabled(e.target.checked)}
          className="w-5 h-5 accent-[#10B981] rounded cursor-pointer"
        />
      </div>

      {/* Guest detailed parameters */}
      {guestEnabled && (
        <div className="p-6 rounded-3xl bg-neutral-50/50 border border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">ФИО гостя</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Например: Артем Смирнов"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm"
              required={guestEnabled}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">Специализация / Роль</label>
            <input
              type="text"
              value={guestExpertise}
              onChange={(e) => setGuestExpertise(e.target.value)}
              placeholder="Например: Технический директор Яндекса"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm"
              required={guestEnabled}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">Стиль речи гостя</label>
            <select
              value={guestStyle}
              onChange={(e) => setGuestStyle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white"
            >
              <option value="expert">Академический, экспертный подход</option>
              <option value="casual">Простой, дружелюбный и неформальный</option>
              <option value="storyteller">Креативный сторителлер с юмором</option>
              <option value="bold">Прямолинейный, провокационный, энергичный</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">Уровень энергии</label>
              <span className="text-xs font-bold text-neutral-600 bg-neutral-200/50 px-2 py-0.5 rounded-full">{energyLevel}/10</span>
            </div>
            <div className="flex items-center gap-3 py-1">
              <Activity size={14} className="text-neutral-400" />
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                className="flex-1 accent-indigo-500 cursor-pointer h-1 bg-neutral-200 rounded-lg appearance-none"
              />
              <Zap size={14} className="text-indigo-500" />
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <span className="h-2" />
      <Button
        type="submit"
        disabled={isGenerating || !topic.trim()}
        className="w-full justify-center h-14 text-sm font-bold bg-[#111827] text-white hover:bg-[#10B981] transition-all rounded-3xl flex items-center gap-2.5 shadow-xl shadow-neutral-100"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Генерируем уникальный сценарий...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Создать сценарий выпуска подкаста
          </>
        )}
      </Button>
    </form>
  );
}
