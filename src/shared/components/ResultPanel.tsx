import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Download, Share2, MoreHorizontal, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { GlassCard } from './UI';
import { cn } from '@/src/shared/utils/cn';

interface ResultCardProps {
  title: string;
  timestamp: string;
  children: ReactNode;
  tags?: string[];
  type?: 'text' | 'image' | 'analysis';
}

export function ResultCard({ title, timestamp, children, tags, type = 'text' }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <GlassCard className="w-full mb-8 group/card hover:border-[#10B981]/30 transition-all duration-300 bg-[#15181E] border-[#242933]">
        <div className="p-6 border-b border-[#242933] flex items-center justify-between">
           <div className="flex flex-col gap-0.5">
             <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981]">
                  <Sparkles size={14} />
                </div>
                <h4 className="text-[15px] font-bold text-[#F1F2F4] tracking-tight">{title}</h4>
             </div>
             <p className="text-[11px] text-[#4B5262] font-semibold mt-1">{timestamp}</p>
           </div>
           
           <div className="flex items-center gap-1.5 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-x-2 group-hover/card:translate-x-0">
              <ActionButton icon={Copy} tooltip="Копировать" />
              <ActionButton icon={Download} tooltip="Скачать" />
              <ActionButton icon={Share2} tooltip="Поделиться" />
              <div className="w-[1px] h-4 bg-[#383E4C] mx-1" />
              <ActionButton icon={MoreHorizontal} tooltip="Больше" />
           </div>
        </div>
        
        <div className="p-10 text-[16px] text-[#E2E4E9] leading-relaxed font-medium prose prose-invert max-w-none">
          {children}
        </div>

        {tags && tags.length > 0 && (
          <div className="px-10 py-5 bg-[#0D0F12]/50 border-t border-[#242933] flex gap-3 overflow-x-auto no-scrollbar">
            {tags.map((tag) => (
              <span key={tag} className="text-[11px] font-bold text-[#10B981] px-3 py-1 rounded-lg bg-[#10B981]/5 border border-[#10B981]/10 whitespace-nowrap">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

function ActionButton({ icon: Icon, tooltip }: { icon: any, tooltip: string }) {
  return (
    <button 
      className="p-2 hover:bg-[#1C2028] rounded-lg text-[#4B5262] hover:text-[#10B981] transition-all border border-transparent hover:border-[#383E4C]"
      title={tooltip}
    >
      <Icon size={16} />
    </button>
  );
}

export function GenerationLoader({ status = 'Обработка...', statusColor = '#10B981' }: { status?: string; statusColor?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center h-full gap-10">
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ backgroundColor: `${statusColor}08` }}
          className="w-32 h-32 rounded-[2.5rem] border border-[#10B981]/10 blur-3xl absolute inset-0"
        />
        <div className="w-28 h-28 rounded-[2.5rem] bg-[#1C2028] border border-[#383E4C] flex items-center justify-center relative z-10 shadow-2xl">
          <RefreshCw size={40} className="text-[#10B981] animate-spin duration-[4000ms]" />
        </div>
      </div>
      <div className="space-y-5">
        <h3 className="text-base font-bold text-[#F1F2F4] tracking-[0.2em] animate-pulse">{status}</h3>
        <div className="flex flex-col gap-3">
           <p className="text-[14px] text-[#898E9E] max-w-[280px] leading-relaxed mx-auto font-medium">Ваш творческий ассистент синтезирует идеальную структуру...</p>
           <div className="h-1 w-40 bg-[#1C2028] rounded-full mx-auto overflow-hidden">
              <motion.div 
                animate={{ x: [-160, 160] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#10B981] to-transparent"
              />
           </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyResultState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center h-full group">
      <div className="w-32 h-32 rounded-[3rem] bg-[#1C2028] border border-[#383E4C] flex items-center justify-center mb-10 transition-all duration-700 group-hover:border-[#10B981]/40 group-hover:bg-[#10B981]/[0.02] relative">
          <div className="absolute inset-0 bg-[#10B981]/0 blur-3xl opacity-0 group-hover:opacity-100 group-hover:bg-[#10B981]/10 transition-all duration-700" />
          <Layers size={44} className="text-[#242933] group-hover:text-[#10B981]/40 transition-all duration-700 relative z-10" />
      </div>
      <h3 className="text-xl font-bold text-[#F1F2F4] mb-3 tracking-tight font-display">{title}</h3>
      <p className="text-[15px] text-[#898E9E] max-w-[340px] leading-relaxed font-medium">{description}</p>
    </div>
  );
}
