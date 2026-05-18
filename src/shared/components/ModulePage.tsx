import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Save, Sparkles, Wand2 } from 'lucide-react';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { EmptyResultState, GenerationLoader } from '@/src/shared/components/ResultPanel';
import { AIField, AIInput, AITextarea, AISelect } from './forms/FormComponents';
import { ModuleConfig } from '@/src/config/modules';

interface ModulePageProps {
  config: ModuleConfig;
}

export function ModulePage({ config }: ModulePageProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasResult(true);
    }, 2500);
  };

  const handleReset = () => {
    setHasResult(false);
    setIsGenerating(false);
  };

  return (
    <div className="grid grid-cols-12 gap-10 h-full min-h-[calc(100vh-180px)] pb-20">
      {/* Input Side */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
        <section className="flex flex-col gap-3">
           <div className="flex items-center gap-4">
             <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-emerald-400 shadow-xl ring-1 ring-white/5">
               <config.icon className="w-7 h-7" />
             </div>
             <div className="flex flex-col">
                <h1 className="text-3xl font-bold tracking-tight text-white leading-none mb-1.5">{config.title}</h1>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Модуль готов к работе</span>
                </div>
             </div>
           </div>
           <p className="text-white/40 text-[13px] leading-relaxed max-w-md ml-1.5 font-medium">
             {config.description}
           </p>
        </section>

        <div className="space-y-6 flex-1">
          <GlassCard className="p-10 w-full bg-[#111827]/40 ring-1 ring-white/[0.03]">
            <div className="space-y-8">
                {config.fields.map((field) => (
                  <AIField key={field.id} label={field.label} id={field.id}>
                    {field.type === 'text' && <AIInput placeholder={field.placeholder} />}
                    {field.type === 'textarea' && <AITextarea placeholder={field.placeholder} rows={5} />}
                    {field.type === 'select' && (
                      <AISelect 
                        defaultValue={field.defaultValue} 
                        options={field.options || []} 
                      />
                    )}
                  </AIField>
                ))}
            </div>

            <div className="mt-14 pt-10 border-t border-white/[0.03] flex items-center justify-between">
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-white/20 hover:text-white/50 transition-colors"
              >
                <RotateCcw size={14} className="opacity-50" />
                Сбросить
              </button>
              
              <div className="flex items-center gap-4">
                <Button variant="outline" size="md" className="gap-2.5 border-white/[0.05] bg-white/[0.02] text-xs uppercase tracking-widest font-bold">
                  <Save size={16} className="opacity-60" />
                  Черновик
                </Button>
                <Button 
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  size="lg" 
                  className="gap-3 px-8 shadow-emerald-500/10 group overflow-hidden relative"
                >
                  <Wand2 size={18} className="relative z-10 group-hover:rotate-12 transition-transform" />
                  <span className="relative z-10 uppercase tracking-widest font-bold text-xs">{config.actionLabel}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Prompt Assist Tip */}
          <div className="p-5 rounded-2xl border border-white/[0.03] bg-emerald-500/[0.02] flex gap-4 items-start translate-y-2">
            <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
               <p className="text-[11px] font-bold text-white/60 uppercase tracking-tight">Совет системы</p>
               <p className="text-[11px] text-white/30 leading-relaxed font-medium">Будьте специфичны в описании «Нарратива» — чем больше контекста, тем точнее AI настроит тональность и аргументацию.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Result Side */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
         <div className="flex items-center justify-between px-3 mt-4">
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/20">Результаты работы</span>
               <div className="h-px w-20 bg-white/[0.05]" />
            </div>
            <div className="flex items-center gap-6 text-white/20 text-[10px] font-mono uppercase tracking-widest">
               <span className="hover:text-emerald-400 transition-colors cursor-pointer">Фильтр: ВСЕ</span>
               <span className="hover:text-emerald-400 transition-colors cursor-pointer">Сортировка: НОВЫЕ</span>
            </div>
         </div>

         <div className="flex-1 flex flex-col gap-6">
             <AnimatePresence mode="wait">
               {isGenerating ? (
                 <motion.div 
                   key="loading"
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 1.02 }}
                   className="h-full"
                 >
                   <GlassCard className="h-full flex items-center justify-center bg-black/20 border-dashed border-white/[0.05]">
                      <GenerationLoader status="Интеллектуальный синтез..." />
                   </GlassCard>
                 </motion.div>
               ) : hasResult ? (
                  /* This is a placeholder for actual results rendering */
                  <div className="space-y-6">
                     {/* We could use ResultCard here once we have real data */}
                     <div className="flex flex-col items-center justify-center p-20 text-center bg-black/20 border border-dashed border-white/[0.05] rounded-3xl">
                        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Данные сгенерированы. Ожидание интеграции OpenAI.</p>
                     </div>
                  </div>
               ) : (
                 <motion.div 
                   key="empty"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="h-full"
                 >
                   <GlassCard className="h-full flex items-center justify-center bg-black/20 border-dashed border-white/[0.05] hover:border-emerald-500/10 transition-colors duration-1000">
                      <EmptyResultState 
                        title="Готов к инновациям"
                        description={`Настройте параметры слева и нажмите «${config.actionLabel}», чтобы начать работу над вашим контентом.`}
                      />
                   </GlassCard>
                 </motion.div>
               )}
             </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
