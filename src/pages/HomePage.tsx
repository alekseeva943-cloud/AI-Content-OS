import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Zap, Database, BookOpen, Clock, Activity, MessageSquare, Mic2, Video, FileText, LayoutGrid } from 'lucide-react';
import { GlassCard } from '@/src/shared/components/UI';
import { Link } from 'react-router-dom';
import { NAVIGATION_CONFIG } from '@/src/config/navigation';

export function HomePage() {
  const creativeModules = NAVIGATION_CONFIG.filter(item => 
    ['planner', 'newsletter', 'podcasts', 'avatars', 'longreads'].includes(item.id)
  );

  return (
    <div className="space-y-16 pb-24 animate-in fade-in duration-700">
      {/* Premium Hero */}
      <section className="flex flex-col items-center text-center max-w-3xl mx-auto pt-12">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-16 h-16 rounded-3xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#10B981] mb-8 shadow-[0_8px_20px_rgba(0,0,0,0.05)]"
        >
           <Sparkles size={32} />
        </motion.div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#111827] font-display mb-6">
          Что создадим <span className="text-[#10B981]">сегодня?</span>
        </h1>
        
        <p className="text-[#6B7280] text-[19px] font-medium leading-relaxed max-w-2xl px-4">
          Ваш персональный творческий ассистент. Выберите инструмент для начала работы или продолжите недавний проект.
        </p>
      </section>

      {/* Creation Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {creativeModules.map((module, i) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            className="group"
          >
            <Link to={module.path}>
              <GlassCard className="p-8 h-full bg-white border-[#E5E7EB] hover:border-[#10B981]/50 transition-all duration-500 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] flex flex-col items-start text-left relative overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#9CA3AF] group-hover:text-[#10B981] group-hover:bg-[#10B981]/5 group-hover:border-[#10B981]/20 flex items-center justify-center mb-6 transition-all duration-500">
                  <module.icon size={26} />
                </div>
                
                <h3 className="text-2xl font-bold text-[#111827] mb-3 font-display tracking-tight group-hover:text-[#10B981] transition-colors">{module.label}</h3>
                
                <p className="text-[#6B7280] text-[15px] leading-relaxed font-medium mb-8 flex-1">
                  {module.id === 'planner' && 'Стратегическое планирование и умный график публикаций.'}
                  {module.id === 'newsletter' && 'Профессиональные рассылки и цепочки писем для аудитории.'}
                  {module.id === 'podcasts' && 'Сценарии эпизодов, темы и вопросы для подкастов.'}
                  {module.id === 'avatars' && 'Сценарии для виртуальных AI-ведущих и видео.'}
                  {module.id === 'longreads' && 'Глубокие лонгриды и статьи экспертного уровня.'}
                </p>
                
                <div className="flex items-center gap-2 text-[#10B981] font-bold text-sm">
                  Начать проект
                  <ArrowRight size={16} />
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Workflow & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Works */}
        <GlassCard className="p-10 bg-white border-[#E5E7EB] shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#111827] font-display">Недавние проекты</h2>
            <button className="text-[13px] font-bold text-[#9CA3AF] hover:text-[#10B981] transition-colors">Смотреть все</button>
          </div>
          
          <div className="space-y-4">
             {[
               { title: 'Стратегия запуска SaaS (Q3)', module: 'Планировщик', date: '2 часа назад' },
               { title: 'Сценарий для AI-ведущего', module: 'Ведущий', date: 'Вчера' },
               { title: 'Статья про AI-тренды 2024', module: 'Статьи', date: '2 дня назад' }
             ].map((job, idx) => (
               <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-white transition-all cursor-pointer group/item shadow-sm">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] group-hover/item:text-[#10B981] transition-colors">
                        <FileText size={18} />
                     </div>
                     <div>
                        <h4 className="text-[15px] font-bold text-[#374151] mb-0.5">{job.title}</h4>
                        <span className="text-[12px] text-[#9CA3AF] font-bold uppercase tracking-widest text-[10px]">{job.module} • {job.date}</span>
                     </div>
                  </div>
                  <ArrowRight size={16} className="text-[#9CA3AF] opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
               </div>
             ))}
          </div>
        </GlassCard>

        {/* Studio Insight */}
        <GlassCard className="p-10 bg-[#F9FAFB] border-[#E5E7EB] shadow-[0_4px_16px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-[#10B981]">
             <Zap size={240} strokeWidth={1} />
          </div>
          
          <div className="relative z-10 space-y-8">
             <div className="space-y-2">
                <span className="text-[#10B981] font-bold text-[11px] uppercase tracking-[0.2em]">Статистика студии</span>
                <h3 className="text-3xl font-bold text-[#111827] font-display">Ваша продуктивность</h3>
             </div>
             
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                   <div className="text-4xl font-bold text-[#10B981] font-display">1.2k</div>
                   <div className="text-[14px] text-[#6B7280] font-medium leading-tight">Слов синтезировано за неделю</div>
                </div>
                <div className="space-y-1">
                   <div className="text-4xl font-bold text-[#10B981] font-display">18</div>
                   <div className="text-[14px] text-[#6B7280] font-medium leading-tight">Проектов завершено успешно</div>
                </div>
             </div>
             
             <div className="pt-6">
                <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "82%" }}
                     transition={{ duration: 2, ease: "circOut" }}
                     className="h-full bg-[#10B981]" 
                   />
                </div>
                <div className="mt-3 flex justify-between items-center text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">
                   <span>Оптимизация нейросети</span>
                   <span className="text-[#10B981]">82.4%</span>
                </div>
             </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
