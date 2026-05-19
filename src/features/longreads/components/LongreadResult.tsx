import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Copy, 
  Save, 
  RefreshCw, 
  Share2, 
  Clock, 
  Hash, 
  List,
  Check,
  ChevronRight,
  BookOpen,
  Quote
} from 'lucide-react';
import { LongreadResult } from '@/src/types/content';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';
import { useFavoritesStore } from '@/src/stores/favoritesStore';
import ReactMarkdown from 'react-markdown';

interface LongreadResultDisplayProps {
  result: LongreadResult;
  onRegenerate?: () => void;
  sourceInfo?: any;
}

export function LongreadResultDisplay({ result, onRegenerate, sourceInfo }: LongreadResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const addFavorite = useFavoritesStore(state => state.addFavorite);

  const handleCopy = () => {
    const text = `${result.title}\n\n${result.content}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Текст скопирован');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    addFavorite({
      id: `longread-${Date.now()}`,
      moduleId: 'longreads',
      type: 'result',
      title: result.title,
      content: result,
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceModule: sourceInfo?.module,
        sourceId: sourceInfo?.id
      }
    });
    toast.success('Статья сохранена в избранное');
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <GlassCard className="p-12 bg-white border-[#E5E7EB] shadow-2xl rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#10B981]/5 to-transparent -z-10" />
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto space-y-8 mb-16">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] flex items-center justify-center">
                <FileText size={24} />
             </div>
             <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em]">Longread Engine</span>
                  <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                  <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Draft Completed</span>
                </div>
                <h2 className="text-xl font-bold text-[#111827] font-display">Материал готов</h2>
             </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold text-[#111827] font-display tracking-tight leading-[1.1]">
               {result.title}
            </h1>
            {result.subtitle && (
               <p className="text-xl text-[#6B7280] font-medium leading-relaxed">
                  {result.subtitle}
               </p>
            )}
            
            <div className="flex items-center gap-6 pt-4">
               <div className="flex items-center gap-2 text-[#9CA3AF]">
                  <Clock size={16} />
                  <span className="text-sm font-bold">{result.readingTime} мин чтение</span>
               </div>
               <div className="flex items-center gap-2 text-[#9CA3AF]">
                  <Hash size={16} />
                  <span className="text-sm font-bold">{result.content.split(' ').length} слов</span>
               </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-7xl mx-auto">
          {/* Sidebar / Outline */}
          <div className="lg:col-span-3 space-y-8">
             <div className="sticky top-10 space-y-8">
                {result.outline && (
                   <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-[#111827] uppercase tracking-[0.2em] flex items-center gap-2">
                         <List size={14} /> Навигация
                      </h4>
                      <nav className="space-y-2">
                         {result.outline.map((item) => (
                            <button 
                              key={item.id}
                              className={cn(
                                "block text-left text-[13px] font-medium transition-colors hover:text-[#10B981] w-full",
                                item.level === 1 ? "text-[#374151]" : "text-[#6B7280] pl-4 border-l border-[#E5E7EB]"
                              )}
                            >
                               {item.title}
                            </button>
                         ))}
                      </nav>
                   </div>
                )}

                {result.callouts && (
                   <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-[#10B981] uppercase tracking-[0.2em] flex items-center gap-2">
                         <Quote size={14} /> Ключевые тезисы
                      </h4>
                      {result.callouts.map((callout, i) => (
                         <div key={i} className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] text-[12px] text-[#4B5563] leading-relaxed italic">
                            "{callout}"
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>

          {/* Main Reading Area */}
          <div className="lg:col-span-9">
             <div className="markdown-body prose prose-slate prose-lg max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-[#10B981] prose-strong:text-[#111827] prose-blockquote:border-l-4 prose-blockquote:border-[#10B981] prose-blockquote:bg-[#F9FAFB] prose-blockquote:p-6 prose-blockquote:rounded-r-2xl">
                <ReactMarkdown>{result.content}</ReactMarkdown>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-20 pt-10 border-t border-[#F3F4F6] flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-xs">AI</div>
                 <div>
                    <p className="text-[12px] font-bold text-[#111827]">Автор: Catalyst AI Engine</p>
                    <p className="text-[10px] text-[#9CA3AF]">Сгенерировано {new Date().toLocaleDateString('ru-RU')}</p>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="rounded-xl border-[#E5E7EB] gap-2" onClick={handleCopy}>
                 {copied ? <Check size={16} /> : <Copy size={16} />}
                 <span>{copied ? 'Скопировано' : 'Копировать'}</span>
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl border-[#E5E7EB] gap-2" onClick={handleSave}>
                 <Save size={16} />
                 <span>В избранное</span>
              </Button>
              <Button className="rounded-xl px-6 bg-[#111827] hover:bg-[#10B981]">
                 Подготовить к публикации
              </Button>
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
            Переписать материал
          </Button>
          <Button 
            size="xl" 
            className="rounded-[2rem] px-10 gap-2 shadow-xl shadow-emerald-500/10"
            onClick={() => window.alert('Export to Ghost/WordPress coming soon')}
          >
            <Share2 size={20} />
            Экспортировать
          </Button>
      </div>
    </div>
  );
}
