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
          className="fixed top-0 right-0 h-full w-[420px] bg-white border-l border-[#E5E7EB] z-[100] flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.05)]"
        >
          <header className="h-16 px-6 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#10B981]">
                <ShieldAlert size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#111827] uppercase tracking-wider leading-none mb-1">System Logs</span>
                <span className="text-[10px] font-bold font-mono text-[#9CA3AF] uppercase tracking-widest leading-none">Diagnostic Center</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearLogs}
                className="p-2.5 hover:bg-red-50 rounded-xl text-[#9CA3AF] hover:text-red-500 transition-colors border border-transparent hover:border-red-100"
                title="Clear"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={toggleDebug}
                className="p-2.5 hover:bg-[#F9FAFB] rounded-xl text-[#9CA3AF] hover:text-[#111827] transition-colors border border-transparent hover:border-[#E5E7EB]"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar custom-scroll bg-[#FDFDFE]">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#E5E7EB] gap-4">
                <Cpu size={32} strokeWidth={1.5} />
                <span className="text-[11px] font-bold font-mono uppercase tracking-[0.3em]">System Idle</span>
              </div>
            ) : (
              logs.map((log) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={log.id} 
                  className="p-5 rounded-2xl bg-white border border-[#E5E7EB] font-mono text-[12px] leading-relaxed shadow-sm group hover:border-[#10B981]/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className={cn(
                          "uppercase font-bold px-2 py-0.5 rounded-lg text-[9px] tracking-widest",
                          log.type === 'error' ? "bg-red-50 text-red-500 border border-red-100" :
                          log.type === 'request' ? "bg-blue-50 text-blue-500 border border-blue-100" :
                          log.type === 'response' ? "bg-emerald-50 text-emerald-500 border border-emerald-100" :
                          "bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]"
                        )}>
                          {log.type}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                        <span className="text-[#9CA3AF] flex items-center gap-2 text-[10px] font-bold">
                            <Clock size={11} />
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[#10B981] mb-2 uppercase font-bold text-[9px] tracking-widest font-mono opacity-60">
                    <Network size={11} />
                    {log.module}
                  </div>
                  
                  <div className="text-[#374151] font-sans text-[14px] leading-snug font-medium">{log.message}</div>
                  
                  {log.data && (
                    <div className="mt-4 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] overflow-x-auto text-[11px] text-[#6B7280] no-scrollbar select-all font-mono leading-relaxed">
                      {JSON.stringify(log.data, null, 2)}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>

          <footer className="p-8 border-t border-[#E5E7EB] bg-white">
             <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                    <div className="text-[10px] text-[#9CA3AF] uppercase tracking-[0.2em] font-bold leading-none">Architecture</div>
                    <div className="text-[12px] text-[#374151] font-bold tracking-tight">Catalyst Engine</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <div className="text-[10px] text-[#9CA3AF] uppercase tracking-[0.2em] font-bold leading-none">Status</div>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                       <span className="text-[12px] text-[#059669] font-bold tracking-tight">Active Online</span>
                    </div>
                </div>
             </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
