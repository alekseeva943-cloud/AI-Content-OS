import { Video, User, Zap } from 'lucide-react';
import { ModulePage } from '@/src/shared/components/ModulePage';

export function VideoAvatar() {
  return (
    <ModulePage
      title="Video Avatar"
      icon={Video}
      moduleName="avatar"
      description="Prepare scripts and instructional prompts for high-fidelity HeyGen video synthesis."
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-2">
           <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">
             <Zap size={12} />
             Infrastructure Note
           </div>
           <p className="text-[11px] text-white/40 leading-relaxed">
             This module generates scripts optimized for HeyGen's emotional range tags. Integration required in Settings.
           </p>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Avatar Selection</label>
          <select className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/30 font-sans text-white/60">
              <option>Studio Professional</option>
              <option>Casual Creator</option>
           </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Base Script</label>
          <textarea 
            rows={5}
            placeholder="Main message the avatar should deliver..."
            className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/30 font-sans resize-none"
          />
        </div>
      </div>
    </ModulePage>
  );
}
