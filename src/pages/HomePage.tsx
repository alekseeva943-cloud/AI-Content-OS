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
    <div className="space-y-10 pb-20">
      {/* Hero */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
            <h1 className="text-5xl font-bold tracking-tight text-white/95 font-display">
              Кабинет
            </h1>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Sparkles size={20} />
            </div>
        </div>
        <p className="text-white/40 max-w-xl text-[15px] leading-relaxed font-medium">
          Добро пожаловать. Ваша лаборатория контента готова к работе. Выберите модуль для начала генерации.
        </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <GlassCard className="p-6 h-auto group bg-[#161B26]/30 hover:bg-[#161B26]/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                 <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-emerald-400 group-hover:scale-110 transition-transform">
                   <stat.icon size={20} />
                 </div>
                 <span className="text-[10px] font-bold font-mono text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/10 tracking-widest leading-none">
                   {stat.trend}
                 </span>
              </div>
              <div className="text-4xl font-bold text-white/95 mb-1 tracking-tight font-display">{stat.value}</div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">{stat.label}</span>
                <span className="text-[10px] text-white/20 font-medium">{stat.description}</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
         <GlassCard className="lg:col-span-3 p-8 group relative overflow-hidden bg-[#161B26]/30">
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                        <BookOpen className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-white/80 font-display">Недавние проекты</h2>
                </div>
                <button className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-white/30 hover:text-emerald-400 transition-colors">Смотреть все</button>
            </div>

            <div className="space-y-3 relative z-10">
               {[
                 { title: 'Стратегия выхода на рынок SaaS (Q3)', module: 'Planner', time: '2 часа назад' },
                 { title: 'Скрипт для аватара: Обновление платформы', module: 'Avatar', time: '5 часов назад' },
                 { title: 'Лонгрид: Будущее AI в дизайне интерфейсов', module: 'Longread', time: 'Вчера' }
               ].map((project, i) => (
                 <motion.div 
                    key={i}
                    whileHover={{ x: 5 }}
                    className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] hover:border-emerald-500/20 transition-all flex items-center justify-between group/item cursor-pointer"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-white/30 group-hover/item:text-emerald-400 transition-colors">
                          <Fingerprint size={18} strokeWidth={1.5} />
                       </div>
                       <div>
                         <div className="text-[14px] font-bold text-white/80 group-hover/item:text-white transition-colors">{project.title}</div>
                         <div className="flex items-center gap-3">
                            <span className="text-[9px] text-white/20 font-mono uppercase tracking-[0.1em] flex items-center gap-1.5 leading-none">
                               <Clock size={10} />
                               {project.time}
                            </span>
                            <div className="w-3 h-px bg-white/5" />
                            <span className="text-[9px] text-emerald-500/50 font-bold font-mono uppercase tracking-widest">{project.module}</span>
                         </div>
                       </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-center translate-x-2 group-hover/item:translate-x-0 opacity-0 group-hover/item:opacity-100 transition-all">
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    </div>
                 </motion.div>
               ))}
            </div>
         </GlassCard>

         <GlassCard className="lg:col-span-2 p-8 bg-[#161B26]/30 border-white/[0.05] flex flex-col">
            <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                    <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-white/80 font-display">Система</h2>
            </div>

            <div className="space-y-8 relative z-10 flex-1">
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold font-mono tracking-widest uppercase text-white/40">
                    <span>Нагрузка API</span>
                    <span className="text-emerald-400">84%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden p-[1px] border border-white/[0.05]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "84%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-emerald-500/60 rounded-full" 
                    />
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold font-mono tracking-widest uppercase text-white/40">
                    <span>Память</span>
                    <span className="text-emerald-400">32%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden p-[1px] border border-white/[0.05]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "32%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-emerald-500/60 rounded-full" 
                    />
                  </div>
               </div>

               <div className="pt-6 mt-4 border-t border-white/[0.03] flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-[11px] text-white/30 font-medium group">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    <span>Нейронный движок готов</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-white/30 font-medium group">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    <span>Слои контекста оптимизированы</span>
                  </div>
               </div>
            </div>
         </GlassCard>
      </div>
    </div>
  );
}
