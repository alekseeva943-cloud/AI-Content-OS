import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Save, Sparkles, Wand2, AlertCircle, ArrowLeft } from 'lucide-react';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { EmptyResultState, GenerationLoader } from '@/src/shared/components/ResultPanel';
import { AIField, AIInput, AITextarea, AISelect, AIToggleGroup, AIPillSelector } from './forms/FormComponents';
import { ModuleConfig } from '@/src/config/modules';
import { generateContentPlan } from '@/src/services/ai/client';
import { useMemoryStore } from '@/src/stores/memoryStore';
import { PlannerResultDisplay } from '@/src/features/planner/components/PlannerResult';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';

interface ModulePageProps {
  config: ModuleConfig;
}

export function ModulePage({ config }: ModulePageProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    config.fields.forEach(f => {
      initial[f.id] = f.defaultValue || '';
    });
    return initial;
  });

  const addGeneration = useMemoryStore(state => state.addGeneration);
  const sharedMemory = useMemoryStore(state => state.sharedMemory);

  const handleInputChange = (id: string, value: any) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      if (config.id === 'planner') {
         const request = {
            topic: formValues.topic,
            context: formValues.context,
            period: formValues.period,
            channels: Array.isArray(formValues.channels) ? formValues.channels : [formValues.channels],
            sharedMemory
         };
         
         const data = await generateContentPlan(request as any);
         setResult(data);
         
         addGeneration({
            type: 'planner',
            data,
            metadata: {
                topic: request.topic,
                period: request.period,
                channels: request.channels
            }
         });
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setResult({ mock: true });
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-6xl mx-auto">
      {/* Studio Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#242933]">
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#4B5262] hover:text-[#10B981] transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            Назад в хаб
          </button>
          
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <config.icon size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#F1F2F4] font-display tracking-tight">{config.title}</h1>
              <p className="text-[#898E9E] mt-1 font-medium">{config.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1C2028] border border-[#383E4C]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold text-[#A1A5B3] uppercase tracking-widest leading-none">Studio Ready</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Step 1: Configuration */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#10B981] text-[#0D0F12] flex items-center justify-center text-[11px] font-bold">1</div>
              <h3 className="text-[13px] font-bold text-[#E2E4E9] uppercase tracking-[0.1em]">Настройка синтеза</h3>
           </div>

           <GlassCard className="p-8 bg-[#15181E] border-[#242933] shadow-xl space-y-8">
              <div className="space-y-8">
                {config.fields.map((field) => (
                  <AIField key={field.id} label={field.label} id={field.id}>
                    {field.type === 'text' && (
                        <AIInput 
                            placeholder={field.placeholder} 
                            value={formValues[field.id]} 
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />
                    )}
                    {field.type === 'textarea' && (
                        <AITextarea 
                            placeholder={field.placeholder} 
                            value={formValues[field.id]}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />
                    )}
                    {field.type === 'select' && (
                      Array.isArray(field.defaultValue) ? (
                        <AIPillSelector 
                          value={Array.isArray(formValues[field.id]) ? formValues[field.id] : [formValues[field.id]]}
                          options={field.options || []}
                          onChange={(val) => handleInputChange(field.id, val)}
                        />
                      ) : (
                        <AIToggleGroup 
                          value={formValues[field.id]}
                          options={field.options || []}
                          onChange={(val) => handleInputChange(field.id, val)}
                        />
                      )
                    )}
                  </AIField>
                ))}
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-[12px] text-red-400/80 font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <div className="pt-8 border-t border-[#242933]">
                <Button 
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  size="lg" 
                  className="w-full gap-3 shadow-[0_12px_32px_rgba(16,185,129,0.2)] h-14 text-sm font-bold rounded-2xl"
                >
                  <Wand2 size={20} />
                  <span>{config.actionLabel}</span>
                </Button>
                
                <div className="flex items-center justify-between mt-6 px-1">
                   <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#4B5262] hover:text-[#10B981] transition-colors"
                  >
                    <RotateCcw size={12} />
                    Сбросить
                  </button>
                  <span className="text-[11px] text-[#4B5262] font-medium leading-none">Smart Mode v2</span>
                </div>
              </div>
           </GlassCard>

           <div className="p-5 rounded-2xl bg-[#10B981]/5 border border-[#10B981]/10 flex gap-4 items-start">
             <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={16} className="text-[#10B981]" />
             </div>
             <p className="text-[13px] text-[#898E9E] leading-relaxed font-medium transition-all group-hover:text-[#E2E4E9]">
               Нейросеть проанализирует контекст и создаст оптимальную структуру для ваших задач.
             </p>
           </div>
        </div>

        {/* Step 2: Generation Workspace */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                 <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                    result ? "bg-[#10B981] text-[#0D0F12]" : "bg-[#242933] text-[#4B5262]"
                 )}>2</div>
                 <h3 className="text-[13px] font-bold text-[#E2E4E9] uppercase tracking-[0.1em]">Результат синтеза</h3>
              </div>
              <div className="flex items-center gap-8 text-[#4B5262] text-[11px] font-bold uppercase tracking-widest">
                 <button className="hover:text-[#10B981] transition-colors">Экспорт</button>
                 <button className="hover:text-[#10B981] transition-colors">Копировать</button>
              </div>
           </div>

           <div className="min-h-[500px] flex flex-col">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="h-full flex-1"
                  >
                    <GlassCard className="h-full flex-1 flex items-center justify-center bg-[#0D0F12]/30 border-dashed border-[#242933] rounded-[3rem]">
                       <GenerationLoader status="Синтезирую..." statusColor="#10B981" />
                    </GlassCard>
                  </motion.div>
                ) : result ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full flex-1"
                  >
                    {config.id === 'planner' ? (
                       <PlannerResultDisplay result={result} />
                    ) : (
                       <div className="flex flex-col items-center justify-center h-full p-20 text-center bg-[#15181E] border border-[#242933] rounded-[3rem] shadow-2xl">
                          <div className="w-20 h-20 rounded-3xl bg-[#10B981]/5 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] mb-10 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                             <Sparkles size={40} />
                          </div>
                          <h2 className="text-3xl font-bold text-[#F1F2F4] mb-4 font-display">Синтез завершен</h2>
                          <p className="text-[#898E9E] text-[16px] font-medium max-w-sm mb-12 leading-relaxed">Система успешно сформировала структуру на основе ваших параметров.</p>
                          <div className="flex items-center gap-4">
                             <Button variant="secondary" size="lg" className="rounded-xl px-10">Просмотреть проект</Button>
                             <Button variant="outline" size="lg" className="rounded-xl border-[#383E4C] text-[#898E9E]">Сохранить</Button>
                          </div>
                       </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex-1"
                  >
                    <GlassCard className="h-full flex-1 flex items-center justify-center bg-[#0D0F12]/30 border-dashed border-[#242933] hover:border-[#10B981]/20 transition-all duration-700 rounded-[3rem]">
                       <EmptyResultState 
                        title="Готово к синтезу"
                        description="Настройте параметры в левой панели, чтобы Ваш AI-ассистент сформировал идеальный сценарий или план."
                       />
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}


