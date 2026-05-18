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
    <div className="grid grid-cols-12 gap-8 h-full min-h-[calc(100vh-160px)]">
      {/* Input Side */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
        <section className="flex flex-col gap-1">
           <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-lg bg-[#1C2028] border border-[#383E4C] text-[#10B981]">
               <config.icon size={18} />
             </div>
             <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-tight text-[#F1F2F4] uppercase font-display leading-none">{config.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1 h-1 rounded-full bg-[#10B981]/40" />
                  <span className="text-[9px] font-bold font-mono text-[#4B5262] uppercase tracking-[0.2em] leading-none">Modular Node Active</span>
                </div>
             </div>
           </div>
           <p className="text-[#898E9E] text-[14px] leading-relaxed max-w-md mt-2">
             {config.description}
           </p>
        </section>

        <div className="space-y-6 flex-1">
          <GlassCard className="p-6 w-full bg-[#15181E] border-[#242933]">
            <div className="space-y-6">
                {config.fields.map((field) => (
                  <AIField key={field.id} label={field.label} id={field.id}>
                    {field.type === 'text' && <AIInput placeholder={field.placeholder} />}
                    {field.type === 'textarea' && <AITextarea placeholder={field.placeholder} />}
                    {field.type === 'select' && (
                      <AISelect 
                        defaultValue={field.defaultValue} 
                        options={field.options || []} 
                      />
                    )}
                  </AIField>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#242933] flex items-center justify-between">
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-[#4B5262] hover:text-[#898E9E] transition-colors"
              >
                <RotateCcw size={12} />
                Reset
              </button>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="md" className="gap-2 text-[#4B5262] border-[#383E4C]">
                  <Save size={14} />
                  Draft
                </Button>
                <Button 
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  size="md" 
                  className="gap-2 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                >
                  <Wand2 size={14} />
                  <span>{config.actionLabel}</span>
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Efficiency Tip */}
          <div className="p-4 rounded-xl border border-[#242933] bg-[#0D0F12] flex gap-3 items-center">
            <Sparkles size={14} className="text-[#10B981]/60 shrink-0" />
            <p className="text-[11px] text-[#4B5262] leading-tight font-medium">Контекстная глубина напрямую коррелирует с точностью синтеза.</p>
          </div>
        </div>
      </div>

      {/* Result Side */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
         <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
               <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-[#4B5262]">Outputs</span>
               <div className="h-[1px] w-4 bg-[#242933]" />
            </div>
            <div className="flex items-center gap-6 text-[#4B5262] text-[10px] font-bold font-mono uppercase tracking-widest">
               <span className="hover:text-[#10B981] transition-colors cursor-pointer">Filter</span>
               <span className="hover:text-[#10B981] transition-colors cursor-pointer">Export</span>
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
                    <GlassCard className="h-full flex items-center justify-center bg-[#0D0F12]/30 border-dashed border-[#242933]">
                       <GenerationLoader status="Synthesizing context..." statusColor="#10B981" />
                    </GlassCard>
                  </motion.div>
               ) : hasResult ? (
                  <div className="space-y-6 h-full">
                     <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-[#15181E] border border-[#242933] rounded-2xl shadow-xl">
                        <div className="w-12 h-12 rounded-xl bg-[#10B981]/[0.05] flex items-center justify-center text-[#10B981] mb-6 border border-[#10B981]/20">
                            <Sparkles size={24} />
                        </div>
                        <h3 className="text-[#F1F2F4] font-bold uppercase tracking-widest text-sm mb-2">Generation Ready</h3>
                        <p className="text-[#898E9E] text-xs font-medium max-w-sm mb-8 leading-relaxed">Система подготовила структуру данных. Подключите OpenAI API для финального синтеза.</p>
                        <Button variant="secondary" size="md">Открыть редактор</Button>
                     </div>
                  </div>
               ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full"
                  >
                    <GlassCard className="h-full flex items-center justify-center bg-[#0D0F12]/30 border-dashed border-[#242933] hover:border-[#383E4C] transition-all duration-300">
                       <EmptyResultState 
                        title="Waiting for input"
                        description={`Настройте параметры и нажмите «${config.actionLabel}» для начала.`}
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
