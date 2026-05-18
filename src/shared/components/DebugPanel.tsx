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
          initial={{ x: 420 }}
          animate={{ x: 0 }}
          exit={{ x: 420 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="fixed top-0 right-0 h-full w-[420px] bg-[#0D0F14] border-l border-white/[0.05] z-[100] flex flex-col shadow-2xl"
        >
          <header className="h-20 px-6 border-b border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/10 text-emerald-400">
                <ShieldAlert size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white/90 uppercase tracking-[0.16em] leading-none mb-1">Системные логи</span>
                <span className="text-[9px] font-bold font-mono text-white/20 uppercase tracking-widest leading-none">Debug Mode</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearLogs}
                className="p-2 hover:bg-white/[0.03] rounded-lg text-white/20 hover:text-red-400 transition-colors"
                title="Очистить"
              >
                <Trash2 size={14} />
              </button>
              <button 
                onClick={toggleDebug}
                className="p-2 hover:bg-white/[0.03] rounded-lg text-white/20 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar custom-scroll">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/10 gap-3">
                <div className="w-10 h-10 rounded-full border border-dashed border-white/5 flex items-center justify-center">
                    <Cpu size={16} className="opacity-20" />
                </div>
                <span className="text-[9px] font-bold font-mono uppercase tracking-[0.3em]">Мониторинг...</span>
              </div>
            ) : (
              logs.map((log) => (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={log.id} 
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] font-mono text-[11px] leading-relaxed"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                          "uppercase font-bold px-1.5 py-0.5 rounded text-[8px] tracking-widest",
                          log.type === 'error' ? "bg-red-500/10 text-red-500/80 border border-red-500/10" :
                          log.type === 'request' ? "bg-cyan-500/10 text-cyan-500/80 border border-cyan-500/10" :
                          log.type === 'response' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" :
                          "bg-white/5 text-white/30 border border-white/5"
                        )}>
                          {log.type}
                        </span>
                        <span className="text-white/10 font-bold">•</span>
                        <span className="text-white/20 flex items-center gap-1.5 text-[9px]">
                            <Clock size={9} />
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-emerald-500/30 mb-1.5 uppercase font-bold text-[8px] tracking-widest font-mono">
                    <Network size={9} />
                    {log.module}
                  </div>
                  
                  <div className="text-white/60 font-sans text-[12px] leading-snug font-medium">{log.message}</div>
                  
                  {log.data && (
                    <div className="mt-2.5 p-3 bg-black/20 rounded-lg border border-white/[0.03] overflow-x-auto text-[10px] text-white/30 no-scrollbar select-all">
                      {JSON.stringify(log.data, null, 2)}
                    </div>
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
