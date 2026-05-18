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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <GlassCard className="w-full mb-8 group/card hover:border-emerald-500/30 transition-all duration-700 bg-[#111827]/40 ring-1 ring-white/[0.03]">
        <div className="p-6 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01]">
           <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 opacity-60" />
                <h4 className="text-sm font-bold text-white tracking-tight uppercase">{title}</h4>
             </div>
             <p className="text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">{timestamp}</p>
           </div>
           
           <div className="flex items-center gap-1.5 opacity-0 group-hover/card:opacity-100 transition-all duration-500 translate-x-2 group-hover/card:translate-x-0">
              <ActionButton icon={Copy} tooltip="Копировать" />
              <ActionButton icon={Download} tooltip="Скачать" />
              <ActionButton icon={Share2} tooltip="Поделиться" />
              <div className="w-px h-4 bg-white/5 mx-1" />
              <ActionButton icon={MoreHorizontal} tooltip="Больше" />
           </div>
        </div>
        
        <div className="p-8 text-[15px] text-white/70 leading-[1.7] font-sans prose prose-invert max-w-none">
          {children}
        </div>

        {tags && tags.length > 0 && (
          <div className="px-8 py-4 bg-white/[0.01] border-t border-white/[0.03] flex gap-3 overflow-x-auto no-scrollbar">
            {tags.map((tag) => (
              <span key={tag} className="text-[10px] font-mono text-emerald-400/80 px-2.5 py-1.5 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/10 whitespace-nowrap tracking-wide">
                #{tag.toUpperCase()}
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
      className="p-2.5 hover:bg-white/5 rounded-xl text-white/30 hover:text-emerald-400 transition-all active:scale-90 border border-transparent hover:border-white/5"
      title={tooltip}
    >
      <Icon size={16} />
    </button>
  );
}

export function GenerationLoader({ status = 'Обработка данных...' }: { status?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center h-full gap-8">
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/20 blur-xl absolute inset-0"
        />
        <div className="w-20 h-20 rounded-[2.5rem] bg-[#111827] border border-white/10 flex items-center justify-center relative z-10 shadow-2xl">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin transition-all duration-1000" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em] font-mono animate-pulse">{status}</h3>
        <p className="text-xs text-white/30 max-w-[200px] leading-relaxed mx-auto">Система анализирует контекст и синтезирует финальный результат...</p>
      </div>
    </div>
  );
}

export function EmptyResultState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center h-full group">
      <div className="w-20 h-20 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 relative transition-all duration-700 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/[0.02]">
          <div className="absolute inset-0 bg-emerald-500/0 blur-2xl rounded-full group-hover:bg-emerald-500/[0.05] transition-all duration-700" />
          <Layers className="w-8 h-8 text-white/10 group-hover:text-emerald-500/40 transition-all duration-700" />
      </div>
      <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-sm text-white/30 max-w-[320px] leading-[1.6]">{description}</p>
    </div>
  );
}
