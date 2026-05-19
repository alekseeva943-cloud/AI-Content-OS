import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  History,
  Trash2,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { EmptyResultState, GenerationLoader } from '@/src/shared/components/ResultPanel';
import { AIField, AIInput, AITextarea, AISelect, AIToggleGroup, AIPillSelector, AIDateInput } from './forms/FormComponents';
import { ModuleConfig } from '@/src/config/modules';
import { detectCampaignVariables, generateCampaign, generateContentPlan, generateLongread, generatePodcast, generateVideoAvatar } from '@/src/services/ai/client';
import { useMemoryStore } from '@/src/stores/memoryStore';
import { useFavoritesStore } from '@/src/stores/favoritesStore';
import { useWorkspaceStore } from '@/src/stores/workspaceStore';
import { useBrandStore } from '@/src/stores/brandStore';
import { toast } from 'sonner';
import { PlannerResultDisplay } from '@/src/features/planner/components/PlannerResult';
import { CampaignResultDisplay } from '@/src/features/newsletter/components/CampaignResult';
import { LongreadResultDisplay } from '@/src/features/longreads/components/LongreadResult';
import { PodcastResultDisplay } from '@/src/features/podcasts/components/PodcastResult';
import { VideoAvatarResultDisplay } from '@/src/features/videoAvatar/components/VideoAvatarResult';
import { VariableRequirement } from '@/src/types/newsletter';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { AdvancedSettings, AdvancedSettingsState } from '@/src/features/planner/components/AdvancedSettings';

const moduleLabels: Record<string, string> = {
  planner: 'Планировщик',
  newsletters: 'Publishing Studio',
  podcasts: 'Подкасты',
  avatars: 'AI-Аватары',
  longreads: 'Лонгриды',
};

interface ModulePageProps {
  config: ModuleConfig;
}

