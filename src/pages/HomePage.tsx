import { motion } from 'motion/react';
import { Sparkles, ArrowUpRight, Zap, Target, BookOpen } from 'lucide-react';
import { GlassCard } from '@/src/shared/components/UI';

export function HomePage() {
  const stats = [
    { label: 'Weekly Content', value: '12', icon: Target, trend: '+20%' },
    { label: 'AI Cycles', value: '842', icon: Zap, trend: '98%' },
    { label: 'Engagements', value: '42.5k', icon: Sparkles, trend: '+4%' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero */}
      <section className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          Control Center
          <Sparkles className="text-emerald-400 w-8 h-8" />
        </h1>
        <p className="text-white/40 max-w-lg leading-relaxed">
          Welcome back to your high-performance content laboratory. All systems are online and calibrated.
        </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="p-6 h-auto">
            <div className="flex items-center justify-between mb-4">
               <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                 <stat.icon className="w-5 h-5 text-emerald-400" />
               </div>
               <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10 tracking-widest">
                 {stat.trend}
               </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-xs uppercase tracking-widest font-mono text-white/30">{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-5 gap-6">
         <GlassCard className="col-span-3 p-8 group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
            <h2 className="text-xl font-bold mb-4 relative z-10 flex items-center gap-2">
              Recent Projects
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </h2>
            <div className="space-y-4 relative z-10">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group/item">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40">
                         {i}
                       </div>
                       <div>
                         <div className="text-sm font-semibold text-white/90">Strategic Content Roadmap Q3</div>
                         <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Modified 2h ago</div>
                       </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-white/20 group-hover/item:text-emerald-400 transition-colors" />
                 </div>
               ))}
            </div>
         </GlassCard>

         <GlassCard className="col-span-2 p-8 bg-emerald-500/10 border-emerald-500/20">
            <h2 className="text-xl font-bold mb-4">System Status</h2>
            <div className="space-y-6">
               <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase text-white/40">
                    <span>OpenAI API Rate</span>
                    <span className="text-emerald-400">84%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "84%" }}
                      className="h-full bg-emerald-500" 
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase text-white/40">
                    <span>Memory Allocation</span>
                    <span className="text-emerald-400">32%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "32%" }}
                      className="h-full bg-emerald-500" 
                    />
                  </div>
               </div>

               <div className="pt-4 mt-4 border-t border-white/5 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-[11px] text-white/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Neural Engine Calibrated</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-white/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Context Layers Optimized</span>
                  </div>
               </div>
            </div>
         </GlassCard>
      </div>
    </div>
  );
}
