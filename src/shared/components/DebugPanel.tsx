import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShieldAlert, Cpu, Network, Clock } from 'lucide-react';
import { useDebugStore } from '@/src/stores/useDebugStore';
import { cn } from '@/src/shared/utils/cn';

export function DebugPanel() {
  const { logs, isOpen, toggleDebug, clearLogs } = useDebugStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 450 }}
          animate={{ x: 0 }}
          exit={{ x: 450 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="fixed top-0 right-0 h-full w-[450px] bg-[#0B0F14]/95 backdrop-blur-3xl border-l border-white/[0.05] z-[100] flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.4)]"
        >
          <header className="h-20 px-6 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em] leading-none mb-1">Системные логи</span>
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest leading-none">Debug Mode Active</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearLogs}
                className="p-2.5 hover:bg-white/[0.03] rounded-xl text-white/20 hover:text-red-400 transition-all border border-transparent hover:border-white/5"
                title="Очистить"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={toggleDebug}
                className="p-2.5 hover:bg-white/[0.03] rounded-xl text-white/20 hover:text-white transition-all border border-transparent hover:border-white/5"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar custom-scroll">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/10 gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/5 flex items-center justify-center">
                    <Cpu size={20} className="opacity-20" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Ожидание событий...</span>
              </div>
            ) : (
              logs.map((log) => (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={log.id} 
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] font-mono text-[11px] leading-relaxed group hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                          "uppercase font-bold px-2 py-0.5 rounded-md text-[9px] tracking-widest",
                          log.type === 'error' ? "bg-red-500/10 text-red-400 border border-red-500/10" :
                          log.type === 'request' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/10" :
                          log.type === 'response' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" :
                          "bg-white/5 text-white/40 border border-white/5"
                        )}>
                          {log.type}
                        </span>
                        <div className="h-px w-4 bg-white/5" />
                        <span className="text-white/20 flex items-center gap-1.5">
                            <Clock size={10} />
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-emerald-500/40 mb-1.5 uppercase font-bold text-[9px] tracking-widest">
                    <Network size={10} />
                    {log.module}
                  </div>
                  
                  <div className="text-white/70 font-sans text-[12px] leading-snug">{log.message}</div>
                  
                  {log.data && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        whileHover={{ height: 'auto', opacity: 1 }}
                        className="overflow-hidden"
                    >
                        <pre className="mt-3 p-3 bg-black/40 rounded-xl border border-white/5 overflow-x-auto text-[10px] text-white/40 no-scrollbar">
                        {JSON.stringify(log.data, null, 2)}
                        </pre>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </div>

          <footer className="p-6 border-t border-white/[0.03] bg-white/[0.01]">
             <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-mono">Архитектура</div>
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-tight">Modular / OpenAI Native</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-mono">Ядро</div>
                    <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight">Active Engine v1.0</div>
                </div>
             </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
