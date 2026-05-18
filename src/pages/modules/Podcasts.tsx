import { Mic2, Headphones, Activity } from 'lucide-react';
import { ModulePage } from '@/src/shared/components/ModulePage';

export function Podcasts() {
  return (
    <ModulePage
      title="Podcasts"
      icon={Mic2}
      moduleName="podcast"
      description="Generate show notes, episode scripts, and interview questions tailored to your guest's persona."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Guest Context</label>
          <input 
            type="text" 
            placeholder="Guest name or bio URL..."
            className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/30"
          />
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Episode Theme</label>
           <select className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/30 font-sans text-white/60">
              <option>Technical Deep Dive</option>
              <option>Entrepreneurial Journey</option>
              <option>Creative Mastermind</option>
           </select>
        </div>
      </div>
    </ModulePage>
  );
}
