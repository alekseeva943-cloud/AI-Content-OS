import React from 'react';
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
  ChevronRight
} from 'lucide-react';
import { PlannerItem, PlannerResult } from '@/src/types/planner';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { cn } from '@/src/lib/utils';

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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4">
        <h2 className="text-4xl font-bold text-[#111827] font-display tracking-tight">{result.title}</h2>
        <p className="text-[#6B7280] text-[17px] leading-relaxed max-w-3xl font-medium">{result.summary}</p>
      </header>

      <div className="space-y-20">
        {days.map((day, idx) => (
          <section key={day} className="space-y-8">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-2xl bg-[#10B981] text-white flex items-center justify-center font-bold text-sm shadow-[0_4px_12px_rgba(16,185,129,0.2)]">
                     {idx + 1}
                   </div>
                   <h3 className="text-2xl font-bold text-[#111827] tracking-tight font-display">{day}</h3>
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#E5E7EB] to-transparent" />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {itemsByDay[day].map((item, i) => (
                  <PlanItemCard key={item.id || `${day}-${i}`} item={item} index={i} />
                ))}
             </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function PlanItemCard({ item, index }: { item: PlannerItem; index: number; key?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${item.topic}\n\n${item.description || ''}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const channelIcons = {
    telegram: Send,
    email: Mail,
    vk: MapPin, 
  };

  const Icon = channelIcons[item.channel] || Send;

  return (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
    >
        <GlassCard className="p-8 bg-white border-[#E5E7EB] group hover:border-[#10B981]/40 transition-all duration-500 shadow-sm hover:shadow-xl">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#9CA3AF] flex items-center justify-center transition-all group-hover:text-[#10B981] group-hover:bg-[#10B981]/5 group-hover:border-[#10B981]/20">
                    <Icon size={22} />
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] leading-none">{item.channel}</span>
                   <div className="flex items-center gap-2 text-[#6B7280]">
                      <Clock size={12} strokeWidth={2.5} />
                      <span className="text-[13px] font-bold leading-none">{item.time}</span>
                   </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
               <button 
                  onClick={handleCopy}
                  className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#10B981] hover:border-[#10B981]/30 transition-all shadow-sm"
                  title="Copy"
               >
                  {copied ? <Check size={16} className="text-[#10B981]" /> : <Copy size={16} />}
               </button>
            </div>
        </div>

        <h4 className="text-xl font-bold text-[#111827] mb-4 leading-tight group-hover:text-[#10B981] transition-colors font-display">
            {item.topic}
        </h4>
        
        {item.description && (
            <p className="text-[15px] text-[#6B7280] leading-relaxed mb-8 font-medium">
                {item.description}
            </p>
        )}

        {item.hashtags && item.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
                {item.hashtags.map(tag => (
                   <span key={tag} className="text-[11px] font-bold text-[#059669] bg-[#10B981]/5 px-3 py-1.5 rounded-lg border border-[#10B981]/10">#{tag}</span>
                ))}
            </div>
        )}
        </GlassCard>
    </motion.div>
  );
}
