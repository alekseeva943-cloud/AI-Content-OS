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
      <header className="flex flex-col gap-3">
        <h2 className="text-3xl font-bold text-[#F1F2F4] font-display tracking-tight">{result.title}</h2>
        <p className="text-[#898E9E] text-[15px] leading-relaxed max-w-3xl font-medium">{result.summary}</p>
      </header>

      <div className="space-y-16">
        {days.map((day, idx) => (
          <section key={day} className="space-y-6">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] font-bold text-xs">
                     {idx + 1}
                   </div>
                   <h3 className="text-lg font-bold text-[#F1F2F4] tracking-tight">{day}</h3>
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#242933] to-transparent" />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <GlassCard className="p-6 bg-[#15181E] border-[#242933] group hover:border-[#10B981]/30 transition-all duration-300 shadow-lg">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1C2028] border border-[#383E4C] text-[#898E9E] flex items-center justify-center transition-colors group-hover:text-[#10B981] group-hover:border-[#10B981]/20">
                    <Icon size={18} />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-[#4B5262] uppercase tracking-[0.15em] leading-none mb-1">{item.channel}</span>
                   <div className="flex items-center gap-1.5 text-[#898E9E]">
                      <Clock size={10} />
                      <span className="text-[11px] font-bold leading-none">{item.time}</span>
                   </div>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-[#0D0F12] border border-[#242933] text-[#4B5262] hover:text-[#10B981] transition-colors"
                  title="Copy"
               >
                  {copied ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
               </button>
            </div>
        </div>

        <h4 className="text-lg font-bold text-[#F1F2F4] mb-3 leading-snug group-hover:text-[#10B981] transition-colors">
            {item.topic}
        </h4>
        
        {item.description && (
            <p className="text-[14px] text-[#898E9E] leading-relaxed mb-6 font-medium">
                {item.description}
            </p>
        )}

        {item.hashtags && item.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
                {item.hashtags.map(tag => (
                   <span key={tag} className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/5 px-2 py-0.5 rounded-md border border-[#10B981]/10">#{tag}</span>
                ))}
            </div>
        )}
        </GlassCard>
    </motion.div>
  );
}
