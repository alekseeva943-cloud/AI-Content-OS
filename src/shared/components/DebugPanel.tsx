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
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="fixed top-0 right-0 h-full w-[420px] bg-[#15181E] border-l border-[#242933] z-[100] flex flex-col shadow-2xl"
        >
          <header className="h-16 px-6 border-b border-[#242933] flex items-center justify-between bg-[#1C2028]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#383E4C] text-[#898E9E]">
                <ShieldAlert size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#F1F2F4] uppercase tracking-widest leading-none mb-1">System Logs</span>
                <span className="text-[9px] font-bold font-mono text-[#4B5262] uppercase tracking-widest leading-none">Diagnostic Mode</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearLogs}
                className="p-2 hover:bg-[#242933] rounded-lg text-[#4B5262] hover:text-red-500 transition-colors"
                title="Clear"
              >
                <Trash2 size={14} />
              </button>
              <button 
                onClick={toggleDebug}
                className="p-2 hover:bg-[#242933] rounded-lg text-[#4B5262] hover:text-[#F1F2F4] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar custom-scroll bg-[#0D0F12]">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#242933] gap-3">
                <Cpu size={24} className="opacity-20" />
                <span className="text-[9px] font-bold font-mono uppercase tracking-widest">Idle...</span>
              </div>
            ) : (
              logs.map((log) => (
                <motion.div 
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={log.id} 
                  className="p-4 rounded-xl bg-[#15181E] border border-[#242933] font-mono text-[11px] leading-relaxed"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                          "uppercase font-bold px-1.5 py-0.5 rounded text-[8px] tracking-widest",
                          log.type === 'error' ? "bg-red-500/10 text-red-500/80 border border-red-500/10" :
                          log.type === 'request' ? "bg-cyan-500/10 text-cyan-500/80 border border-cyan-500/10" :
                          log.type === 'response' ? "bg-emerald-500/10 text-emerald-500/80 border border-emerald-500/10" :
                          "bg-[#1C2028] text-[#4B5262] border border-[#383E4C]"
                        )}>
                          {log.type}
                        </span>
                        <span className="text-[#383E4C] font-bold">•</span>
                        <span className="text-[#4B5262] flex items-center gap-1.5 text-[9px]">
                            <Clock size={9} />
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[#10B981]/50 mb-1.5 uppercase font-bold text-[8px] tracking-widest font-mono">
                    <Network size={9} />
                    {log.module}
                  </div>
                  
                  <div className="text-[#E2E4E9] font-sans text-[12px] leading-snug font-medium">{log.message}</div>
                  
                  {log.data && (
                    <div className="mt-2.5 p-3 bg-[#0D0F12] rounded-lg border border-[#242933] overflow-x-auto text-[10px] text-[#4B5262] no-scrollbar select-all">
                      {JSON.stringify(log.data, null, 2)}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>

          <footer className="p-6 border-t border-[#242933] bg-[#1C2028]">
             <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="text-[9px] text-[#4B5262] uppercase tracking-[0.2em] font-mono leading-none">Architecture</div>
                    <div className="text-[10px] text-[#898E9E] font-bold uppercase tracking-tight">Modular Engine</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="text-[9px] text-[#4B5262] uppercase tracking-[0.2em] font-mono leading-none">Kernel</div>
                    <div className="text-[10px] text-[#10B981] font-bold uppercase tracking-tight">Active v1.0</div>
                </div>
             </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
