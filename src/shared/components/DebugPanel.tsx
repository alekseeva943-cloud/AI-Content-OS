import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShieldAlert } from 'lucide-react';
import { useDebugStore } from '@/src/stores/useDebugStore';
import { cn } from '@/src/shared/utils/cn';

export function DebugPanel() {
  const { logs, isOpen, toggleDebug, clearLogs } = useDebugStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          className="fixed top-0 right-0 h-full w-[400px] bg-[#0B0F14] border-l border-white/10 z-[100] flex flex-col shadow-2xl"
        >
          <header className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">System Logs</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearLogs}
                className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white/70 transition-colors"
                title="Clear Logs"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={toggleDebug}
                className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white/70 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/20">
                <span className="text-xs font-mono uppercase tracking-widest">No Logs Yet</span>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/5 font-mono text-[11px] leading-relaxed">
                  <div className="flex items-center justify-between mb-1.5 grayscale opacity-50">
                    <span className={cn(
                      "uppercase font-bold px-1.5 py-0.5 rounded",
                      log.type === 'error' ? "bg-red-500/20 text-red-400" :
                      log.type === 'request' ? "bg-cyan-500/20 text-cyan-400" :
                      log.type === 'response' ? "bg-emerald-500/20 text-emerald-400" :
                      "bg-white/10 text-white"
                    )}>
                      {log.type}
                    </span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-white/30 mb-1">{log.module}</div>
                  <div className="text-white/70">{log.message}</div>
                  {log.data && (
                    <pre className="mt-2 p-2 bg-black/40 rounded border border-white/5 overflow-x-auto text-[10px]">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>

          <footer className="p-4 border-t border-white/5 bg-white/[0.02]">
             <div className="text-[10px] text-white/20 uppercase tracking-widest font-mono">
               Architecture: Modular / OpenAI Native
             </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
