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
    <div className="grid grid-cols-12 gap-10 h-full min-h-[calc(100vh-160px)] pb-16">
      {/* Input Side */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
        <section className="flex flex-col gap-2">
           <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-emerald-400">
               <config.icon size={22} />
             </div>
             <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight text-white/95 leading-none mb-1 font-display uppercase">{config.title}</h1>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                  <span className="text-[9px] font-bold font-mono text-white/20 uppercase tracking-[0.2em]">Система Готова</span>
                </div>
             </div>
           </div>
           <p className="text-white/40 text-[13px] leading-relaxed max-w-md ml-0.5">
             {config.description}
           </p>
        </section>

        <div className="space-y-6 flex-1">
          <GlassCard className="p-8 w-full bg-[#161B26]/30 border-white/[0.04]">
            <div className="space-y-6">
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

            <div className="mt-10 pt-8 border-t border-white/[0.03] flex items-center justify-between">
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-white/20 hover:text-white/50 transition-colors"
                title="Очистить поля"
              >
                <RotateCcw size={12} className="opacity-50" />
                Сброс
              </button>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="md" className="gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/[0.01]">
                  <Save size={14} className="opacity-50" />
                  Черновик
                </Button>
                <Button 
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  size="md" 
                  className="gap-2.5 px-6 font-display"
                >
                  <Wand2 size={16} className="group-hover:rotate-12 transition-transform" />
                  <span className="uppercase tracking-widest font-bold text-[11px]">{config.actionLabel}</span>
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Prompt Assist Tip */}
          <div className="p-4 rounded-xl border border-white/[0.03] bg-emerald-500/[0.01] flex gap-3 items-start">
            <Sparkles size={14} className="text-emerald-400 mt-0.5 opacity-40 shrink-0" />
            <div className="space-y-1">
               <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Ассистент</p>
               <p className="text-[11px] text-white/30 leading-relaxed font-medium">Контекст имеет значение. Детальное описание задачи значительно повышает качество первого черновика.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Result Side */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
         <div className="flex items-center justify-between px-1 mt-2">
            <div className="flex items-center gap-2.5">
               <span className="text-[10px] font-bold font-mono uppercase tracking-[0.3em] text-white/20 leading-none">Результаты</span>
               <div className="h-px w-10 bg-white/[0.04]" />
            </div>
            <div className="flex items-center gap-5 text-white/20 text-[10px] font-mono uppercase tracking-widest font-bold">
               <span className="hover:text-emerald-400 transition-colors cursor-pointer">Все типы</span>
               <span className="hover:text-emerald-400 transition-colors cursor-pointer">Сначала новые</span>
            </div>
         </div>

         <div className="flex-1 flex flex-col">
             <AnimatePresence mode="wait">
               {isGenerating ? (
                 <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <GlassCard className="h-full flex items-center justify-center bg-[#161B26]/10 border-dashed border-white/[0.05]">
                       <GenerationLoader status="Генерация..." />
                    </GlassCard>
                  </motion.div>
               ) : hasResult ? (
                  <div className="space-y-6 h-full">
                     <div className="flex flex-col items-center justify-center h-full p-20 text-center bg-[#161B26]/10 border border-dashed border-white/[0.05] rounded-3xl">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20">
                            <Sparkles size={24} />
                        </div>
                        <h3 className="text-white/80 font-bold mb-2">Контент успешно синтезирован</h3>
                        <p className="text-white/30 text-xs font-medium max-w-xs">Ожидание подключения к OpenAI API для получения реальных данных.</p>
                     </div>
                  </div>
               ) : (
                 <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full"
                  >
                    <GlassCard className="h-full flex items-center justify-center bg-[#161B26]/10 border-dashed border-white/[0.05] hover:border-emerald-500/10 transition-all duration-500">
                       <EmptyResultState 
                        title="Система Ожидания"
                        description={`Укажите детали слева и нажмите «${config.actionLabel}» для запуска рабочего процесса.`}
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
