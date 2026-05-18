import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Target, 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  HeartPulse,
  MonitorPlay,
  Check,
  Flag,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface AdvancedSettingsState {
  preset: string;
  goal: string;
  audience: string;
  tone: string;
  formality: number;
  emotion: number;
  length: 'short' | 'balanced' | 'long';
  complexity: 'simple' | 'standard' | 'pro';
}

interface AdvancedSettingsProps {
  values: AdvancedSettingsState;
  onChange: (key: keyof AdvancedSettingsState, value: any) => void;
}

export function AdvancedSettings({ values, onChange }: AdvancedSettingsProps) {
  const PRESETS = [
    { id: 'business', label: 'Бизнес' },
    { id: 'sell', label: 'Продажа' },
    { id: 'expert', label: 'Эксперт' },
    { id: 'dialog', label: 'Диалог' },
  ];

  const GOALS = [
    { id: 'sell', title: 'Продать', desc: 'Убедительный тон, акцент на...' },
    { id: 'convince', title: 'Убедить', desc: 'Логическая аргументация,...' },
    { id: 'explain', title: 'Объяснить', desc: 'Четкая структура,...' },
    { id: 'simplify', title: 'Упростить', desc: 'Минимум терминов, короткие...' },
    { id: 'motivate', title: 'Мотивировать', desc: 'Вдохновляющая лексика,...' },
    { id: 'formalize', title: 'Формализовать', desc: 'Строгий этикет, отсутствие...' },
    { id: 'emotion', title: 'Добавить эмоций', desc: 'Живой язык, использование...' },
  ];

  const AUDIENCES = [
    { id: 'child', title: 'Ребенок', desc: 'Игровые формы, очень простые...' },
    { id: 'teen', title: 'Подросток', desc: 'Современный сленг (аккуратно)...' },
    { id: 'newbie', title: 'Новичок', desc: 'Объяснение базовых терминов,...' },
    { id: 'business', title: 'Бизнес-аудитория', desc: 'Лаконичность, акцент на...' },
    { id: 'expert', title: 'Эксперт', desc: 'Использование сложной...' },
    { id: 'client', title: 'Клиент', desc: 'Фокус на сервисе, вежливость...' },
  ];

  const TONES = [
    { id: 'neutral', title: 'Нейтральный', desc: 'Спокойный, объективный, без...' },
    { id: 'friendly', title: 'Дружелюбный', desc: 'Теплый, открытый,...' },
    { id: 'professional', title: 'Профессиональный', desc: 'Сдержанный, компетентный,...' },
    { id: 'inspiring', title: 'Вдохновляющий', desc: 'Энергичный, позитивный,...' },
    { id: 'confident', title: 'Уверенный', desc: 'Твердый, решительный, четкие...' },
    { id: 'expert_tone', title: 'Экспертный', desc: 'Авторитетный, аналитический,...' },
    { id: 'strict', title: 'Дискретный/Строгий', desc: 'Доминирующий, настойчивый,...' },
  ];

  return (
    <div className="pt-8 space-y-12">
      {/* Header Info */}
      <div className="flex items-center gap-3 pb-2 border-b border-[#F3F4F6]">
        <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1]">
          <MonitorPlay size={18} />
        </div>
        <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">Параметры интонации</h3>
      </div>

      {/* Quick Presets */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-500 fill-amber-500/20" />
          <span className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Быстрые пресеты</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => onChange('preset', p.id)}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-bold transition-all border",
                values.preset === p.id 
                  ? "bg-[#6366F1] border-[#6366F1] text-white shadow-lg shadow-[#6366F1]/20" 
                  : "bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Communication Goal */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-[#9CA3AF]" />
          <span className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Цель коммуникации</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map(g => (
             <SelectionCard 
                key={g.id}
                title={g.title}
                desc={g.desc}
                active={values.goal === g.id}
                onClick={() => onChange('goal', g.id)}
             />
          ))}
        </div>
      </div>

      {/* Target Audience */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#9CA3AF]" />
          <span className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Целевая аудитория</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {AUDIENCES.map(a => (
             <SelectionCard 
                key={a.id}
                title={a.title}
                desc={a.desc}
                active={values.audience === a.id}
                onClick={() => onChange('audience', a.id)}
             />
          ))}
        </div>
      </div>

      {/* Tone of Delivery */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#9CA3AF]" />
          <span className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Тон изложения</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TONES.map(t => (
             <SelectionCard 
                key={t.id}
                title={t.title}
                desc={t.desc}
                active={values.tone === t.id}
                onClick={() => onChange('tone', t.id)}
             />
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-10 pt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[#6366F1]">
              <ShieldCheck size={20} />
              <span className="text-[13px] font-bold text-[#374151]">Формальность</span>
            </div>
            <div className="px-2 py-1 rounded-lg bg-[#6366F1]/5 border border-[#6366F1]/20 text-[11px] font-black text-[#6366F1]">
              {values.formality}%
            </div>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={values.formality}
            onChange={(e) => onChange('formality', parseInt(e.target.value))}
            className="w-full h-1.5 bg-[#E5E7EB] rounded-full appearance-none cursor-pointer accent-[#6366F1]"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[#F43F5E]">
              <HeartPulse size={20} />
              <span className="text-[13px] font-bold text-[#374151]">Эмоциональный интеллект</span>
            </div>
            <div className="px-2 py-1 rounded-lg bg-[#F43F5E]/5 border border-[#F43F5E]/20 text-[11px] font-black text-[#F43F5E]">
              {values.emotion}%
            </div>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={values.emotion}
            onChange={(e) => onChange('emotion', parseInt(e.target.value))}
            className="w-full h-1.5 bg-[#E5E7EB] rounded-full appearance-none cursor-pointer accent-[#F43F5E]"
          />
        </div>
      </div>

      {/* Segmented Controls */}
      <div className="space-y-8 pt-4">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] ml-1">Длина текста</label>
          <div className="flex p-1 bg-[#F3F4F6] rounded-2xl border border-[#E5E7EB]">
            {[
              { id: 'short', label: 'Короче' },
              { id: 'balanced', label: 'Сбалансировано' },
              { id: 'long', label: 'Длиннее' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => onChange('length', l.id)}
                className={cn(
                  "flex-1 py-3.5 rounded-xl text-[12px] font-bold transition-all",
                  values.length === l.id ? "bg-white text-[#111827] shadow-sm" : "text-[#9CA3AF] hover:text-[#6B7280]"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] ml-1">Сложность терминов</label>
          <div className="flex p-1 bg-[#F3F4F6] rounded-2xl border border-[#E5E7EB]">
            {[
              { id: 'simple', label: 'Простая' },
              { id: 'standard', label: 'Стандартная' },
              { id: 'pro', label: 'Техническая' }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => onChange('complexity', c.id)}
                className={cn(
                  "flex-1 py-3.5 rounded-xl text-[12px] font-bold transition-all",
                  values.complexity === c.id ? "bg-white text-[#111827] shadow-sm" : "text-[#9CA3AF] hover:text-[#6B7280]"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectionCard({ title, desc, active, onClick }: { title: string; desc: string; active: boolean; onClick: () => void; key?: string | number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-5 text-left border rounded-2xl transition-all relative group",
        active 
          ? "bg-[#6366F1]/5 border-[#6366F1] shadow-lg shadow-[#6366F1]/10" 
          : "bg-white border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-md"
      )}
    >
      <div className="flex justify-between items-start mb-1.5">
        <span className={cn(
          "text-[14px] font-black leading-none transition-colors",
          active ? "text-[#6366F1]" : "text-[#374151]"
        )}>{title}</span>
        {active && (
           <div className="w-4 h-4 rounded-full bg-[#6366F1] text-white flex items-center justify-center">
              <Check size={10} strokeWidth={3} />
           </div>
        )}
      </div>
      <p className="text-[11px] text-[#9CA3AF] font-medium leading-relaxed line-clamp-1">{desc}</p>
    </button>
  );
}
