import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowUpRight, Zap, Database, BookOpen, Clock, Activity, Fingerprint } from 'lucide-react';
import { GlassCard } from '@/src/shared/components/UI';

export function HomePage() {
  const stats = [
    { label: 'Генераций сегодня', value: '42', trend: '+12%', icon: Zap, description: 'Объем AI синтеза' },
    { label: 'Хранилище контента', value: '1.2 GB', trend: 'Оптимально', icon: Database, description: 'Использовано памяти' },
    { label: 'Экономия времени', value: '184ч', trend: 'x4.2', icon: Clock, description: 'Эффективность модуля' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Hero */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-[#F1F2F4] font-display uppercase">
              Dashboard
            </h1>
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/[0.05] border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                <Sparkles size={16} />
            </div>
        </div>
        <p className="text-[#898E9E] max-w-xl text-[15px] font-medium">
          Добро пожаловать. Ваша лаборатория контента готова к работе.
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <GlassCard className="p-6 group bg-[#15181E] border border-[#242933] hover:border-[#10B981]/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                 <div className="p-2 rounded-lg bg-[#1C2028] border border-[#383E4C] text-[#10B981]">
                   <stat.icon size={18} />
                 </div>
                 <span className="text-[10px] font-bold font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md border border-[#10B981]/10 tracking-widest uppercase">
                   {stat.trend}
                 </span>
              </div>
              <div className="text-3xl font-bold text-[#F1F2F4] mb-1 font-display leading-none">{stat.value}</div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#898E9E]">{stat.label}</span>
                <span className="text-[10px] text-[#4B5262] font-medium leading-tight">{stat.description}</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
         <GlassCard className="lg:col-span-3 p-6 bg-[#15181E]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#1C2028] border border-[#383E4C]">
                        <BookOpen size={18} className="text-[#10B981]" />
                    </div>
                    <h2 className="text-lg font-bold uppercase tracking-widest text-[#F1F2F4] font-display">Недавние проекты</h2>
                </div>
                <button className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#898E9E] hover:text-[#10B981] transition-colors">Смотреть все</button>
            </div>

            <div className="space-y-2">
               {[
                 { title: 'Стратегия выхода на рынок SaaS (Q3)', module: 'Planner', time: '2 часа назад' },
                 { title: 'Скрипт для аватара: Обновление платформы', module: 'Avatar', time: '5 часов назад' },
                 { title: 'Лонгрид: Будущее AI в дизайне интерфейсов', module: 'Longread', time: 'Вчера' }
               ].map((project, i) => (
                 <motion.div 
                    key={i}
                    whileHover={{ x: 4 }}
                    className="p-4 rounded-xl border border-transparent hover:border-[#383E4C] hover:bg-[#1C2028] transition-all flex items-center justify-between group/item cursor-pointer"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-lg bg-[#1C2028] border border-[#383E4C] flex items-center justify-center text-[#4B5262] group-hover/item:text-[#10B981] transition-colors">
                          <Fingerprint size={18} />
                       </div>
                       <div>
                         <div className="text-[14px] font-bold text-[#E2E4E9] group-hover/item:text-[#F1F2F4] transition-colors">{project.title}</div>
                         <div className="flex items-center gap-3">
                            <span className="text-[9px] text-[#898E9E] font-bold font-mono uppercase tracking-widest flex items-center gap-1.5 leading-none">
                               <Clock size={10} />
                               {project.time}
                            </span>
                            <div className="w-px h-3 bg-[#383E4C]" />
                            <span className="text-[9px] text-[#10B981]/70 font-bold font-mono uppercase tracking-widest">{project.module}</span>
                         </div>
                       </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#4B5262] group-hover/item:text-[#10B981] transition-all opacity-0 group-hover/item:opacity-100" />
                 </motion.div>
               ))}
            </div>
         </GlassCard>

         <GlassCard className="lg:col-span-2 p-6 bg-[#15181E] border-white/[0.05] flex flex-col">
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 rounded-lg bg-[#1C2028] border border-[#383E4C]">
                    <Activity size={18} className="text-[#10B981]" />
                </div>
                <h2 className="text-lg font-bold uppercase tracking-widest text-[#F1F2F4] font-display">Система</h2>
            </div>

            <div className="space-y-6 relative z-10 flex-1">
               <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold font-mono tracking-widest uppercase text-[#898E9E]">
                    <span>Нагрузка API</span>
                    <span className="text-[#10B981]">84%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#0D0F12] rounded-full overflow-hidden border border-[#383E4C]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "84%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-[#10B981]" 
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold font-mono tracking-widest uppercase text-[#898E9E]">
                    <span>Память</span>
                    <span className="text-[#10B981]">32%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#0D0F12] rounded-full overflow-hidden border border-[#383E4C]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "32%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-[#10B981]" 
                    />
                  </div>
               </div>

               <div className="pt-6 mt-4 border-t border-[#383E4C] flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-[11px] text-[#898E9E] font-medium group">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]/50" />
                    <span>Neural ready</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#898E9E] font-medium group">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]/50" />
                    <span>Layers optimized</span>
                  </div>
               </div>
            </div>
         </GlassCard>
      </div>
    </div>
  );
}
