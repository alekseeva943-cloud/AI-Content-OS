import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Video, 
  Copy, 
  Save, 
  RefreshCw, 
  Share2, 
  Type, 
  Smile, 
  Zap,
  Check,
  ChevronRight,
  Play,
  Film,
  Camera,
  Layers,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { VideoAvatarResult } from '@/src/types/content';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';
import { useFavoritesStore } from '@/src/stores/favoritesStore';

interface VideoAvatarResultDisplayProps {
  result: VideoAvatarResult;
  onRegenerate?: () => void;
  sourceInfo?: any;
}

export function VideoAvatarResultDisplay({ result, onRegenerate, sourceInfo }: VideoAvatarResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const addFavorite = useFavoritesStore(state => state.addFavorite);

  if (!result || !result.scenes) {
    return (
        <div className="p-20 text-center bg-white border border-[#E5E7EB] rounded-[3rem] shadow-2xl">
            <p className="text-[#6B7280]">Video avatar data is missing or corrupted.</p>
            <Button onClick={onRegenerate} className="mt-4">Try Regenerating</Button>
        </div>
    );
  }

  const handleCopy = () => {
    const scenes = result?.scenes || [];
    const text = `Hook: ${result?.hook || ''}\n\nScenes:\n${scenes.map(s => `${s?.narration || ''} (Gesture: ${s?.gesture || ''})`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Текст озвучки скопирован');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    addFavorite({
      id: `avatar-${Date.now()}`,
      moduleId: 'video-avatar',
      type: 'result',
      title: result.hook.substring(0, 50) + '...',
      content: result,
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceModule: sourceInfo?.module,
        sourceId: sourceInfo?.id
      }
    });
    toast.success('Сценарий видео сохранен');
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <GlassCard className="p-12 bg-white border-[#E5E7EB] shadow-2xl rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#10B981]/5 to-transparent -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] flex items-center justify-center shadow-sm">
               <Video size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-black text-[#10B981] uppercase tracking-[0.2em]">Avatar Choreography</span>
                <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Scene Design Complete</span>
              </div>
              <h2 className="text-3xl font-bold text-[#111827] font-display tracking-tight">Черновик видео</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" className="rounded-xl border-[#E5E7EB] gap-2" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Скопировано' : 'Копировать'}</span>
             </Button>
             <Button variant="outline" size="sm" className="rounded-xl border-[#E5E7EB] gap-2" onClick={handleSave}>
                <Save size={16} />
                <span>Сохранить</span>
             </Button>
             <Button className="rounded-xl px-6 bg-[#111827] hover:bg-[#10B981] gap-2">
                <Play size={16} fill="currentColor" />
                <span>Генерировать видео</span>
             </Button>
          </div>
        </div>

        <div className="space-y-12">
           {/* Hook Highlight */}
           <div className="p-10 rounded-[3rem] bg-gradient-to-r from-[#111827] to-[#1F2937] text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-1000">
                 <Zap size={120} />
              </div>
              <p className="text-[11px] font-black text-[#10B981] uppercase tracking-[0.3em] mb-4">The Hook (Opening)</p>
              <p className="text-2xl font-bold font-display leading-[1.3] relative z-10 max-w-2xl">
                 "{result.hook}"
              </p>
           </div>

           {/* Scene Navigation */}
           <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <Camera size={18} className="text-[#9CA3AF]" />
                 <h3 className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-[0.25em]">Раскадровка и Режиссура</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {(result?.scenes || []).map((scene, index) => (
                    <motion.div 
                      key={scene.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group flex flex-col bg-[#F9FAFB] border border-[#E5E7EB] rounded-[2.5rem] overflow-hidden hover:border-[#10B981]/40 hover:shadow-2xl transition-all duration-500"
                    >
                       <div className="px-8 py-6 bg-white border-b border-[#E5E7EB] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center text-[10px] font-bold">#{index + 1}</div>
                             <span className="text-[11px] font-black text-[#374151] uppercase tracking-widest">{scene.emotion || 'Natural'} Emotion</span>
                          </div>
                          {scene.gesture && (
                             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/5 border border-[#10B981]/20 text-[10px] font-bold text-[#10B981]">
                                <Smile size={12} />
                                {scene.gesture}
                             </div>
                          )}
                       </div>
                       
                       <div className="p-8 space-y-6 flex-1">
                          <div className="space-y-4">
                             <div className="flex items-center gap-2">
                                <MessageSquare size={14} className="text-[#9CA3AF]" />
                                <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Текст диктора</p>
                             </div>
                             <p className="text-[15px] font-bold text-[#111827] leading-relaxed">
                                {scene.narration}
                             </p>
                          </div>

                          <div className="pt-6 border-t border-[#E5E7EB]/50 space-y-4">
                             <div className="flex items-center gap-2">
                                <Film size={14} className="text-[#9CA3AF]" />
                                <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Визуал и фон</p>
                             </div>
                             <p className="text-[13px] text-[#6B7280] leading-relaxed font-medium">
                                {scene.visuals || scene.description}
                             </p>
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>

           {/* Caption Styles */}
           {result.captionStyles && (
              <div className="p-8 rounded-[2.5rem] bg-white border border-[#E5E7EB] border-dashed">
                 <div className="flex items-center gap-3 mb-6">
                    <Type size={18} className="text-[#9CA3AF]" />
                    <h3 className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-widest">Стиль субтитров</h3>
                 </div>
                 <div className="flex items-center gap-12">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Шрифт</p>
                       <p className="text-[14px] font-bold text-[#111827]">{result.captionStyles.font}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Цвет</p>
                       <p className="text-[14px] font-bold text-[#111827] flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: result.captionStyles.color }} />
                          {result.captionStyles.color}
                       </p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Анимация</p>
                       <p className="text-[14px] font-bold text-[#111827]">{result.captionStyles.animation}</p>
                    </div>
                 </div>
              </div>
           )}
        </div>
      </GlassCard>

      {/* Action Bar */}
      <div className="flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            size="xl" 
            className="rounded-[2rem] px-10 gap-2 border-[#E5E7EB]"
            onClick={onRegenerate}
          >
            <RefreshCw size={20} />
            Переписать сценарий
          </Button>
          <Button 
            size="xl" 
            className="rounded-[2rem] px-10 gap-2 shadow-xl shadow-emerald-500/10"
            onClick={() => window.alert('Export to HeyGen/Synthesia coming soon')}
          >
            <Share2 size={20} />
            Экспортировать
          </Button>
      </div>
    </div>
  );
}
