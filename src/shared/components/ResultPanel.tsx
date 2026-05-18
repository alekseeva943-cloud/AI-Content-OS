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
      <GlassCard className="w-full mb-8 group/card hover:border-[#10B981]/30 transition-all duration-300 bg-white border-[#E5E7EB] shadow-md">
        <div className="p-8 border-b border-[#F3F4F6] flex items-center justify-between bg-[#F9FAFB]/30">
           <div className="flex flex-col gap-1">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <h4 className="text-xl font-bold text-[#111827] tracking-tight font-display">{title}</h4>
             </div>
             <p className="text-[12px] text-[#9CA3AF] font-bold uppercase tracking-widest ml-11">{timestamp}</p>
           </div>
           
           <div className="flex items-center gap-2">
              <ActionButton icon={Copy} tooltip="Копировать" />
              <ActionButton icon={Download} tooltip="Скачать" />
              <div className="w-[1px] h-4 bg-[#E5E7EB] mx-1" />
              <ActionButton icon={MoreHorizontal} tooltip="Дополнительно" />
           </div>
        </div>
        
        <div className="p-10 text-[17px] text-[#374151] leading-relaxed font-medium prose prose-stone max-w-none prose-headings:font-display prose-headings:font-bold">
          {children}
        </div>

        {tags && tags.length > 0 && (
          <div className="px-10 py-6 bg-[#F9FAFB]/50 border-t border-[#F3F4F6] flex gap-3 overflow-x-auto no-scrollbar">
            {tags.map((tag) => (
              <span key={tag} className="text-[12px] font-bold text-[#059669] px-4 py-1.5 rounded-full bg-white border border-[#E5E7EB] shadow-sm whitespace-nowrap">
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
      className="p-2.5 hover:bg-white rounded-xl text-[#6B7280] hover:text-[#10B981] transition-all border border-transparent hover:border-[#E5E7EB] hover:shadow-sm"
      title={tooltip}
    >
      <Icon size={18} />
    </button>
  );
}

export function GenerationLoader({ status = 'Обработка...', statusColor = '#10B981' }: { status?: string; statusColor?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center h-full gap-12">
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ backgroundColor: statusColor }}
          className="w-48 h-48 rounded-full blur-[80px] absolute -inset-8"
        />
        <div className="w-32 h-32 rounded-[2.5rem] bg-white border border-[#E5E7EB] flex items-center justify-center relative z-10 shadow-xl">
           <div className="absolute inset-0 rounded-[2.5rem] border-4 border-[#10B981]/5 animate-pulse" />
           <RefreshCw size={48} className="text-[#10B981] animate-spin-slow" />
        </div>
      </div>
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-[#111827] tracking-tight font-display">{status}</h3>
        <div className="flex flex-col gap-4">
           <p className="text-[16px] text-[#6B7280] max-w-[320px] leading-relaxed mx-auto font-medium">Ваш креативный партнер формирует идеальный контент на основе предоставленных данных.</p>
           <div className="h-1.5 w-48 bg-[#F3F4F6] rounded-full mx-auto overflow-hidden">
              <motion.div 
                animate={{ x: [-200, 200] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
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
      <div className="w-36 h-36 rounded-[3.5rem] bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center mb-12 transition-all duration-700 group-hover:border-[#10B981]/40 group-hover:bg-white group-hover:shadow-xl relative shadow-sm">
          <Layers size={52} className="text-[#E5E7EB] group-hover:text-[#10B981]/20 transition-all duration-700" />
      </div>
      <h3 className="text-2xl font-bold text-[#111827] mb-4 tracking-tight font-display">{title}</h3>
      <p className="text-[17px] text-[#6B7280] max-w-[400px] leading-relaxed font-medium">{description}</p>
    </div>
  );
}
