import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PlannerItem, PlannerResult, PostSettings } from '@/src/types/planner';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { cn } from '@/src/lib/utils';
import { useFavoritesStore } from '@/src/stores/favoritesStore';
import { toast } from 'sonner';

// Extracted utils, configs, hooks and components
import { 
  getItemsWithFallbackDates, 
  groupItemsByDay, 
  formatDateFull, 
  formatDateLabelCard 
} from './plannerDateUtils';

import { 
  channelConfig 
} from './plannerChannelConfig';

import { 
  usePlannerCardActions 
} from './usePlannerCardActions';

import { 
  PlannerCardSettings 
} from './PlannerCardSettings';

import { 
  PlannerCardActions 
} from './PlannerCardActions';

import { 
  GeneratedPostPreview 
} from './GeneratedPostPreview';

interface PlannerResultProps {
  result: PlannerResult;
  onSelect?: (item: PlannerItem) => void;
  sourceInfo?: { id?: string; module?: string; title?: string } | null;
}

export function PlannerResultDisplay({ result, sourceInfo }: PlannerResultProps) {
  const { addFavorite } = useFavoritesStore();

  const handleSaveAll = () => {
    addFavorite({
      id: `planner-${result.title}-${Date.now()}`,
      moduleId: 'planner',
      type: 'plan',
      title: result.title,
      content: result,
      metadata: {
        itemCount: result.items.length,
        sourceId: sourceInfo?.id,
        sourceModule: sourceInfo?.module
      }
    });
    toast.success('Весь план сохранен в избранное');
  };

  // Debug log to trace response shape
  console.log('[PlannerResultDisplay] Rendering with result:', result);

  // Group items by day with defensive check and front-end date reconstruction fallback
  const items = getItemsWithFallbackDates(result?.items ?? []);
  const itemsByDay = groupItemsByDay(items);

  const days = Object.keys(itemsByDay).sort((a, b) => {
    // Sort by actual date
    const timeA = !isNaN(Date.parse(a)) ? new Date(a).getTime() : 0;
    const timeB = !isNaN(Date.parse(b)) ? new Date(b).getTime() : 0;
    return timeA - timeB;
  });

  if (items.length === 0) {
    return (
      <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500 font-medium">План пуст. Попробуйте сгенерировать снова.</p>
        <pre className="mt-4 p-4 bg-white rounded-xl text-left text-xs text-gray-400 overflow-auto max-w-full">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
            <Sparkles size={16} />
          </div>
          <span className="text-[12px] font-bold text-[#10B981] uppercase tracking-[0.2em]">Результат генерации</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl font-bold text-[#111827] font-display tracking-tight leading-[1.1]">{result?.title ?? 'Без названия'}</h2>
          <p className="text-[#6B7280] text-[18px] leading-relaxed max-w-3xl font-medium">{result?.summary ?? 'Описание стратегии.'}</p>
        </div>
      </header>

      <div className="space-y-24">
        {days.map((day, idx) => (
          <section key={day} className="space-y-10 group/section">
             <div className="flex items-center gap-8">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-[1.25rem] bg-[#111827] text-white flex items-center justify-center font-bold text-base shadow-[0_8px_20px_rgba(17,24,39,0.15)] group-hover/section:scale-110 transition-transform duration-500">
                     {idx + 1}
                   </div>
                   <h3 className="text-3xl font-bold text-[#111827] tracking-tighter font-display">
                     {formatDateFull(day)}
                   </h3>
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#E5E7EB] via-[#F3F4F6] to-transparent" />
                <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">{itemsByDay[day].length} Публикаций</div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {itemsByDay[day].map((item, i) => (
                  <PlanItemCard key={item.id || `${day}-${i}`} item={item} index={i} sourceInfo={sourceInfo} />
                ))}
             </div>
          </section>
        ))}
      </div>
      
      <footer className="pt-20 pb-10 flex flex-col items-center gap-6 border-t border-[#F3F4F6]">
        <div className="flex items-center gap-4">
           <Button size="xl" className="rounded-2xl px-12 group">
              <span>Экспортировать весь план</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </Button>
           <Button 
                variant="outline" 
                size="xl" 
                className="rounded-2xl px-12 border-[#E5E7EB]"
                onClick={handleSaveAll}
            >
              Сохранить в избранное
           </Button>
        </div>
        <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">Content OS Engine V4.0</p>
      </footer>
    </div>
  );
}

