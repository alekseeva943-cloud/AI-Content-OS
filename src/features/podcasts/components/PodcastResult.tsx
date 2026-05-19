import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mic, 
  Copy, 
  Save, 
  RefreshCw, 
  Share2, 
  Clock, 
  MessageSquare,
  List,
  Check,
  ChevronRight,
  Play,
  FileText,
  Users
} from 'lucide-react';
import { PodcastResult } from '@/src/types/content';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';
import { useFavoritesStore } from '@/src/stores/favoritesStore';

interface PodcastResultDisplayProps {
  result: PodcastResult;
  onRegenerate?: () => void;
  sourceInfo?: any;
}

export function PodcastResultDisplay({ result, onRegenerate, sourceInfo }: PodcastResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const addFavorite = useFavoritesStore(state => state.addFavorite);

  const handleCopy = () => {
    const text = `Topic: ${result.topic}\n\nStructure:\n${result.structure.map(s => `- ${s.title} (${s.duration}): ${s.points.join(', ')}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Структура скопирована');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    addFavorite({
      id: `podcast-${Date.now()}`,
      moduleId: 'podcasts',
      type: 'result',
      title: result.topic,
      content: result,
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceModule: sourceInfo?.module,
        sourceId: sourceInfo?.id
      }
    });
    toast.success('Сценарий подкаста сохранен');
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <GlassCard className="p-12 bg-white border-[#E5E7EB] shadow-2xl rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#10B981]/5 to-transparent -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] flex items-center justify-center shadow-sm">
               <Mic size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-black text-[#10B981] uppercase tracking-[0.2em]">Podcast Scripting</span>
                <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Ready to Record</span>
              </div>
              <h2 className="text-3xl font-bold text-[#111827] font-display tracking-tight">Сценарий выпуска</h2>
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
             <Button className="rounded-xl px-6 bg-[#111827] hover:bg-[#10B981]">
                Озвучить (AI)
             </Button>
          </div>
        </div>

        <div className="space-y-12">
           {/* Intro Section */}
           <div className="p-8 rounded-[2.5rem] bg-[#F9FAFB] border border-[#E5E7EB] relative">
              <div className="absolute -top-4 left-10 px-4 py-1.5 bg-white border border-[#E5E7EB] rounded-full text-[10px] font-black text-[#374151] uppercase tracking-widest shadow-sm">
                 Вступление / Hook
              </div>
              <p className="text-lg text-[#374151] leading-relaxed font-medium italic">
                 "{result.intro}"
              </p>
           </div>

           {/* Episode Structure */}
           <div className="space-y-6">
              <h3 className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-[0.25em] flex items-center gap-3 ml-2">
                 <List size={14} /> Структура эпизода
              </h3>
              
              <div className="space-y-4">
                 {result.structure.map((segment, index) => (
                    <motion.div 
                      key={segment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group p-8 rounded-[2rem] bg-white border border-[#E5E7EB] hover:border-[#10B981]/30 hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-300"
                    >
                       <div className="flex items-start justify-between gap-6">
                          <div className="flex-1 space-y-4">
                             <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-[#F3F4F6] text-[#111827] flex items-center justify-center text-xs font-bold">{index + 1}</span>
                                <h4 className="text-xl font-bold text-[#111827] font-display">{segment.title}</h4>
                             </div>
                             <div className="space-y-2 pl-11">
                                {segment.points.map((point, i) => (
                                   <div key={i} className="flex items-start gap-3 text-[14px] text-[#4B5563] leading-relaxed">
                                      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#10B981]/40 shrink-0" />
                                      <span>{point}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[12px] font-bold text-[#6B7280]">
                             <Clock size={12} />
                             {segment.duration}
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>

           {/* Meta Sections */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {result.guestQuestions && (
                 <div className="p-8 rounded-[2.5rem] bg-emerald-50/30 border border-emerald-100 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-6">
                       <Users size={18} className="text-[#10B981]" />
                       <h4 className="text-[12px] font-black text-[#10B981] uppercase tracking-widest">Вопросы для гостя</h4>
                    </div>
                    <div className="space-y-4 flex-1">
                       {result.guestQuestions.map((q, i) => (
                          <div key={i} className="text-[14px] text-[#065F46] font-medium leading-relaxed bg-white/50 p-4 rounded-2xl border border-emerald-100/50">
                             {q}
                          </div>
                       ))}
                    </div>
                 </div>
              )}

              <div className="p-8 rounded-[2.5rem] bg-[#111827] border border-[#111827] flex flex-col h-full text-white">
                 <div className="flex items-center gap-2 mb-6">
                    <MessageSquare size={18} className="text-[#10B981]" />
                    <h4 className="text-[12px] font-black text-[#10B981] uppercase tracking-widest">Outro & CTA</h4>
                 </div>
                 <div className="space-y-6 flex-1">
                    <p className="text-[14px] text-gray-300 italic leading-relaxed">
                       "{result.outro}"
                    </p>
                    {result.cta && (
                       <div className="pt-6 border-t border-white/10">
                          <p className="text-[11px] font-black text-[#10B981] uppercase tracking-[0.2em] mb-2">Final CTA</p>
                          <p className="text-[15px] font-bold text-white leading-relaxed">{result.cta}</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>
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
            Перегенерировать
          </Button>
          <Button 
            size="xl" 
            className="rounded-[2rem] px-10 gap-2 shadow-xl shadow-emerald-500/10"
            onClick={() => window.alert('Export to Riverside/Spotify coming soon')}
          >
            <Share2 size={20} />
            Экспортировать
          </Button>
      </div>
    </div>
  );
}
