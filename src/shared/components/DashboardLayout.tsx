import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DebugPanel } from './DebugPanel';
import { motion } from 'motion/react';

export function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-[#0B0F14] text-white overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[0%] w-[30%] h-[30%] rounded-full bg-teal-500/5 blur-[120px]" />
      </div>

      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-[#0B0F14]/50 backdrop-blur-md">
           <div className="flex items-center gap-2">
             <span className="text-white/30 text-sm font-medium">Workspace /</span>
             <span className="text-white text-sm font-semibold tracking-tight">Main Dashboard</span>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-xs font-mono text-white/40 tracking-wider uppercase">OpenAI Online</span>
           </div>
        </header>

        <section className="flex-1 overflow-y-auto overflow-x-hidden p-8 no-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-6xl mx-auto w-full h-full"
          >
            <Outlet />
          </motion.div>
        </section>
      </main>

      <DebugPanel />
    </div>
  );
}
