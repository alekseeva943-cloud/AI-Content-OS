import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Copy, Download, Share2, MoreHorizontal } from 'lucide-react';
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
    <GlassCard className="w-full mb-6 group/card hover:border-emerald-500/20 transition-all duration-500">
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
         <div className="flex flex-col gap-0.5">
           <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
           <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">{timestamp}</p>
         </div>
         
         <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-emerald-400 transition-all">
              <Copy size={14} />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-emerald-400 transition-all">
              <Download size={14} />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-emerald-400 transition-all">
              <Share2 size={14} />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-emerald-400 transition-all">
              <MoreHorizontal size={14} />
            </button>
         </div>
      </div>
      
      <div className="p-6 text-sm text-white/70 leading-relaxed font-sans prose prose-invert max-w-none">
        {children}
      </div>

      {tags && tags.length > 0 && (
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
          {tags.map((tag) => (
            <span key={tag} className="text-[10px] font-mono text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/10 whitespace-nowrap">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

export function EmptyResultState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full">
      <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full" />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-4 h-4 rounded-full bg-emerald-500"
          />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-white/40 max-w-[280px] leading-relaxed">{description}</p>
    </div>
  );
}
