import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Save } from 'lucide-react';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { EmptyResultState } from '@/src/shared/components/ResultPanel';

interface ModulePageProps {
  title: string;
  icon: any;
  description: string;
  children: ReactNode;
  moduleName: string;
}

export function ModulePage({ title, icon: Icon, description, children, moduleName }: ModulePageProps) {
  return (
    <div className="grid grid-cols-12 gap-8 h-full min-h-[calc(100vh-160px)] pb-12">
      {/* Input Side */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        <section className="flex flex-col gap-2">
           <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-emerald-400">
               <Icon className="w-6 h-6" />
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
           </div>
           <p className="text-white/40 text-sm leading-relaxed max-w-md">
             {description}
           </p>
        </section>

        <GlassCard className="p-8 w-full">
           <div className="space-y-6">
              {children}
           </div>

           <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
              <Button variant="ghost" size="sm" className="gap-2">
                <RotateCcw size={14} />
                Reset
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2 border-white/5">
                  <Save size={14} />
                  Draft
                </Button>
                <Button size="sm" className="gap-2 w-32 shadow-emerald-500/20">
                  <Play size={14} className="fill-current" />
                  Orchestrate
                </Button>
              </div>
           </div>
        </GlassCard>
      </div>

      {/* Result Side */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
         <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">Orchestration Results</span>
            <div className="flex items-center gap-4 text-white/20 hover:text-white/40 transition-colors cursor-pointer text-[10px] font-mono uppercase tracking-widest">
               <span>Filter: ALL</span>
               <span>Sort: NEWEST</span>
            </div>
         </div>

         <GlassCard className="flex-1 bg-black/20 border-dashed border-white/5">
            <EmptyResultState 
              title="Ready for Input"
              description={`Configure the parameters on the left to start generating ${moduleName} content via OpenAI.`}
            />
         </GlassCard>
      </div>
    </div>
  );
}
