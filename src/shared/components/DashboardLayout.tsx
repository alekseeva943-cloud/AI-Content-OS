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
    <div className="flex h-screen w-full bg-[#090C10] text-white/90 overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200 font-sans">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full bg-emerald-500/[0.04] blur-[160px]" />
        <div className="absolute bottom-[5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-teal-500/[0.04] blur-[160px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-cyan-500/[0.03] blur-[140px]" />
      </div>

      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
        <header className="h-24 flex items-center justify-between px-12 border-b border-white/[0.05] bg-[#0B0F14]/60 backdrop-blur-3xl shrink-0">
           <AnimatePresence mode="wait">
             <motion.div 
               key={pageTitle}
               initial={{ opacity: 0, x: -10, filter: 'blur(10px)' }}
               animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
               exit={{ opacity: 0, x: 10, filter: 'blur(10px)' }}
               transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
               className="flex items-center gap-4"
             >
               <span className="text-white/20 text-[10px] font-bold font-mono tracking-[0.3em] uppercase">Консоль</span>
               <div className="w-1 h-1 rounded-full bg-white/10" />
               <span className="text-white text-[15px] font-bold tracking-tight uppercase font-display">{pageTitle}</span>
             </motion.div>
           </AnimatePresence>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/10 shadow-lg shadow-emerald-500/5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                <span className="text-[10px] font-bold font-mono text-emerald-400 tracking-[0.2em] uppercase leading-none mt-0.5">Системы Активны</span>
              </div>
           </div>
        </header>

        <section className="flex-1 overflow-y-auto overflow-x-hidden p-12 no-scrollbar custom-scroll">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 30, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
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
