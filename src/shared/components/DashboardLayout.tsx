import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DebugPanel } from './DebugPanel';
import { motion, AnimatePresence } from 'motion/react';
import { NAVIGATION_CONFIG } from '@/src/config/navigation';

export function DashboardLayout() {
  const location = useLocation();
  const currentNav = NAVIGATION_CONFIG.find(item => item.path === location.pathname);
  const pageTitle = currentNav ? currentNav.label : location.pathname === '/' ? 'Home' : 'Settings';

  return (
    <div className="flex h-screen w-full bg-[#0D0F12] text-[#E2E4E9] overflow-hidden selection:bg-[#10B981]/30 selection:text-white font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#242933] bg-[#15181E] shrink-0">
           <AnimatePresence mode="wait">
             <motion.div 
               key={pageTitle}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 10 }}
               transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
               className="flex items-center gap-3"
             >
               <span className="text-[#4B5262] text-[11px] font-bold font-mono tracking-widest uppercase">Workspace</span>
               <div className="w-[1px] h-3 bg-[#383E4C]" />
               <h1 className="text-[#F1F2F4] text-[13px] font-bold tracking-widest uppercase font-display">{pageTitle}</h1>
             </motion.div>
           </AnimatePresence>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#10B981]/[0.03] border border-[#10B981]/10">
                <div className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                <span className="text-[10px] font-bold font-mono text-[#10B981]/80 tracking-widest uppercase leading-none">OS Active</span>
              </div>
           </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 no-scrollbar custom-scroll">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-7xl mx-auto w-full h-full"
          >
            <Outlet />
          </motion.div>
        </section>
      </main>

      <DebugPanel />
    </div>
  );
}
