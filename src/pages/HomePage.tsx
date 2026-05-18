import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowUpRight, Zap, Target, BookOpen, Clock, Activity, Fingerprint } from 'lucide-react';
import { GlassCard } from '@/src/shared/components/UI';

export function HomePage() {
  const stats = [
    { label: 'Контент', value: '12', description: 'единиц на очереди', icon: Target, trend: '+20%' },
    { label: 'AI Мощность', value: '98%', description: 'статус ресурсов', icon: Zap, trend: 'Optimal' },
    { label: 'Аудитория', value: '42.5k', description: 'общий охват', icon: Sparkles, trend: '+4%' },
  ];

  return (
    <div className="space-y-12 pb-24">
      {/* Hero */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <h1 className="text-6xl font-bold tracking-tight text-white font-display">
              Кабинет
            </h1>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <Sparkles size={24} />
            </div>
        </div>
        <p className="text-white/40 max-w-xl text-lg leading-relaxed font-medium">
          Добро пожаловать в вашу высокотехнологичную лабораторию контента. Системы откалиброваны и готовы к новым генерациям.
        </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            <GlassCard className="p-8 h-auto group bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-700 hover:scale-[1.02] active:scale-[0.98]">
              <div className="flex items-center justify-between mb-8">
                 <div className="p-4 rounded-2xl bg-[#0B0F14] border border-white/[0.05] text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all shadow-xl">
                   <stat.icon className="w-7 h-7" />
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/10 tracking-[0.2em] leading-none">
                      {stat.trend}
                    </span>
                 </div>
              </div>
              <div className="text-5xl font-bold text-white mb-2 tracking-tight font-display">{stat.value}</div>
              <div className="flex flex-col">
                <span className="text-sm font-bold uppercase tracking-[0.15em] text-white/50">{stat.label}</span>
                <span className="text-[11px] text-white/20 font-medium">{stat.description}</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
         <GlassCard className="lg:col-span-3 p-12 group overflow-hidden relative min-h-[450px] bg-[#111827]/20 border-white/[0.05]">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/[0.01] blur-[140px] -mr-80 -mt-80 rounded-full" />
            
            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <BookOpen className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-widest text-white/90 font-display">Недавние проекты</h2>
                </div>
                <button className="text-[11px] font-bold font-mono uppercase tracking-[0.2em] text-white/30 hover:text-emerald-400 transition-all px-4 py-2 rounded-xl hover:bg-white/5">Смотреть все</button>
            </div>

            <div className="space-y-5 relative z-10">
               {[
                 { title: 'Стратегия выхода на рынок SaaS (Q3)', module: 'Planner', time: '2 часа назад' },
                 { title: 'Скрипт для аватара: Обновление платформы', module: 'Avatar', time: '5 часов назад' },
                 { title: 'Лонгрид: Будущее AI в дизайне интерфейсов', module: 'Longread', time: 'Вчера' }
               ].map((project, i) => (
                 <motion.div 
                    key={i}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="p-6 rounded-[2rem] bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] hover:border-emerald-500/10 transition-all flex items-center justify-between group/item cursor-pointer shadow-sm hover:shadow-xl"
                 >
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-[#0B0F14] border border-white/[0.05] flex items-center justify-center text-white/30 group-hover/item:text-emerald-400 group-hover/item:border-emerald-500/20 transition-all shadow-inner">
                          <Fingerprint size={24} strokeWidth={1.5} />
                       </div>
                       <div>
                         <div className="text-[16px] font-bold text-white/90 mb-1.5 group-hover/item:text-white transition-colors">{project.title}</div>
                         <div className="flex items-center gap-4">
                            <span className="text-[10px] text-white/30 font-mono uppercase tracking-[0.15em] flex items-center gap-2">
                               <Clock size={12} className="opacity-50" />
                               {project.time}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-[9px] text-emerald-500/60 font-bold font-mono uppercase tracking-[0.22em] px-2 py-0.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5">{project.module}</span>
                         </div>
                       </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.01] border border-white/[0.05] flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all group-hover/item:bg-emerald-500/5 group-hover/item:border-emerald-500/10 group-active/item:scale-90">
                        <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                    </div>
                 </motion.div>
               ))}
            </div>
         </GlassCard>

         <GlassCard className="lg:col-span-2 p-12 bg-emerald-500/[0.01] border-white/[0.03] ring-1 ring-emerald-500/5 relative overflow-hidden flex flex-col">
            <div className="absolute top-[-80px] right-[-80px] w-64 h-64 bg-emerald-500/[0.03] blur-3xl rounded-full" />
            
            <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-widest text-white/90 font-display">Статус Системы</h2>
            </div>

            <div className="space-y-10 relative z-10 flex-1">
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-bold font-mono tracking-[0.2em] uppercase text-white/40">
                    <span>Нагрузка OpenAI API</span>
                    <span className="text-emerald-400">84%</span>
                  </div>
                  <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/[0.05] shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "84%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                    />
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-bold font-mono tracking-[0.2em] uppercase text-white/40">
                    <span>Выделение Памяти</span>
                    <span className="text-emerald-400">32%</span>
                  </div>
                  <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/[0.05] shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "32%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                    />
                  </div>
               </div>

               <div className="pt-10 mt-6 border-t border-white/[0.03] flex flex-col gap-6">
                  <div className="flex items-center gap-5 text-[12px] text-white/40 font-medium group cursor-default">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform" />
                    <span className="group-hover:text-white/60 transition-colors">Нейронный движок откалиброван</span>
                  </div>
                  <div className="flex items-center gap-5 text-[12px] text-white/40 font-medium group cursor-default">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform" />
                    <span className="group-hover:text-white/60 transition-colors">Слои контекста оптимизированы</span>
                  </div>
               </div>
            </div>
         </GlassCard>
      </div>
    </div>
  );
}