function PlanItemCard({ 
  item: initialItem, 
  index, 
  sourceInfo 
}: { 
  item: PlannerItem; 
  index: number; 
  key?: string; 
  sourceInfo?: { id?: string; module?: string; title?: string } | null;
}) {
  const [showLocalSettings, setShowLocalSettings] = useState(false);
  
  const [localSettings, setLocalSettings] = useState<PostSettings>(initialItem.aiSettings || {
    tone: 'friendly',
    length: 'balanced',
    hookIntensity: 50,
    ctaStrength: 50,
    emojiDensity: 50,
    formattingStyle: 'standard',
    aggressiveness: 30,
    storytelling: 50,
    educationalDepth: 40,
  });

  const {
    item,
    copied,
    isGenerating,
    isRegenerating,
    generatedText,
    activeFavorite,
    toggleFavorite,
    handleCopy,
    handleGeneratePost,
    handleRegenerate
  } = usePlannerCardActions({
    initialItem,
    index,
    localSettings,
    sourceInfo
  });

  const channelStyles: Record<string, { container: string; text: string; label: string; badge: string; angle: string }> = {
    telegram: {
      container: "bg-sky-50 text-sky-600 border-sky-100 group-hover/card:bg-sky-100/80 group-hover/card:border-sky-300 group-hover/card:text-sky-700",
      text: "text-sky-600 group-hover/card:text-sky-700",
      label: "text-sky-600",
      badge: "bg-sky-500/90 group-hover/card:bg-sky-500",
      angle: "text-sky-700 bg-sky-50/60 border-sky-100"
    },
    vk: {
      container: "bg-blue-50 text-blue-600 border-blue-100 group-hover/card:bg-blue-100/80 group-hover/card:border-blue-300 group-hover/card:text-blue-700",
      text: "text-blue-600 group-hover/card:text-blue-700",
      label: "text-blue-600",
      badge: "bg-blue-600/90 group-hover/card:bg-blue-600",
      angle: "text-blue-700 bg-blue-50/60 border-blue-100"
    },
    email: {
      container: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover/card:bg-emerald-100/80 group-hover/card:border-emerald-300 group-hover/card:text-emerald-700",
      text: "text-emerald-600 group-hover/card:text-emerald-700",
      label: "text-emerald-600",
      badge: "bg-emerald-500/90 group-hover/card:bg-emerald-500",
      angle: "text-emerald-700 bg-emerald-50/60 border-emerald-100"
    },
    youtube: {
      container: "bg-rose-50 text-rose-600 border-rose-100 group-hover/card:bg-rose-100/80 group-hover/card:border-rose-300 group-hover/card:text-rose-700",
      text: "text-rose-600 group-hover/card:text-rose-700",
      label: "text-rose-600",
      badge: "bg-rose-600/90 group-hover/card:bg-rose-600",
      angle: "text-rose-700 bg-rose-50/60 border-rose-100"
    },
    linkedin: {
      container: "bg-indigo-50 text-indigo-600 border-indigo-100 group-hover/card:bg-indigo-100/80 group-hover/card:border-indigo-300 group-hover/card:text-indigo-700",
      text: "text-indigo-600 group-hover/card:text-indigo-700",
      label: "text-indigo-600",
      badge: "bg-indigo-600/90 group-hover/card:bg-indigo-600",
      angle: "text-indigo-700 bg-indigo-50/60 border-indigo-100"
    }
  };

  const chStyle = channelStyles[item.channel as keyof typeof channelStyles] || channelStyles.telegram;

  const updateLocalSetting = (key: keyof PostSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const config = channelConfig[item.channel as keyof typeof channelConfig] || channelConfig.telegram;
  const Icon = config.icon;

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="group/card h-full"
    >
        <GlassCard className={cn(
            "p-10 bg-white border-[#E5E7EB] transition-all duration-700 shadow-sm hover:shadow-2xl flex flex-col h-full rounded-[2.5rem] relative overflow-hidden",
            config.hoverBorder
        )}>
        <div 
          style={{ background: `linear-gradient(225deg, ${config.color}0D, transparent)` }}
          className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 -z-10" 
        />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
            <div className="flex items-center gap-5 flex-wrap">
                <div className={cn(
                    "w-14 h-14 shrink-0 rounded-[1.25rem] border flex items-center justify-center transition-all duration-500 shadow-sm",
                    chStyle.container,
                    "group-hover/card:scale-110"
                )}>
                    <Icon size={26} />
                </div>
                <div className="flex flex-col gap-2 min-w-0">
                   <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                            "text-[12px] font-black uppercase tracking-[0.15em] leading-none shrink-0 transition-colors duration-500",
                            chStyle.text
                        )}>{config.label}</span>
                        {item.type && (
                             <span className={cn(
                                "text-[10px] font-black text-white px-2.5 py-1 rounded-md uppercase tracking-widest whitespace-nowrap",
                                chStyle.badge
                             )}>
                                {item.type}
                             </span>
                        )}
                        {item.angle && (
                             <span className={cn(
                                "text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border whitespace-nowrap",
                                chStyle.angle
                             )}>
                                {item.angle}
                             </span>
                        )}
                   </div>
                   <div className="flex items-center gap-2.5 text-[#6B7280]">
                      <Calendar size={14} strokeWidth={2.5} className="text-[#9CA3AF]" />
                      <span className="text-[13px] font-bold leading-none">{formatDateLabelCard(item.publishDate) || item.day}</span>
                      <div className="w-[3px] h-[3px] rounded-full bg-[#D1D5DB]" />
                      <Clock size={14} strokeWidth={2.5} className="text-[#9CA3AF]" />
                      <span className="text-[13px] font-bold leading-none">{item.time}</span>
                   </div>
                </div>
            </div>
        </div>

        <div className="space-y-6 flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <h4 className={cn(
                "text-2xl font-bold text-[#111827] leading-[1.2] transition-colors font-display tracking-tight flex-1",
                `group-hover/card:${config.text}`
            )}>
                {item.topic}
            </h4>
            {item.goal && (
              <span className="shrink-0 self-start text-[10px] font-bold text-[#6B7280] border border-[#E5E7EB] px-2.5 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap bg-[#F9FAFB]">
                {item.goal}
              </span>
            )}
          </div>
          
          <GeneratedPostPreview 
            generatedText={generatedText}
            item={item}
            handleCopy={handleCopy}
          />

          {item.rationale && !generatedText && (
              <div className={cn(
                  "p-5 rounded-[1.5rem] bg-[#F9FAFB] border border-[#E5E7EB] border-l-4 shadow-sm transition-all duration-500",
                  config.hoverBorderLeft
              )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className={cn(config.text)} />
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", config.text)}>Почему это важно</span>
                  </div>
                  <p className="text-[13px] text-[#4B5563] italic font-medium leading-relaxed">
                      {item.rationale}
                  </p>
              </div>
          )}

          {item.hashtags && item.hashtags.length > 0 && !generatedText && (
              <div className="flex flex-wrap gap-2.5 pt-4">
                  {item.hashtags.map(tag => (
                     <span key={tag} className="text-[11px] font-bold text-[#059669] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-default">#{tag}</span>
                  ))}
              </div>
          )}

          {/* Local Settings Toggle Section */}
          <PlannerCardSettings 
            showLocalSettings={showLocalSettings}
            setShowLocalSettings={setShowLocalSettings}
            localSettings={localSettings}
            updateLocalSetting={updateLocalSetting}
            config={config}
          />
        </div>

        {/* Footer Actions Panel */}
        <PlannerCardActions 
          activeFavorite={activeFavorite}
          toggleFavorite={toggleFavorite}
          handleRegenerate={handleRegenerate}
          isRegenerating={isRegenerating}
          handleCopy={handleCopy}
          copied={copied}
          generatedText={generatedText}
          handleGeneratePost={handleGeneratePost}
          isGenerating={isGenerating}
          config={config}
        />
        </GlassCard>
    </motion.div>
  );
}
