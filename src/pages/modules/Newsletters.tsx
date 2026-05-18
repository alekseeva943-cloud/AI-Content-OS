import { Mail, Send, Layers } from 'lucide-react';
import { ModulePage } from '@/src/shared/components/ModulePage';

export function Newsletters() {
  return (
    <ModulePage
      title="Newsletters"
      icon={Mail}
      moduleName="newsletter"
      description="Craft high-engagement editorial sequences that convert and build lasting audience trust."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Subject Draft</label>
          <input 
            type="text" 
            placeholder="Starting point for the subject..."
            className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Key Insights</label>
          <textarea 
            rows={6}
            placeholder="List the bullets or raw ideas you want to cover..."
            className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/30 resize-none font-sans"
          />
        </div>
      </div>
    </ModulePage>
  );
}
