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
        <div className="p-5 border-b border-[#242933] flex items-center justify-between">
           <div className="flex flex-col gap-0.5">
             <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#10B981]/60" />
                <h4 className="text-[13px] font-bold text-[#F1F2F4] tracking-widest uppercase font-mono">{title}</h4>
             </div>
             <p className="text-[10px] text-[#4B5262] font-bold font-mono uppercase tracking-widest">{timestamp}</p>
           </div>
           
           <div className="flex items-center gap-1.5 opacity-0 group-hover/card:opacity-100 transition-all duration-300">
              <ActionButton icon={Copy} tooltip="Копировать" />
              <ActionButton icon={Download} tooltip="Скачать" />
              <ActionButton icon={Share2} tooltip="Поделиться" />
              <div className="w-[1px] h-4 bg-[#383E4C] mx-1" />
              <ActionButton icon={MoreHorizontal} tooltip="Больше" />
           </div>
        </div>
        
        <div className="p-8 text-[15px] text-[#E2E4E9] leading-relaxed font-sans prose prose-invert max-w-none">
          {children}
        </div>

        {tags && tags.length > 0 && (
          <div className="px-8 py-4 bg-[#0D0F12] border-t border-[#242933] flex gap-3 overflow-x-auto no-scrollbar">
            {tags.map((tag) => (
              <span key={tag} className="text-[10px] font-bold font-mono text-[#10B981]/80 px-2 py-1 rounded-md bg-[#10B981]/[0.05] border border-[#10B981]/10 whitespace-nowrap tracking-widest leading-none">
                {tag.toUpperCase()}
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

export function GenerationLoader({ status = 'Processing...', statusColor = '#10B981' }: { status?: string; statusColor?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full gap-8">
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ backgroundColor: `${statusColor}08` }}
          className="w-24 h-24 rounded-3xl border border-[#10B981]/10 blur-xl absolute inset-0"
        />
        <div className="w-24 h-24 rounded-3xl bg-[#1C2028] border border-[#383E4C] flex items-center justify-center relative z-10 shadow-2xl">
          <RefreshCw size={32} className="text-[#10B981] animate-spin duration-[2000ms]" />
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-[11px] font-bold text-[#F1F2F4] uppercase tracking-[0.4em] font-mono animate-pulse">{status}</h3>
        <p className="text-[11px] text-[#4B5262] max-w-[220px] leading-relaxed mx-auto font-medium">Система анализирует контекст и синтезирует финальный результат...</p>
      </div>
    </div>
  );
}

export function EmptyResultState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full group">
      <div className="w-24 h-24 rounded-3xl bg-[#1C2028] border border-[#383E4C] flex items-center justify-center mb-8 transition-all duration-500 group-hover:border-[#10B981]/30">
          <Layers size={32} className="text-[#242933] group-hover:text-[#10B981]/30 transition-all duration-500" />
      </div>
      <h3 className="text-sm font-bold text-[#F1F2F4] mb-3 uppercase tracking-widest font-display">{title}</h3>
      <p className="text-xs text-[#4B5262] max-w-[300px] leading-relaxed font-medium">{description}</p>
    </div>
  );
}
