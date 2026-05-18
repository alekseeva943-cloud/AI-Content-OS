import { LayoutGrid, Calendar, Target, ListChecks } from 'lucide-react';
import { ModulePage } from '@/src/shared/components/ModulePage';

export function ContentPlanner() {
  return (
    <ModulePage
      title="Content Planner"
      icon={LayoutGrid}
      moduleName="planner"
      description="Strategize and schedule your upcoming content arcs across multiple platforms automatically."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Campaign Goal</label>
          <input 
            type="text" 
            placeholder="e.g. Launching a new SaaS tool for founders"
            className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/30 font-sans"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Core Narrative</label>
          <textarea 
            rows={4}
            placeholder="Describe the main message or story..."
            className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/30 font-sans resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
           <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-white/60">
                <Calendar size={14} className="text-emerald-400" />
                <span className="text-[10px] uppercase font-bold tracking-tight">Timeline</span>
              </div>
              <select className="w-full bg-transparent text-sm focus:outline-none uppercase font-mono text-white/40">
                <option>Next 30 Days</option>
                <option>Next Quarter</option>
              </select>
           </div>
           <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-white/60">
                <Target size={14} className="text-emerald-400" />
                <span className="text-[10px] uppercase font-bold tracking-tight">Focus</span>
              </div>
              <select className="w-full bg-transparent text-sm focus:outline-none uppercase font-mono text-white/40">
                <option>LinkedIn & X</option>
                <option>Multi-Platform</option>
              </select>
           </div>
        </div>
      </div>
    </ModulePage>
  );
}
