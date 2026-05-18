import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  RotateCcw, 
  Save, 
  Sparkles, 
  Wand2, 
  AlertCircle, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Settings2,
  Users,
  Target,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { EmptyResultState, GenerationLoader } from '@/src/shared/components/ResultPanel';
import { AIField, AIInput, AITextarea, AISelect, AIToggleGroup, AIPillSelector } from './forms/FormComponents';
import { ModuleConfig } from '@/src/config/modules';
import { generateContentPlan } from '@/src/services/ai/client';
import { useMemoryStore } from '@/src/stores/memoryStore';
import { PlannerResultDisplay } from '@/src/features/planner/components/PlannerResult';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

interface ModulePageProps {
  config: ModuleConfig;
}

export function ModulePage({ config }: ModulePageProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('Инициализация...');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    config.fields.forEach(f => {
      initial[f.id] = f.defaultValue || '';
    });
    // Add advanced defaults
    initial['advanced_audience'] = 'Широкая аудитория';
    initial['advanced_tone'] = 'balanced';
    initial['advanced_emotion'] = 'moderate';
    initial['advanced_formality'] = 'neutral';
    initial['advanced_length'] = 'optimal';
    initial['advanced_complexity'] = 'simple';
    initial['advanced_goal'] = 'engagement';
    return initial;
  });

  const addGeneration = useMemoryStore(state => state.addGeneration);
  const sharedMemory = useMemoryStore(state => state.sharedMemory);

  const handleInputChange = (id: string, value: any) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
  };

  const steps = [
    'Анализирую культурный код вашей ниши...',
    'Проектирую смысловые слои кампании...',
    'Синтезирую креативные концепции...',
    'Подбираю оптимальное время публикаций...',
    'Кристаллизую финальную стратегию...'
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);
    setError(null);
    
    let stepIndex = 0;
    setGenerationStep(steps[0]);
    
    const stepInterval = setInterval(() => {
        if (stepIndex < steps.length - 1) {
            stepIndex++;
            setGenerationStep(steps[stepIndex]);
        }
    }, 2500);

    try {
      if (config.id === 'planner') {
         const request = {
            topic: formValues.topic,
            context: formValues.context,
            period: formValues.period,
            channels: Array.isArray(formValues.channels) ? formValues.channels : [formValues.channels],
            sharedMemory,
            // Advanced parameters
            advanced: showAdvanced ? {
                audience: formValues.advanced_audience,
                tone: formValues.advanced_tone,
                emotion: formValues.advanced_emotion,
                formality: formValues.advanced_formality,
                length: formValues.advanced_length,
                complexity: formValues.advanced_complexity,
                goal: formValues.advanced_goal,
            } : undefined
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
        await new Promise(resolve => setTimeout(resolve, 3000));
        setResult({ mock: true });
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setIsGenerating(false);
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="flex flex-col gap-10 pb-24 mx-auto w-full max-w-[1600px]">
      {/* Workspace Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#E5E7EB]">
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#10B981] transition-colors text-[11px] font-bold uppercase tracking-[0.2em]"
          >
            <ArrowLeft size={16} />
            Вернуться в студию
          </button>
          
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#10B981] flex items-center justify-center shadow-sm">
              <config.icon size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#111827] font-display tracking-tight">{config.title}</h1>
              <p className="text-[#6B7280] mt-1.5 font-medium text-lg leading-relaxed">{config.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[11px] font-bold text-[#374151] uppercase tracking-[0.1em]">Ready to Synth</span>
           </div>
        </div>
      </header>

      <div className="flex gap-10 items-start relative min-h-[800px]">
        {/* Creation Controls (Collapsible) */}
        <motion.div 
            animate={{ 
                width: isCollapsed ? 0 : '420px',
                opacity: isCollapsed ? 0 : 1,
                marginRight: isCollapsed ? -40 : 0,
                pointerEvents: isCollapsed ? 'none' : 'auto'
            }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="shrink-0 space-y-8 sticky top-10 overflow-hidden"
        >
           <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-[12px] font-bold font-display">1</span>
                <h3 className="text-[14px] font-bold text-[#374151] uppercase tracking-widest">Конфигурация</h3>
              </div>
           </div>

           <GlassCard className="p-8 bg-white border-[#E5E7EB] shadow-xl space-y-10">
              <div className="space-y-8">
                {config.fields.map((field) => (
                  <AIField 
                    key={field.id} 
                    label={field.label} 
                    description={field.description}
                    id={field.id}
                  >
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

                {/* Advanced Settings */}
                <div className="pt-6 border-t border-[#F3F4F6]">
                   <button 
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center justify-between w-full p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#10B981]/30 transition-all group"
                   >
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] group-hover:text-[#10B981] transition-colors">
                           <Settings2 size={16} />
                        </div>
                        <span className="text-[13px] font-bold text-[#4B5563] group-hover:text-[#111827] transition-colors">Расширенные AI-настройки</span>
                     </div>
                     <motion.div
                        animate={{ rotate: showAdvanced ? 180 : 0 }}
                        className="text-[#9CA3AF]"
                     >
                        <ChevronLeft size={16} className="-rotate-90" />
                     </motion.div>
                   </button>

                   <AnimatePresence>
                     {showAdvanced && (
                       <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                       >
                         <div className="pt-8 space-y-8">
                            <AIField label="Целевая аудитория" description="Для кого создаем контент?">
                               <AIInput 
                                  placeholder="Например: Фрилансеры-дизайнеры..." 
                                  value={formValues.advanced_audience}
                                  onChange={(e) => handleInputChange('advanced_audience', e.target.value)}
                               />
                            </AIField>

                            <AIField label="Эмоциональность">
                               <AIToggleGroup 
                                  value={formValues.advanced_emotion}
                                  onChange={(val) => handleInputChange('advanced_emotion', val)}
                                  options={[
                                    { value: 'calm', label: 'Сдержанный' },
                                    { value: 'moderate', label: 'Умеренный' },
                                    { value: 'active', label: 'Драйвовый' },
                                  ]}
                               />
                            </AIField>

                            <AIField label="Сложность терминов">
                               <AIToggleGroup 
                                  value={formValues.advanced_complexity}
                                  onChange={(val) => handleInputChange('advanced_complexity', val)}
                                  options={[
                                    { value: 'simple', label: 'Просто' },
                                    { value: 'balanced', label: 'Баланс' },
                                    { value: 'pro', label: 'Профи' },
                                  ]}
                               />
                            </AIField>

                            <AIField label="Цель коммуникации">
                               <AIPillSelector 
                                  value={[formValues.advanced_goal]}
                                  onChange={(val) => handleInputChange('advanced_goal', val[0])}
                                  options={[
                                    { value: 'engagement', label: 'Охваты' },
                                    { value: 'sale', label: 'Конверсии' },
                                    { value: 'trust', label: 'Лояльность' },
                                    { value: 'viral', label: 'Хайп' },
                                  ]}
                               />
                            </AIField>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-4">
                  <AlertCircle size={18} className="text-red-500 shrink-0" />
                  <p className="text-[13px] text-red-600 font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <div className="pt-8 border-t border-[#F3F4F6]">
                <Button 
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  size="xl" 
                  className="w-full gap-3 shadow-[0_12px_24px_rgba(16,185,129,0.2)] rounded-2xl h-14"
                >
                  <Wand2 size={24} />
                  <span>{config.actionLabel}</span>
                </Button>
                
                <div className="flex items-center justify-between mt-6 px-1">
                   <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[#9CA3AF] hover:text-[#10B981] transition-colors"
                  >
                    <RotateCcw size={14} />
                    Сбросить
                  </button>
                  <span className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-tight">Catalyst v4.4</span>
                </div>
              </div>
           </GlassCard>
        </motion.div>

        {/* Workspace Toggle Button (Sticky) */}
        <div className="h-full flex items-center justify-center sticky top-1/2 z-30">
           <button 
              onClick={toggleCollapse}
              className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] shadow-lg flex items-center justify-center text-[#9CA3AF] hover:text-[#10B981] hover:border-[#10B981]/30 transition-all group -ml-5 translate-x-2"
              title={isCollapsed ? "Развернуть панель" : "Свернуть панель"}
           >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
           </button>
        </div>

        {/* Results Workspace */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <span className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold font-display transition-all",
                    result ? "bg-[#10B981] text-white" : "bg-[#E5E7EB] text-[#9CA3AF]"
                 )}>2</span>
                 <h3 className="text-[14px] font-bold text-[#374151] uppercase tracking-widest">Просмотр результата</h3>
              </div>
              <div className="flex items-center gap-8 text-[#9CA3AF] text-[12px] font-bold uppercase tracking-widest">
                 <button className="hover:text-[#10B981] transition-colors">Скачать PDF</button>
                 <button className="hover:text-[#10B981] transition-colors">Экспорт</button>
              </div>
           </div>

           <div className="min-h-[600px] flex flex-col">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex-1"
                  >
                    <GlassCard className="h-full flex-1 flex items-center justify-center bg-[#F9FAFB]/50 border-dashed border-[#CBD5E1] rounded-[3rem]">
                       <GenerationLoader status={generationStep} statusColor="#10B981" />
                    </GlassCard>
                  </motion.div>
                ) : result ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full flex-1"
                  >
                    {config.id === 'planner' ? (
                       <PlannerResultDisplay result={result} />
                    ) : (
                       <div className="flex flex-col items-center justify-center h-full p-20 text-center bg-white border border-[#E5E7EB] rounded-[3.5rem] shadow-2xl">
                          <div className="w-24 h-24 rounded-[2.5rem] bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-[#10B981] mb-12 shadow-sm">
                             <Sparkles size={44} />
                          </div>
                          <h2 className="text-4xl font-bold text-[#111827] mb-4 font-display tracking-tight">Синтез успешно завершен</h2>
                          <p className="text-[#6B7280] text-[18px] font-medium max-w-md mb-14 leading-relaxed">Ваш проект готов к публикации или экспорту. Просмотрите детали ниже.</p>
                          <div className="flex items-center gap-6">
                             <Button size="xl" className="rounded-2xl px-12">Редактировать</Button>
                             <Button variant="outline" size="xl" className="rounded-2xl border-[#E5E7EB]">Сохранить в облако</Button>
                          </div>
                       </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex-1"
                  >
                    <GlassCard className="h-full flex-1 flex items-center justify-center bg-[#F9FAFB]/50 border-dashed border-[#CBD5E1] hover:border-[#10B981]/40 transition-all duration-1000 rounded-[3.5rem]">
                       <EmptyResultState 
                        title="Ожидание параметров для синтеза"
                        description="Заполните настройки в левой части экрана, чтобы Ваш AI-ассистент смог сформировать идеальный контент."
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
