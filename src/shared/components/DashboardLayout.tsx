import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DebugPanel } from './DebugPanel';
import { motion, AnimatePresence } from 'motion/react';
import { NAVIGATION_CONFIG } from '@/src/config/navigation';

export function DashboardLayout() {
  const location = useLocation();
  const currentNav = NAVIGATION_CONFIG.find(item => item.path === location.pathname);
  const pageTitle = currentNav ? currentNav.label : location.pathname === '/' ? 'Главная' : 'Настройки';

  return (
    <div className="flex h-screen w-full bg-[#0F1115] text-white/90 overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200 font-sans">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-500/[0.02] blur-[160px]" />
        <div className="absolute bottom-[5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-teal-500/[0.02] blur-[160px]" />
      </div>

      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
        <header className="h-20 flex items-center justify-between px-10 border-b border-white/[0.05] bg-[#131720]/40 backdrop-blur-xl shrink-0">
           <AnimatePresence mode="wait">
             <motion.div 
               key={pageTitle}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 10 }}
               transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
               className="flex items-center gap-4"
             >
               <span className="text-white/30 text-[10px] font-bold font-mono tracking-[0.25em] uppercase">Консоль</span>
               <div className="w-[1px] h-3 bg-white/10" />
               <span className="text-white/90 text-sm font-bold tracking-tight uppercase font-display">{pageTitle}</span>
             </motion.div>
           </AnimatePresence>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-[10px] font-bold font-mono text-emerald-400 tracking-widest uppercase leading-none">Системы Активны</span>
              </div>
           </div>
        </header>

        <section className="flex-1 overflow-y-auto overflow-x-hidden p-10 no-scrollbar custom-scroll">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
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