export function ModulePage({ config }: ModulePageProps) {
  const { modules, setModuleState, clearModule } = useWorkspaceStore();
  const brandVariables = useBrandStore(state => state.variables);
  const updateBrandVariable = useBrandStore(state => state.updateVariable);
  const history = useMemoryStore(state => state.history);

  const rawState = modules[config.id];
  const moduleState = {
    formValues: rawState?.formValues || {},
    result: rawState?.result || null,
    showAdvanced: rawState?.showAdvanced || false,
    sourceInfo: rawState?.sourceInfo || null,
    builderStep: rawState?.builderStep || 'input',
    requirements: (rawState?.requirements || []) as VariableRequirement[],
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [generationStep, setGenerationStep] = useState<string>('Инициализация...');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const showAdvanced = moduleState.showAdvanced;
  const setShowAdvanced = (val: boolean) => setModuleState(config.id, { showAdvanced: val });
  
  const result = moduleState.result;
  const setResult = (val: any) => setModuleState(config.id, { result: val });

  const sourceInfo = moduleState.sourceInfo;
  const setSourceInfo = (val: { id?: string; module?: string; title?: string } | null) => setModuleState(config.id, { sourceInfo: val });

  const formValues = React.useMemo(() => {
    const initial: Record<string, any> = {};
    config.fields.forEach(f => {
      initial[f.id] = f.defaultValue || '';
    });
    initial['adv_preset'] = 'business';
    initial['adv_goal'] = 'sell';
    initial['adv_audience'] = 'newbie';
    initial['adv_tone'] = 'friendly';
    initial['adv_formality'] = 24;
    initial['adv_emotion'] = 38;
    initial['adv_length'] = 'balanced';
    initial['adv_complexity'] = 'standard';

    return { ...initial, ...moduleState.formValues };
  }, [config.id, moduleState.formValues]);

  const setFormValues = (updater: (prev: Record<string, any>) => Record<string, any>) => {
    const nextValues = updater(formValues);
    setModuleState(config.id, { formValues: nextValues });
  };

  // Handle pre-filling from repurposed items
  useEffect(() => {
    const state = location.state as any;
    if (state?.sourceContent) {
      const { sourceContent, sourceTitle, sourceModule, sourceId } = state;
      setSourceInfo({ id: sourceId, module: sourceModule, title: sourceTitle });
      
      setFormValues(prev => {
        const next = { ...prev };
        // Map source content to appropriate fields
        if (typeof sourceContent === 'string') {
          if (next.topic !== undefined) next.topic = sourceTitle || sourceContent.slice(0, 50);
          if (next.context !== undefined) next.context = sourceContent;
        } else {
          // If it's an object (like a PlannerItem or full result)
          const topic = sourceContent.topic || sourceContent.title || sourceTitle;
          const context = sourceContent.description || sourceContent.summary || sourceContent.content;
          
          if (next.topic !== undefined) next.topic = topic;
          if (next.context !== undefined) next.context = context;
          if (sourceContent.channel && next.channels !== undefined) {
             next.channels = Array.isArray(next.channels) ? [sourceContent.channel] : sourceContent.channel;
          }
        }
        return next;
      });
      
      toast.info(`Использован контент из: ${sourceTitle || sourceModule}`);
      // Clear location state to avoid re-triggering on navigate back
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, config.fields, navigate]);

  const addGeneration = useMemoryStore(state => state.addGeneration);
  const sharedMemory = useMemoryStore(state => state.sharedMemory);
  const addFavorite = useFavoritesStore(state => state.addFavorite);

  const handleInputChange = (id: string, value: any) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
  };

  const handleAdvancedChange = (key: keyof AdvancedSettingsState, value: any) => {
    setFormValues(prev => ({ ...prev, [`adv_${key}`]: value }));
  };

  const steps = [
    'Анализирую культурный код вашей ниши...',
    'Проектирую смысловые слои кампании...',
    'Синтезирую креативные концепции...',
    'Подбираю оптимальное время публикаций...',
    'Кристаллизую финальную стратегию...'
  ];

  const handleCampaignDiscovery = async () => {
    setIsDiscovering(true);
    setError(null);
    try {
        const { requirements, suggestedChannels } = await detectCampaignVariables({
            topic: formValues.topic,
            context: formValues.context
        });
        
        // Auto-select suggested channels if none selected or just to help
        if (suggestedChannels?.length > 0) {
            handleInputChange('channels', suggestedChannels);
        }

        setModuleState(config.id, { requirements, builderStep: 'variables' });
        toast.info('AI проанализировал запрос и обнаружил важные переменные');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsDiscovering(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);
    setError(null);
    setIsCollapsed(true);
    
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
            startDate: formValues.startDate,
            sharedMemory,
            // Advanced parameters - ONLY applied if showAdvanced is true
            advanced: showAdvanced ? {
                preset: formValues.adv_preset,
                goal: formValues.adv_goal,
                audience: formValues.adv_audience,
                tone: formValues.adv_tone,
                formality: formValues.adv_formality,
                emotion: formValues.adv_emotion,
                length: formValues.adv_length,
                complexity: formValues.adv_complexity,
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
      } else if (config.id === 'newsletters') {
         const request = {
            topic: formValues.topic,
            context: formValues.context,
            variables: { ...brandVariables, ...formValues.variables },
            channels: ['email', 'telegram', 'vk'], // Dynamic selection can be added later
            advanced: showAdvanced ? {
                tone: formValues.adv_tone,
                emotion: formValues.adv_emotion,
            } : undefined
         };
         
         const data = await generateCampaign(request as any);
         setResult(data);
         setModuleState(config.id, { builderStep: 'result' });
         
         addGeneration({
            type: 'newsletter',
            data,
            metadata: {
                topic: request.topic,
            }
         });
      } else if (config.id === 'longreads') {
         const request = {
            topic: formValues.title || formValues.topic,
            context: formValues.layers || formValues.context,
            advanced: showAdvanced ? { tone: formValues.adv_tone } : { tone: formValues.style }
         };
         const data = await generateLongread(request);
         setResult(data);
         addGeneration({ type: 'longread', data, metadata: { topic: request.topic } });
      } else if (config.id === 'podcasts') {
         const request = { 
            topic: formValues.guest || formValues.topic, 
            context: formValues.theme || formValues.context 
         };
         const data = await generatePodcast(request);
         setResult(data);
         addGeneration({ type: 'podcast', data, metadata: { topic: request.topic } });
      } else if (config.id === 'avatars') {
         const request = { 
            topic: formValues.style || formValues.topic, 
            context: formValues.script || formValues.context 
         };
         const data = await generateVideoAvatar(request);
         setResult(data);
         addGeneration({ type: 'avatars', data, metadata: { topic: request.topic } });
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
    const initial: Record<string, any> = {};
    config.fields.forEach(f => {
      initial[f.id] = f.defaultValue || '';
    });
    initial['adv_preset'] = 'business';
    initial['adv_goal'] = 'sell';
    initial['adv_audience'] = 'newbie';
    initial['adv_tone'] = 'friendly';
    initial['adv_formality'] = 24;
    initial['adv_emotion'] = 38;
    initial['adv_length'] = 'balanced';
    initial['adv_complexity'] = 'standard';

    clearModule(config.id, initial);
    setError(null);
    setIsGenerating(false);
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const advancedValues: AdvancedSettingsState = {
    preset: formValues.adv_preset,
    goal: formValues.adv_goal,
    audience: formValues.adv_audience,
    tone: formValues.adv_tone,
    formality: formValues.adv_formality,
    emotion: formValues.adv_emotion,
    length: formValues.adv_length,
    complexity: formValues.adv_complexity,
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden pb-10 mx-auto w-full max-w-[1700px] px-8">
      {/* Workspace Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-[#E5E7EB] shrink-0">
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
           <button 
             onClick={() => {
                if (confirm('Вы уверены, что хотите очистить ВСЕ рабочие пространства?')) {
                  useWorkspaceStore.getState().resetAll();
                  toast.success('Все рабочие пространства очищены');
                }
             }}
             className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-[#E5E7EB] text-[#9CA3AF] hover:text-red-500 hover:border-red-200 transition-all shadow-sm text-[11px] font-bold uppercase tracking-wider"
           >
              <Trash2 size={14} />
              <span>Reset All</span>
           </button>
           <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[11px] font-bold text-[#374151] uppercase tracking-[0.1em]">Ready to Synth</span>
           </div>
        </div>
      </header>

      <div className="flex gap-10 items-start relative flex-1 overflow-hidden pt-10">
        {/* Creation Controls (Collapsible) */}
        <motion.div 
            animate={{ 
                width: isCollapsed ? 0 : '480px', // Wider panel for advanced settings
                opacity: isCollapsed ? 0 : 1,
                marginRight: isCollapsed ? -40 : 0,
                pointerEvents: isCollapsed ? 'none' : 'auto'
            }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="shrink-0 h-full overflow-y-auto pr-4 no-scrollbar custom-scroll space-y-8"
        >
           <div className="flex items-center justify-between mb-2 group">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-[12px] font-bold font-display">1</span>
                <h3 className="text-[14px] font-bold text-[#374151] uppercase tracking-widest">Конфигурация</h3>
              </div>
              <button 
                onClick={handleReset}
                className="p-2 rounded-xl text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2"
                title="Очистить рабочее пространство"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider">Очистить</span>
                <Trash2 size={16} />
              </button>
           </div>

           <GlassCard className="p-8 bg-white border-[#E5E7EB] shadow-xl space-y-10">
              <div className="space-y-8">
                {config.id === 'newsletters' && moduleState.builderStep === 'variables' ? (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div className="p-6 rounded-3xl bg-[#10B981]/5 border border-[#10B981]/10 mb-2">
                            <p className="text-[13px] text-[#065F46] font-semibold leading-relaxed">
                                AI проанализировал Ваш запрос. Для создания безупречной кампании без "заглушек", пожалуйста, уточните следующие детали:
                            </p>
                        </div>
                        {moduleState.requirements.map((req: VariableRequirement) => (
                            <AIField 
                                key={req.id} 
                                label={req.label} 
                                description={req.description}
                                id={req.id}
                            >
                                <AIInput 
                                    placeholder={req.importance === 'critical' ? 'Обязательно для заполнения...' : 'Опционально...'}
                                    value={formValues.variables?.[req.id] || ''}
                                    onChange={(e) => {
                                        const nextVars = { ...(formValues.variables || {}), [req.id]: e.target.value };
                                        handleInputChange('variables', nextVars);
                                    }}
                                />
                            </AIField>
                        ))}
                        <button 
                            onClick={() => setModuleState(config.id, { builderStep: 'input' })}
                            className="text-[12px] font-bold text-[#9CA3AF] hover:text-[#111827] flex items-center gap-2 uppercase tracking-widest transition-colors"
                        >
                            <ChevronLeft size={14} />
                            Назад к описанию
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {config.id === 'newsletters' && (
                            <AIField 
                                label="Выберите тему из планировщика" 
                                description="Или оставьте пустым, чтобы ввести вручную"
                            >
                                <AISelect 
                                    options={[
                                        { value: '', label: 'Введите тему вручную...' },
                                        ...history
                                            .filter(h => h.type === 'planner')
                                            .map(h => ({ 
                                                value: h.metadata?.topic || h.id, 
                                                label: h.metadata?.topic || 'План от ' + new Date(h.timestamp).toLocaleDateString() 
                                            }))
                                    ]}
                                    value={history.find(h => h.metadata?.topic === formValues.topic)?.metadata?.topic || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val) {
                                            const item = history.find(h => h.metadata?.topic === val);
                                            setFormValues(prev => ({
                                                ...prev,
                                                topic: val,
                                                context: item?.metadata?.topic || prev.context
                                            }));
                                        }
                                    }}
                                />
                            </AIField>
                        )}
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
                        {field.type === 'date' && (
                            <AIDateInput 
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
                )}
              </div>

                {sourceInfo && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-[2rem] bg-[#10B981]/5 border border-[#10B981]/20 flex items-start gap-4 mb-6 shadow-sm"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white border border-[#10B981]/20 flex items-center justify-center text-[#10B981] shrink-0 shadow-sm">
                            <History size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.15em]">Контекстная связь</span>
                                <button 
                                    onClick={() => setSourceInfo(null)}
                                    className="text-[10px] font-bold text-[#9CA3AF] hover:text-red-500 transition-colors uppercase tracking-widest"
                                >
                                    Удалить
                                </button>
                            </div>
                            <h4 className="text-[14px] font-bold text-[#111827] truncate font-display">
                                {sourceInfo.title || 'Предыдущий результат'}
                            </h4>
                            <p className="text-[11px] text-[#6B7280] font-medium mt-1 uppercase tracking-wider">
                                {moduleLabels[sourceInfo.module || ''] || 'Источник'} 
                                <span className="mx-1.5 opacity-30">•</span> 
                                AI Repurpose
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Advanced Settings Section */}
                <div className="pt-6 border-t border-[#F3F4F6]">
                   <button 
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center justify-between w-full p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#10B981]/30 transition-all group"
                   >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] group-hover:text-[#6366F1] group-hover:border-[#6366F1]/30 transition-all shadow-sm">
                           <Settings2 size={18} />
                        </div>
                        <div className="flex flex-col items-start translate-y-0.5">
                           <span className="text-[13px] font-black text-[#4B5563] group-hover:text-[#111827] transition-colors leading-none mb-1">Сложные AI-настройки</span>
                           <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider leading-none">Тон и интонация</span>
                        </div>
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
                         <AdvancedSettings 
                           values={advancedValues} 
                           onChange={handleAdvancedChange} 
                         />
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>

               {error && (
                 <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-4">
                   <AlertCircle size={18} className="text-red-500 shrink-0" />
                   <p className="text-[13px] text-red-600 font-medium leading-relaxed">{error}</p>
                 </div>
               )}

               <div className="pt-8 border-t border-[#F3F4F6]">
                 <Button 
                   onClick={config.id === 'newsletters' && moduleState.builderStep === 'input' ? handleCampaignDiscovery : handleGenerate}
                   isLoading={isGenerating || isDiscovering}
                   size="xl" 
                   className="w-full gap-3 shadow-[0_12px_24px_rgba(16,185,129,0.2)] rounded-2xl h-14"
                 >
                   <Wand2 size={24} />
                   <span>
                    {config.id === 'newsletters' && moduleState.builderStep === 'input' 
                      ? 'Спланировать кампанию' 
                      : (config.id === 'newsletters' && moduleState.builderStep === 'variables' ? 'Запустить генерацию' : config.actionLabel)}
                   </span>
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
         <div className="flex-1 h-full overflow-y-auto pr-4 no-scrollbar custom-scroll flex flex-col gap-8 min-w-0">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <span className={cn(
                     "w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold font-display transition-all",
                     result ? "bg-[#10B981] text-white" : "bg-[#E5E7EB] text-[#9CA3AF]"
                  )}>2</span>
                  <h3 className="text-[14px] font-bold text-[#374151] uppercase tracking-widest">Просмотр результата</h3>
               </div>
               <div className="flex items-center gap-6 text-[#9CA3AF] text-[12px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2 mr-4 px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] shadow-sm">
                     <button 
                       onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                       className="p-1 hover:text-[#10B981] transition-colors"
                       title="Уменьшить масштаб"
                     >
                       <Minus size={14} />
                     </button>
                     <span className="w-12 text-center text-[10px] text-[#374151] font-black">{Math.round(zoom * 100)}%</span>
                     <button 
                       onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                       className="p-1 hover:text-[#10B981] transition-colors"
                       title="Увеличить масштаб"
                     >
                       <Plus size={14} />
                     </button>
                  </div>
                  <button className="hover:text-[#10B981] transition-colors">Скачать PDF</button>
                  <button className="hover:text-[#10B981] transition-colors">Экспорт</button>
               </div>
            </div>

            <div 
              className="min-h-[600px] flex flex-col origin-top transition-all duration-300"
              style={{ 
                transform: `scale(${zoom})`, 
                width: zoom < 1 ? `${100 / zoom}%` : '100%' 
              }}
            >
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
                        <PlannerResultDisplay result={result} sourceInfo={sourceInfo} />
                     ) : config.id === 'newsletters' ? (
                        <CampaignResultDisplay 
                         result={result} 
                         sourceInfo={sourceInfo}
                         onRegenerate={handleGenerate}
                        />
                     ) : config.id === 'longreads' ? (
                         <LongreadResultDisplay result={result} sourceInfo={sourceInfo} onRegenerate={handleGenerate} />
                     ) : config.id === 'podcasts' ? (
                         <PodcastResultDisplay result={result} sourceInfo={sourceInfo} onRegenerate={handleGenerate} />
                     ) : config.id === 'avatars' ? (
                         <VideoAvatarResultDisplay result={result} sourceInfo={sourceInfo} onRegenerate={handleGenerate} />
                     ) : (
                        <div className="flex flex-col items-center justify-center h-full p-20 text-center bg-white border border-[#E5E7EB] rounded-[3.5rem] shadow-2xl">
                           <div className="w-24 h-24 rounded-[2.5rem] bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-[#10B981] mb-12 shadow-sm">
                              <Sparkles size={44} />
                           </div>
                           <h2 className="text-4xl font-bold text-[#111827] mb-4 font-display tracking-tight">Материал готов</h2>
                           <p className="text-[#6B7280] text-[18px] font-medium max-w-md mb-14 leading-relaxed">Черновик собран и готов к публикации или экспорту.</p>
                           <div className="flex items-center gap-6">
                              <Button size="xl" className="rounded-2xl px-12">Редактировать</Button>
                              <Button 
                                 variant="outline" 
                                 size="xl" 
                                 className="rounded-2xl border-[#E5E7EB]"
                                 onClick={() => {
                                   addFavorite({
                                     id: `${config.id}-${Date.now()}`,
                                     moduleId: config.id,
                                     type: 'result',
                                     title: `${config.title} Result`,
                                     content: result,
                                     metadata: {
                                       generatedAt: new Date().toISOString(),
                                       sourceId: sourceInfo?.id,
                                       sourceModule: sourceInfo?.module
                                     }
                                   });
                                   toast.success('Сохранено в избранное');
                                 }}
                              >
                                 Сохранить в избранное
                              </Button>
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
