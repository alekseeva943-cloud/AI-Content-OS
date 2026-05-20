import React from 'react';
import { Star, RefreshCcw, Check, Copy, Sparkles } from 'lucide-react';
import { cn } from '@/src/lib/utils';

// Isolated ActionButton component for use within the footer Actions bar
function ActionButton({ 
  icon: Icon, 
  onClick, 
  isActive = false, 
  activeColor = "#10B981", 
  title
}: { 
  icon: any, 
  onClick: () => void, 
  isActive?: boolean,
  activeColor?: string,
  title?: string
}) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className={cn(
        "p-3 rounded-2xl border transition-all duration-300 shadow-sm active:scale-95",
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

interface PlannerCardActionsProps {
  activeFavorite: boolean;
  toggleFavorite: () => void;
  handleRegenerate: () => void;
  isRegenerating: boolean;
  handleCopy: (textToCopy?: string) => void;
  copied: boolean;
  generatedText: string | null;
  handleGeneratePost: () => void;
  isGenerating: boolean;
  config: {
    color: string;
    text: string;
  };
}

export function PlannerCardActions({
  activeFavorite,
  toggleFavorite,
  handleRegenerate,
  isRegenerating,
  handleCopy,
  copied,
  generatedText,
  handleGeneratePost,
  isGenerating,
  config
}: PlannerCardActionsProps) {
  return (
    <div className="mt-10 pt-8 border-t border-[#F3F4F6] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ActionButton 
            isActive={activeFavorite}
            onClick={toggleFavorite}
            icon={Star}
            activeColor="#EAB308"
            title="В избранное"
          />
          <button 
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className={cn(
              "p-3 rounded-2xl bg-white border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#111827] hover:border-[#D1D5DB] transition-all shadow-sm active:scale-95",
              isRegenerating && "animate-pulse"
            )}
            title="Пересобрать"
          >
            <RefreshCcw size={18} className={cn(isRegenerating && "animate-spin")} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleCopy(generatedText || undefined)}
            className="p-3 rounded-2xl bg-white border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#111827] hover:border-[#D1D5DB] transition-all shadow-sm active:scale-95"
            title="Скопировать"
          >
            {copied ? <Check size={18} className="text-[#10B981]" /> : <Copy size={18} />}
          </button>

          <button 
            onClick={handleGeneratePost}
            disabled={isGenerating}
            className={cn(
              "flex items-center gap-2.5 px-6 py-3 rounded-2xl text-white text-[13px] font-bold transition-all shadow-lg active:scale-95",
              isGenerating ? "bg-gray-400 cursor-not-allowed" : cn("bg-[#111827] transition-all", `hover:bg-[${config.color}]`)
            )}
          >
            {isGenerating ? (
              <>
                <RefreshCcw size={14} className="animate-spin" />
                <span>Создаю...</span>
              </>
            ) : (
              <>
                <span>{generatedText ? 'Обновить' : 'Создать пост'}</span>
                <Sparkles size={14} />
              </>
            )}
          </button>
       </div>
    </div>
  );
}
