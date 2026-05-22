import React, { useState } from 'react';
import { PodcastConfigurator } from '@/src/features/podcast/components/PodcastConfigurator';
import { PodcastPreview } from '@/src/features/podcast/components/PodcastPreview';
import { PodcastDebugPanel } from '@/src/features/podcast/components/PodcastDebugPanel';
import { usePodcastGeneration } from '@/src/features/podcast/hooks/usePodcastGeneration';
import { Mic, Radio, Sparkles, AlertCircle } from 'lucide-react';

export function Podcasts() {
  const { isGenerating, error, result, debugTrace, generate, clearResult } = usePodcastGeneration();
  const [guestEnabled, setGuestEnabled] = useState(true);

  const handleGenerate = async (config: any) => {
    setGuestEnabled(config.guestEnabled);
    await generate(config);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Visual Title / Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-[#10B981]/10 text-[#10B981] rounded-full text-[10px] font-black uppercase tracking-wider">
              Feature Module
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-800 tracking-tight font-display flex items-center gap-2.5">
            <Radio className="text-[#10B981] animate-pulse scroll-py-1" size={30} />
            AI Podcast Studio
          </h1>
          <p className="text-sm text-neutral-500 max-w-2xl leading-relaxed">
            Создавайте полноценные сценарии к выпускам подкастов с автоматической хронологией, сложными гостевыми диалогами и естественным синтезом голоса.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs font-medium flex items-center gap-2.5 text-left animate-in fade-in duration-300">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main content display */}
      {!result ? (
        <div className="max-w-3xl mx-auto py-4 space-y-8">
          <PodcastConfigurator
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
          
          <PodcastDebugPanel trace={debugTrace} isGenerating={isGenerating} />
        </div>
      ) : (
        <div className="space-y-8">
          <PodcastPreview
            result={result}
            onBack={clearResult}
            guestEnabled={guestEnabled}
          />

          <PodcastDebugPanel trace={debugTrace} isGenerating={isGenerating} />
        </div>
      )}
    </div>
  );
}
