import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy } from 'lucide-react';
import { PlannerItem } from '@/src/types/planner';

interface GeneratedPostPreviewProps {
  generatedText: string | null;
  item: PlannerItem;
  handleCopy: (textToCopy?: string) => void;
}

export function GeneratedPostPreview({
  generatedText,
  item,
  handleCopy
}: GeneratedPostPreviewProps) {
  return (
    <AnimatePresence mode="wait">
      {generatedText ? (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="relative group/post"
        >
          <div className="p-6 rounded-[1.5rem] bg-gray-50 border border-[#E5E7EB] text-[15px] text-[#374151] leading-relaxed font-medium whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scroll shadow-inner">
            {generatedText}
          </div>
          <button 
            type="button"
            onClick={() => handleCopy(generatedText)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/80 backdrop-blur border border-[#E5E7EB] text-[#6B7280] hover:text-[#10B981] transition-all opacity-0 group-hover/post:opacity-100"
          >
            <Copy size={14} />
          </button>
        </motion.div>
      ) : (
        item.description && (
            <p className="text-[16px] text-[#6B7280] leading-relaxed font-medium flex-1 pt-2">
                {item.description}
            </p>
        )
      )}
    </AnimatePresence>
  );
}
