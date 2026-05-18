import { FileText, BookOpen, PenTool } from 'lucide-react';
import { ModulePage } from '@/src/shared/components/ModulePage';

export function Longreads() {
  return (
    <ModulePage
      title="Longreads"
      icon={FileText}
      moduleName="longread"
      description="Synthesize deep-research articles and comprehensive whitepapers from raw datasets."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Document Title</label>
          <input 
            type="text" 
            placeholder="Analytical Report: State of AI..."
            className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/30"
          />
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Architectural Style</label>
           <select className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/30 font-sans text-white/60">
              <option>Scientific Journal</option>
              <option>Wired Editorial</option>
              <option>Executive Whitepaper</option>
           </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Thematic Layers</label>
          <textarea 
            rows={4}
            placeholder="Add specific themes or data points to integrate..."
            className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/30 font-sans resize-none"
          />
        </div>
      </div>
    </ModulePage>
  );
}
