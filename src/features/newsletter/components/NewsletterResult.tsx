import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  Copy, 
  Save, 
  RefreshCw, 
  Share2, 
  Edit3, 
  Layout, 
  MoreVertical,
  Check,
  ExternalLink,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { NewsletterResult } from '@/src/types/newsletter';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';
import { useFavoritesStore } from '@/src/stores/favoritesStore';
import ReactMarkdown from 'react-markdown';

interface NewsletterResultDisplayProps {
  result: NewsletterResult;
  onRegenerate?: () => void;
  sourceInfo?: any;
}

export function NewsletterResultDisplay({ result, onRegenerate, sourceInfo }: NewsletterResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showFullBody, setShowFullBody] = useState(true);
  const addFavorite = useFavoritesStore(state => state.addFavorite);

  const handleCopy = () => {
    const text = `Subject: ${result.subject}\nPreheader: ${result.preheader}\n\n${result.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Скопировано в буфер обмена');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    addFavorite({
      id: `newsletter-${Date.now()}`,
      moduleId: 'newsletters',
      type: 'result',
      title: result.subject,
      content: result,
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceModule: sourceInfo?.module,
        sourceId: sourceInfo?.id
      }
    });
    toast.success('Сохранено в избранное');
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Newsletter Header Card */}
      <GlassCard className="p-10 bg-white border-[#E5E7EB] shadow-2xl rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#10B981]/5 to-transparent -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] flex items-center justify-center shadow-sm">
               <Mail size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-black text-[#10B981] uppercase tracking-[0.2em]">Email Synthesis</span>
                <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Ready to Send</span>
              </div>
              <h2 className="text-3xl font-bold text-[#111827] font-display tracking-tight">Предпросмотр письма</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" className="rounded-xl border-[#E5E7EB] gap-2" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Готово' : 'Копировать'}</span>
             </Button>
             <Button variant="outline" size="sm" className="rounded-xl border-[#E5E7EB] gap-2" onClick={handleSave}>
                <Save size={16} />
                <span>Сохранить</span>
             </Button>
             <div className="w-[1px] h-8 bg-[#E5E7EB] mx-1" />
             <Button className="rounded-xl px-6" onClick={() => window.alert('Export functionality coming soon')}>
                Отправить
             </Button>
          </div>
        </div>

        {/* Email Draft View */}
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[2.5rem] overflow-hidden shadow-inner">
          {/* Email Headers */}
          <div className="px-10 py-8 bg-white border-b border-[#E5E7EB] space-y-4">
             <div className="flex items-center gap-4 text-[13px]">
                <span className="w-20 font-bold text-[#9CA3AF] uppercase tracking-wider">От:</span>
                <div className="flex items-center gap-2.5">
                   <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-[10px] font-bold">AI</div>
                   <span className="font-semibold text-[#374151]">Ваш AI-Ассистент</span>
                   <span className="text-[#9CA3AF] font-medium">&lt;catalyst@synth.ai&gt;</span>
                </div>
             </div>
             
             <div className="flex items-center gap-4 text-[13px]">
                <span className="w-20 font-bold text-[#9CA3AF] uppercase tracking-wider">Тема:</span>
                <span className="font-bold text-[#111827] text-lg">{result.subject}</span>
             </div>

             <div className="flex items-center gap-4 text-[13px] opacity-70">
                <span className="w-20 font-bold text-[#9CA3AF] uppercase tracking-wider">Preview:</span>
                <span className="font-medium text-[#6B7280] italic">{result.preheader}</span>
             </div>
          </div>

          {/* Email Canvas */}
          <div className="p-10 md:p-16 bg-white min-h-[500px]">
             <div className="max-w-[600px] mx-auto">
                <div className="markdown-body prose prose-slate prose-lg max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-[#10B981] prose-strong:text-[#111827]">
                   <ReactMarkdown>{result.body}</ReactMarkdown>
                </div>

                {result.cta && (
                   <div className="mt-16 pt-12 border-t border-[#F3F4F6] flex flex-col items-center">
                      <Button size="xl" className="rounded-2xl px-12 gap-3 group">
                         <span>{result.cta.text}</span>
                         <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </Button>
                      {result.cta.link && (
                         <span className="mt-4 text-[11px] text-[#9CA3AF] font-medium tracking-wide flex items-center gap-1.5 underline">
                            <ExternalLink size={10} />
                            {result.cta.link}
                         </span>
                      )}
                   </div>
                )}
             </div>
          </div>

          {/* Email Footer */}
          <div className="px-10 py-10 bg-[#F9FAFB] border-t border-[#E5E7EB] flex flex-col items-center gap-6">
             <div className="flex items-center gap-8 text-[#9CA3AF]">
                <button className="text-[11px] font-bold uppercase tracking-widest hover:text-[#10B981] transition-colors">Preferences</button>
                <button className="text-[11px] font-bold uppercase tracking-widest hover:text-[#10B981] transition-colors">Unsubscribe</button>
                <button className="text-[11px] font-bold uppercase tracking-widest hover:text-[#10B981] transition-colors">View in Browser</button>
             </div>
             <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#D1D5DB]">
                   <Mail size={16} />
                </div>
                <p className="text-[10px] text-[#9CA3AF] font-medium text-center">
                   Generated with Catalyst v4.4 by Synth AI Labs<br/>
                   Designed for reach and deep engagement.
                </p>
             </div>
          </div>
        </div>
      </GlassCard>

      {/* Suggested Blocks or Variants */}
      {result.blocks && result.blocks.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.blocks.map((block, i) => (
               <GlassCard key={i} className="p-8 bg-white border-[#E5E7EB] hover:border-[#10B981]/30 transition-all duration-500 rounded-[2rem] group">
                  <div className="flex items-center justify-between mb-6">
                     <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-[#9CA3AF] group-hover:scale-110 group-hover:bg-[#10B981]/10 group-hover:text-[#10B981] transition-all duration-500 shadow-sm border border-[#F3F4F6]",
                        block.type === 'highlight' && "bg-[#10B981]/5 text-[#10B981] border-[#10B981]/10"
                     )}>
                        <Layout size={20} />
                     </div>
                     <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest leading-none">{block.type}</span>
                  </div>
                  {block.title && <h4 className="text-lg font-bold text-[#111827] mb-3 font-display tracking-tight">{block.title}</h4>}
                  <p className="text-[13px] text-[#6B7280] leading-relaxed font-medium">
                     {block.content}
                  </p>
               </GlassCard>
            ))}
         </div>
      )}

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
            onClick={() => window.alert('Export to ESP integration coming soon')}
          >
            <Share2 size={20} />
            Экспортировать
          </Button>
      </div>
    </div>
  );
}
