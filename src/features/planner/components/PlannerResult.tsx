import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Send, 
  Mail, 
  Hash, 
  Copy, 
  Check,
  ChevronRight,
  PlusCircle,
  Star,
  RefreshCcw,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { PlannerItem, PlannerResult } from '@/src/types/planner';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { cn } from '@/src/lib/utils';
import { useMemoryStore } from '@/src/stores/memoryStore';

interface PlannerResultProps {
  result: PlannerResult;
  onSelect?: (item: PlannerItem) => void;
}

export function PlannerResultDisplay({ result }: PlannerResultProps) {
  // Group items by day
  const itemsByDay = result.items.reduce((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    acc[item.day].push(item);
    return acc;
  }, {} as Record<string, PlannerItem[]>);

  const days = Object.keys(itemsByDay);

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
            <Sparkles size={16} />
          </div>
          <span className="text-[12px] font-bold text-[#10B981] uppercase tracking-[0.2em]">Creative Outcome</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl font-bold text-[#111827] font-display tracking-tight leading-[1.1]">{result.title}</h2>
          <p className="text-[#6B7280] text-[18px] leading-relaxed max-w-3xl font-medium">{result.summary}</p>
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
                   <h3 className="text-3xl font-bold text-[#111827] tracking-tighter font-display">{day}</h3>
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#E5E7EB] via-[#F3F4F6] to-transparent" />
                <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">{itemsByDay[day].length} Publication{itemsByDay[day].length > 1 ? 's' : ''}</div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {itemsByDay[day].map((item, i) => (
                  <PlanItemCard key={item.id || `${day}-${i}`} item={item} index={i} />
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
           <Button variant="outline" size="xl" className="rounded-2xl px-12 border-[#E5E7EB]">
              Сохранить в избранное
           </Button>
        </div>
        <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">Catalyst Content System V4.0</p>
      </footer>
    </div>
  );
}

function PlanItemCard({ item, index }: { item: PlannerItem; index: number; key?: string }) {
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const addToSharedMemory = useMemoryStore(state => state.addToSharedMemory);

  const handleCopy = () => {
    const text = `Title: ${item.topic}\nAngle: ${item.angle || 'General'}\nDescription: ${item.description || ''}\nTime: ${item.time}\nChannel: ${item.channel}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToMemory = () => {
    addToSharedMemory(`Идея из планировщика: ${item.topic}. Контекст: ${item.description || ''}`);
  };

  const channelIcons = {
    telegram: Send,
    email: Mail,
    vk: MapPin, 
  };

  const Icon = channelIcons[item.channel] || Send;

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="group/card h-full"
    >
        <GlassCard className="p-10 bg-white border-[#E5E7EB] hover:border-[#10B981]/50 transition-all duration-700 shadow-sm hover:shadow-2xl flex flex-col h-full rounded-[2.5rem] relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#10B981]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 -z-10" />

        <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[1.25rem] bg-[#F9FAFB] border border-[#E5E7EB] text-[#9CA3AF] flex items-center justify-center transition-all group-hover/card:text-[#10B981] group-hover/card:bg-[#10B981]/10 group-hover/card:border-[#10B981]/30 group-hover/card:scale-110 duration-500 shadow-sm">
                    <Icon size={26} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-2.5">
                        <span className="text-[12px] font-black text-[#111827] uppercase tracking-[0.15em] leading-none">{item.channel}</span>
                        {item.angle && (
                             <span className="text-[9px] font-black text-white bg-[#10B981] px-2.5 py-1 rounded-md uppercase tracking-widest shadow-[0_4px_12px_rgba(16,185,129,0.2)]">
                                {item.angle}
                             </span>
                        )}
                   </div>
                   <div className="flex items-center gap-2.5 text-[#6B7280]">
                      <Clock size={14} strokeWidth={2.5} className="text-[#9CA3AF]" />
                      <span className="text-[13px] font-bold leading-none">{item.time}</span>
                   </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
               <ActionButton 
                  isActive={isFavorite}
                  onClick={() => setIsFavorite(!isFavorite)}
                  icon={Star}
                  activeColor="#EAB308"
                  activeBg="#FEF9C3"
               />
               <ActionButton 
                  onClick={handleCopy}
                  icon={copied ? Check : Copy}
                  activeColor={copied ? "#10B981" : undefined}
               />
            </div>
        </div>

        <div className="space-y-6 flex-1 flex flex-col">
          <h4 className="text-2xl font-bold text-[#111827] leading-[1.2] group-hover/card:text-[#10B981] transition-colors font-display tracking-tight">
              {item.topic}
          </h4>
          
          {item.description && (
              <p className="text-[16px] text-[#6B7280] leading-relaxed font-medium flex-1">
                  {item.description}
              </p>
          )}

          {item.rationale && (
              <div className="p-5 rounded-[1.5rem] bg-[#F9FAFB] border border-[#E5E7EB] border-l-4 border-l-[#10B981] shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-[#10B981]" />
                    <span className="text-[10px] font-black text-[#10B981] uppercase tracking-widest">AI Rationale</span>
                  </div>
                  <p className="text-[13px] text-[#4B5563] italic font-medium leading-relaxed">
                      {item.rationale}
                  </p>
              </div>
          )}

          {item.hashtags && item.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2.5 pt-4">
                  {item.hashtags.map(tag => (
                     <span key={tag} className="text-[11px] font-bold text-[#059669] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-default">#{tag}</span>
                  ))}
              </div>
          )}
        </div>

        <div className="mt-10 pt-8 border-t border-[#F3F4F6] flex items-center justify-between">
           <div className="flex items-center gap-2">
              <button 
                onClick={handleAddToMemory}
                className="flex items-center gap-2 text-[12px] font-bold text-[#9CA3AF] hover:text-[#10B981] transition-colors"
              >
                <PlusCircle size={14} />
                <span>Save to Memory</span>
              </button>
           </div>
           
           <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#10B981] hover:border-[#10B981]/30 transition-all shadow-sm" title="Regenerate">
                <RefreshCcw size={16} />
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111827] text-white text-[12px] font-bold hover:bg-[#10B981] transition-all shadow-md">
                <span>Use Idea</span>
                <ArrowRight size={14} />
              </button>
           </div>
        </div>
        </GlassCard>
    </motion.div>
  );
}

function ActionButton({ 
  icon: Icon, 
  onClick, 
  isActive = false, 
  activeColor = "#10B981", 
  activeBg = "#10B9811A" 
}: { 
  icon: any, 
  onClick: () => void, 
  isActive?: boolean,
  activeColor?: string,
  activeBg?: string
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-3 rounded-2xl border transition-all duration-300 shadow-sm",
        isActive 
          ? "border-transparent text-white" 
          : "bg-white border-[#E5E7EB] text-[#9CA3AF] hover:text-[#111827] hover:border-[#D1D5DB]"
      )}
      style={isActive ? { backgroundColor: activeColor } : {}}
    >
      <Icon size={18} fill={isActive ? "currentColor" : "none"} />
    </button>
  );
}

