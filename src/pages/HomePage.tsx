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
    <div className="space-y-16 pb-24 animate-in fade-in duration-1000">
      {/* Dynamic Hero */}
      <section className="flex flex-col items-center text-center max-w-3xl mx-auto pt-8">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-16 h-16 rounded-3xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
        >
           <Sparkles size={32} />
        </motion.div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#F1F2F4] font-display mb-6">
          Что создадим <span className="text-[#10B981]">сегодня?</span>
        </h1>
        
        <p className="text-[#898E9E] text-[18px] font-medium leading-relaxed max-w-2xl">
          Ваш интеллектуальный партнер в мире контента. Выберите модуль для начала синтеза или продолжите работу над недавним проектом.
        </p>
      </section>

      {/* Creation Hub */}
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
              <GlassCard className="p-8 h-full bg-[#15181E] border-[#242933] hover:border-[#10B981]/40 transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.05)] relative overflow-hidden flex flex-col items-start text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="w-14 h-14 rounded-2xl bg-[#1C2028] border border-[#383E4C] text-[#898E9E] group-hover:text-[#10B981] group-hover:bg-[#10B981]/5 group-hover:border-[#10B981]/20 flex items-center justify-center mb-6 transition-all duration-500 shadow-sm relative z-10">
                  <module.icon size={26} />
                </div>
                
                <h3 className="text-2xl font-bold text-[#F1F2F4] mb-3 group-hover:text-[#10B981] transition-colors font-display relative z-10">{module.label}</h3>
                
                <p className="text-[#898E9E] text-[15px] leading-relaxed font-medium mb-8 flex-1 relative z-10">
                  {module.id === 'planner' && 'Стратегическое планирование и график публикаций.'}
                  {module.id === 'newsletter' && 'Профессиональные рассылки и цепочки писем.'}
                  {module.id === 'podcasts' && 'Сценарии эпизодов и вопросы для гостей.'}
                  {module.id === 'avatars' && 'Скрипты для виртуальных AI-ведущих.'}
                  {module.id === 'longreads' && 'Глубокие статьи на основе ваших данных.'}
                </p>
                
                <div className="flex items-center gap-2 text-[#10B981] font-bold text-sm opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 relative z-10">
                  Создать проект
                  <ArrowRight size={16} />
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Secondary section: History and Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <GlassCard className="p-10 bg-[#15181E] border-[#242933] shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#F1F2F4] font-display">Недавние работы</h2>
            <button className="text-[13px] font-bold text-[#898E9E] hover:text-[#10B981] transition-colors">Показать все</button>
          </div>
          
          <div className="space-y-4">
             {[
               { title: 'Стратегия запуска SaaS (Q3)', module: 'Планировщик', date: '2 часа назад' },
               { title: 'Сценарий для AI-ведущего', module: 'Ведущий', date: 'Вчера' },
               { title: 'Статья про AI-тренды', module: 'Статьи', date: '2 дня назад' }
             ].map((job, idx) => (
               <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-[#0D0F12]/50 border border-[#242933] hover:border-[#383E4C] transition-colors cursor-pointer group/item">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-[#1C2028] flex items-center justify-center text-[#4B5262] group-hover/item:text-[#10B981] transition-colors">
                        <FileText size={18} />
                     </div>
                     <div>
                        <h4 className="text-[15px] font-bold text-[#E2E4E9] mb-0.5">{job.title}</h4>
                        <span className="text-[11px] text-[#4B5262] font-semibold">{job.module} • {job.date}</span>
                     </div>
                  </div>
                  <ArrowRight size={16} className="text-[#4B5262] opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
               </div>
             ))}
          </div>
        </GlassCard>

        {/* Studio Vibe / Quick Stats */}
        <GlassCard className="p-10 bg-gradient-to-br from-[#15181E] to-[#0D0F12] border-[#242933] shadow-xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <Zap size={240} className="text-[#10B981]" />
          </div>
          
          <div className="relative z-10 space-y-8">
             <div className="space-y-2">
                <span className="text-[#10B981] font-bold text-xs uppercase tracking-[0.2em]">Производительность</span>
                <h3 className="text-3xl font-bold text-[#F1F2F4] font-display">Творческий прогресс</h3>
             </div>
             
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                   <div className="text-4xl font-bold text-[#10B981]">1,284</div>
                   <div className="text-[13px] text-[#898E9E] font-medium">Слов синтезировано</div>
                </div>
                <div className="space-y-1">
                   <div className="text-4xl font-bold text-[#10B981]">18</div>
                   <div className="text-[13px] text-[#898E9E] font-medium">Проектов в работе</div>
                </div>
             </div>
             
             <div className="pt-4">
                <div className="h-2 w-full bg-[#1C2028] rounded-full overflow-hidden border border-[#383E4C]">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "75%" }}
                     transition={{ duration: 2, ease: "circOut" }}
                     className="h-full bg-gradient-to-r from-[#10B981]/40 to-[#10B981]" 
                   />
                </div>
                <div className="mt-3 flex justify-between items-center text-[11px] font-bold text-[#4B5262] uppercase tracking-widest">
                   <span>Оптимизация нейросети</span>
                   <span className="text-[#10B981]">75%</span>
                </div>
             </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

