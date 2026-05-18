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
          animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ backgroundColor: statusColor }}
          className="w-56 h-56 rounded-full blur-[90px] absolute -inset-10"
        />
        <div className="w-32 h-32 rounded-[2.5rem] bg-white border border-[#E5E7EB] flex items-center justify-center relative z-10 shadow-2xl">
           <div className="absolute inset-0 rounded-[2.5rem] border-4 border-[#10B981]/5 animate-pulse" />
           <RefreshCw size={48} className="text-[#10B981] animate-spin-slow" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold text-[#111827] tracking-tight font-display">{status}</h3>
            <p className="text-[14px] text-[#10B981] font-bold uppercase tracking-[0.2em] animate-pulse">Catalyst Engine Processing</p>
        </div>
        <p className="text-[17px] text-[#6B7280] max-w-[360px] leading-relaxed mx-auto font-medium">Креативный партнер формирует уникальный контент, адаптированный под ваш стиль и аудиторию.</p>
        <div className="h-1.5 w-64 bg-[#F3F4F6] rounded-full mx-auto overflow-hidden">
            <motion.div 
            animate={{ x: [-256, 256] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#10B981] to-transparent"
            />
        </div>
      </div>
    </div>
  );
}

export function EmptyResultState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center h-full group">
      <div className="relative mb-14">
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8 border border-dashed border-[#E5E7EB] rounded-full opacity-50 group-hover:border-[#10B981]/40 transition-colors duration-700"
        />
        <div className="w-40 h-40 rounded-[3.5rem] bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center transition-all duration-700 group-hover:border-[#10B981]/40 group-hover:bg-white group-hover:shadow-2xl relative shadow-sm">
            <Layers size={56} className="text-[#E5E7EB] group-hover:text-[#10B981]/30 transition-all duration-700" />
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] group-hover:text-[#10B981] group-hover:border-[#10B981]/30 shadow-sm transition-all duration-700">
                <Sparkles size={20} />
            </div>
        </div>
      </div>
      <h3 className="text-3xl font-bold text-[#111827] mb-5 tracking-tight font-display">{title}</h3>
      <p className="text-[18px] text-[#6B7280] max-w-[440px] leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}
