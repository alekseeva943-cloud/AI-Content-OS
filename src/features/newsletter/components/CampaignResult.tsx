import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Send, 
  Copy, 
  Save, 
  RefreshCw, 
  Check, 
  ArrowRight,
  ExternalLink,
  Smartphone,
  MessageCircle,
  Eye,
  FileText,
  Download,
  Image as ImageIcon,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { CampaignResult } from '@/src/types/newsletter';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';
import { useFavoritesStore } from '@/src/stores/favoritesStore';
import ReactMarkdown from 'react-markdown';
import { generateCampaignImage } from '@/src/services/ai/client';

interface CampaignResultDisplayProps {
  result: CampaignResult;
  onRegenerate?: () => void;
  sourceInfo?: any;
}

export function CampaignResultDisplay({ result, onRegenerate, sourceInfo }: CampaignResultDisplayProps) {
  const channels = result.channels || [];
  const [activeTab, setActiveTab] = useState<string>(channels[0]?.id || 'email');
  const [copied, setCopied] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isGeneratingImage, setIsGeneratingImage] = useState<Record<string, boolean>>({});

  const availableTabs = [
    { id: 'email', icon: Mail, label: 'Email' },
    { id: 'telegram', icon: Send, label: 'Telegram' },
    { id: 'vk', icon: MessageCircle, label: 'VK' }
  ].filter(tab => channels.some(c => c.id === tab.id));

  useEffect(() => {
    if (channels.length > 0 && !channels.some(c => c.id === activeTab)) {
      setActiveTab(channels[0].id);
    }
  }, [channels, activeTab]);
  const activeChannel = channels.find(c => c.id === activeTab) || channels[0];

  const addFavorite = useFavoritesStore(state => state.addFavorite);
  
  useEffect(() => {
    if (!result) return;
    
    // Auto-generate images if prompts exist and no URL yet
    // We use a separate async function to avoid blocking and handle isolation
    const triggerVisuals = async () => {
        for (const channel of channels) {
            const channelId = channel.id;
            const prompt = channel?.content?.imagePrompt;
            
            if (prompt && !imageUrls[channelId] && !isGeneratingImage[channelId]) {
                console.log(`[CampaignResult] Auto-triggering visual for ${channelId}`);
                await handleGenerateImage(channelId, prompt);
            }
        }
    };

    triggerVisuals();
  }, [result.id]);

  if (!activeChannel || !activeChannel.content) {
    return (
      <div className="p-20 text-center bg-white border border-[#E5E7EB] rounded-[3.5rem] shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-6">
            <Info size={40} />
        </div>
        <h3 className="text-xl font-bold text-[#111827] mb-2 font-display">Ошибка данных</h3>
        <p className="text-[#6B7280] max-w-sm mx-auto">Формат данных этой кампании не поддерживается или поврежден. Попробуйте создать новую.</p>
        <Button onClick={onRegenerate} variant="outline" className="mt-8 rounded-xl border-[#E5E7EB]">
            <RefreshCw size={16} className="mr-2" />
            Попробовать снова
        </Button>
      </div>
    );
  }

  const handleGenerateImage = async (channelId: string, prompt: string) => {
    if (isGeneratingImage[channelId]) return;

    setIsGeneratingImage(prev => ({ ...prev, [channelId]: true }));
    try {
        console.log(`[CampaignResult] Designing custom asset for ${channelId}...`);
        const url = await generateCampaignImage(prompt);
        if (url) {
            setImageUrls(prev => ({ ...prev, [channelId]: url }));
            toast.success('Визуальный артефакт готов');
        }
    } catch (err: any) {
        console.error(`[CampaignResult] Visual generation failed for ${channelId}:`, err);
        // We don't toast error here to avoid annoying the user if it's an auto-trigger
        // but we log it. If it was manual, maybe we should.
    } finally {
        setIsGeneratingImage(prev => ({ ...prev, [channelId]: false }));
    }
  };

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopied(type);
    toast.success('Контент скопирован в буфер обмена');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = () => {
    addFavorite({
      id: `campaign-${Date.now()}`,
      moduleId: 'newsletters',
      type: 'result',
      title: result.name,
      content: result,
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceModule: sourceInfo?.module,
        sourceId: sourceInfo?.id
      }
    });
    toast.success('Кампания сохранена в Workspace');
  };

  const exportAsTxt = () => {
    const channels = result?.channels || [];
    const text = `CAMPAIGN: ${result?.name || 'Untitled'}\n\n` + 
      channels.map(c => `--- ${(c?.id || 'Unknown').toUpperCase()} ---\n${c?.content?.body || ''}\n`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result?.name || 'campaign'}.txt`;
    a.click();
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Strategy Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-[#111827] rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] -z-10" />
        <div className="flex items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles size={28} />
            </div>
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Стратегия кампании</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{result.id}</span>
                </div>
                <h2 className="text-2xl font-bold text-white font-display mb-3">{result.name}</h2>
                <p className="text-white/60 text-sm leading-relaxed max-w-2xl font-medium">
                    {result.strategy || "Эта кампания разработана для максимального охвата через адаптацию смыслов под специфику каждой площадки."}
                </p>
            </div>
        </div>
      </motion.div>

      {/* Main Campaign Workspace */}
      <GlassCard className="p-0 bg-white border-[#E5E7EB] shadow-2xl rounded-[3.5rem] overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-10 pt-10 border-b border-[#F3F4F6]">
            <div className="flex gap-10">
                {availableTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2.5 pb-8 border-b-2 transition-all relative",
                            activeTab === tab.id 
                                ? "border-[#10B981] text-[#111827]" 
                                : "border-transparent text-[#9CA3AF] hover:text-[#4B5563]"
                        )}
                    >
                        <tab.icon size={18} />
                        <span className="text-[14px] font-bold uppercase tracking-wider">{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div 
                                layoutId="activeTab"
                                className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#10B981]"
                            />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4 pb-8">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                    <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Оптимизировано для конверсии</span>
                </div>
            </div>
        </div>

        {/* Content Viewer */}
        <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Editor/Body Area */}
            <div className="flex-1 p-10 lg:p-16 border-r border-[#F3F4F6]">
                <div className="max-w-[700px] mx-auto space-y-10">
                    {/* Channel Specific Headers */}
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-6"
                        >
                            {activeTab === 'email' && (
                                <div className="p-8 rounded-[2rem] bg-[#F9FAFB] border border-[#E5E7EB] space-y-4">
                                    <div className="flex items-center gap-6 text-[13px]">
                                        <span className="w-20 font-bold text-[#9CA3AF] uppercase tracking-widest">Тема:</span>
                                        <span className="font-bold text-[#111827]">{activeChannel.content?.subject || "Тема не создана"}</span>
                                    </div>
                                    <div className="flex items-center gap-6 text-[13px]">
                                        <span className="w-20 font-bold text-[#9CA3AF] uppercase tracking-widest">Превью:</span>
                                        <span className="font-medium text-[#6B7280] italic">{activeChannel.content?.preheader || "Текст превью отсутствует"}</span>
                                    </div>
                                </div>
                            )}

                            <div className="markdown-body prose prose-slate prose-lg max-w-none">
                                <ReactMarkdown>{activeChannel.content?.body || "Контент отсутствует"}</ReactMarkdown>
                            </div>

                            {activeChannel.content?.cta && (
                                <div className="pt-10 border-t border-[#F3F4F6] mt-10">
                                    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-[#10B981]/5 border border-[#10B981]/10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#10B981] shadow-sm">
                                                <ExternalLink size={24} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-[#10B981] uppercase tracking-widest mb-1 block">Целевое действие</span>
                                                <h4 className="text-[15px] font-bold text-[#111827]">{activeChannel.content.cta?.text || "Узнать больше"}</h4>
                                            </div>
                                        </div>
                                        <Button className="rounded-xl px-8 shadow-lg shadow-emerald-500/20">
                                            <span>Перейти</span>
                                            <ArrowRight size={18} className="ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Sidebar / Context Area */}
            <div className="w-full lg:w-[400px] bg-[#F9FAFB]/50 p-10 flex flex-col gap-8 shrink-0">
                {/* Visual Artifact */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-widest">Визуальное сопровождение</h4>
                        <button 
                            onClick={() => activeChannel.content.imagePrompt && handleGenerateImage(activeChannel.id, activeChannel.content.imagePrompt)}
                            disabled={isGeneratingImage[activeChannel.id]}
                            className="p-2 rounded-lg bg-white border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#10B981] transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={cn(isGeneratingImage[activeChannel.id] && "animate-spin")} />
                        </button>
                    </div>

                    <div className="aspect-square rounded-[2rem] bg-white border border-[#E5E7EB] overflow-hidden relative shadow-sm group">
                        {imageUrls[activeChannel.id] ? (
                            <>
                                <img 
                                    src={imageUrls[activeChannel.id]} 
                                    alt="Campaign Visual" 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm p-6">
                                    <p className="text-[11px] text-white/80 font-medium text-center line-clamp-4">
                                        {activeChannel.content.imagePrompt}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center gap-4">
                                {isGeneratingImage[activeChannel.id] ? (
                                    <>
                                        <div className="w-12 h-12 rounded-full border-2 border-[#10B981]/20 border-t-[#10B981] animate-spin" />
                                        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">Создаю визуальный образ...</p>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon size={40} className="text-[#D1D5DB]" />
                                        <p className="text-[12px] text-[#9CA3AF] font-medium italic">Визуальный артефакт еще не создан</p>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="rounded-xl border-[#E5E7EB] h-9"
                                            onClick={() => activeChannel.content.imagePrompt && handleGenerateImage(activeChannel.id, activeChannel.content.imagePrompt)}
                                        >
                                            Создать visual
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Variable Check */}
                <div className="p-6 rounded-[2rem] bg-white border border-[#E5E7EB] shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">
                            <Info size={16} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#111827] uppercase tracking-tight">Внедренные переменные</h4>
                    </div>
                    <div className="space-y-2">
                        {Object.entries(result.variables || {}).length > 0 ? Object.entries(result.variables || {}).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between text-[11px] p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors">
                                <span className="font-bold text-[#9CA3AF] uppercase tracking-wider">{key}</span>
                                <span className="font-semibold text-[#111827] truncate ml-4 max-w-[150px]">{val as string}</span>
                            </div>
                        )) : (
                            <p className="text-[11px] text-[#9CA3AF] font-medium italic">Общие переменные не использовались</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-auto space-y-3">
                    <Button 
                        variant="secondary" 
                        size="xl" 
                        className="w-full bg-[#111827] hover:bg-[#1f2937] text-white rounded-2xl h-14 shadow-xl shadow-black/10"
                        onClick={() => handleCopy(activeChannel.content.body, activeTab)}
                    >
                        {copied === activeTab ? <Check size={20} className="mr-2" /> : <Copy size={20} className="mr-2" />}
                        <span>{copied === activeTab ? 'Скопировано' : 'Копировать контент'}</span>
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="rounded-xl h-12 text-[#6B7280]" onClick={exportAsTxt}>
                            <FileText size={16} className="mr-2" />
                            .TXT
                        </Button>
                        <Button variant="outline" className="rounded-xl h-12 text-[#6B7280]" onClick={() => window.alert('Markdown export ready')}>
                            <Download size={16} className="mr-2" />
                            .MD
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </GlassCard>

      {/* Footer Actions */}
      <div className="flex items-center justify-center gap-6">
          <Button 
            variant="outline" 
            size="xl" 
            className="rounded-[2.5rem] px-12 gap-3 border-[#E5E7EB] h-16"
            onClick={onRegenerate}
          >
            <RefreshCw size={24} />
            Перегенерировать всё
          </Button>
          <Button 
            size="xl" 
            className="rounded-[2.5rem] px-12 gap-3 h-16 shadow-2xl shadow-emerald-500/20"
            onClick={handleSave}
          >
            <Save size={24} />
            Сохранить в Workspace
          </Button>
      </div>
    </div>
  );
}
