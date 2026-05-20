import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  ChevronUp, 
  ChevronDown, 
  Smile, 
  AlignLeft, 
  Zap, 
  Highlighter, 
  Feather, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import { PostSettings } from '@/src/types/planner';
import { cn } from '@/src/lib/utils';

interface PlannerCardSettingsProps {
  showLocalSettings: boolean;
  setShowLocalSettings: (show: boolean) => void;
  localSettings: PostSettings;
  updateLocalSetting: (key: keyof PostSettings, value: any) => void;
  config: {
    color: string;
    text: string;
  };
}

export function PlannerCardSettings({
  showLocalSettings,
  setShowLocalSettings,
  localSettings,
  updateLocalSetting,
  config
}: PlannerCardSettingsProps) {
  return (
    <div className="pt-2">
      <button 
        onClick={() => setShowLocalSettings(!showLocalSettings)}
        className={cn(
          "flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-all",
          showLocalSettings ? config.text : "text-[#9CA3AF] hover:text-[#111827]"
        )}
      >
        <Settings size={14} className={cn(showLocalSettings && "animate-spin-slow")} />
        <span>Настройки генерации</span>
        {showLocalSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      
      <AnimatePresence>
        {showLocalSettings && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-5 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Tone & Length Overrides */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest flex items-center gap-1.5">
                    <Smile size={10} /> Тон
                  </label>
                  <select 
                    value={localSettings.tone}
                    onChange={(e) => updateLocalSetting('tone', e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2 py-1.5 text-[12px] font-bold text-[#111827] outline-none focus:border-[#10B981]/50"
                  >
                    <option value="friendly">Дружелюбный</option>
                    <option value="professional">Профессиональный</option>
                    <option value="ironic">Ироничный</option>
                    <option value="provocative">Провокационный</option>
                    <option value="minimalist">Минималистичный</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest flex items-center gap-1.5">
                    <AlignLeft size={10} /> Длина
                  </label>
                  <select 
                    value={localSettings.length}
                    onChange={(e) => updateLocalSetting('length', e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2 py-1.5 text-[12px] font-bold text-[#111827] outline-none focus:border-[#10B981]/50"
                  >
                    <option value="short">Короткий</option>
                    <option value="balanced">Сбалансированный</option>
                    <option value="long">Подробный</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {/* Sliders for granular control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                      <Zap size={10} className="text-[#EAB308]" /> Сила хука
                     </label>
                     <span className="text-[9px] font-bold text-[#10B981]">{localSettings.hookIntensity}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={localSettings.hookIntensity}
                    onChange={(e) => updateLocalSetting('hookIntensity', parseInt(e.target.value))}
                    className={cn(
                        "w-full h-1 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer",
                        `accent-[${config.color}]`
                    )}
                  />
                </div>
           
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                      <Highlighter size={10} className={config.text} /> Эмодзи
                     </label>
                     <span className={cn("text-[9px] font-bold", config.text)}>{localSettings.emojiDensity}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={localSettings.emojiDensity}
                    onChange={(e) => updateLocalSetting('emojiDensity', parseInt(e.target.value))}
                    className={cn(
                      "w-full h-1 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer",
                      `accent-[${config.color}]`
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                      <Feather size={10} /> Сторителлинг
                    </label>
                    <input 
                      type="range" min="0" max="100" 
                      value={localSettings.storytelling}
                      onChange={(e) => updateLocalSetting('storytelling', parseInt(e.target.value))}
                      className="w-full h-1 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#111827]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={10} /> Польза
                    </label>
                    <input 
                      type="range" min="0" max="100" 
                      value={localSettings.educationalDepth}
                      onChange={(e) => updateLocalSetting('educationalDepth', parseInt(e.target.value))}
                      className="w-full h-1 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#111827]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB]">
                 <div className="flex items-center gap-2 text-[9px] font-bold text-[#9CA3AF]">
                    <Sparkles size={10} />
                    <span>Настройки применятся только к этой карточке</span>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
