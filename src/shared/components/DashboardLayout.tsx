import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DebugPanel } from './DebugPanel';
import { motion, AnimatePresence } from 'motion/react';
import { NAVIGATION_CONFIG } from '@/src/config/navigation';
import { Activity, LayoutGrid } from 'lucide-react';
import { useDebugStore } from '@/src/stores/useDebugStore';

export function DashboardLayout() {
  const location = useLocation();
  const toggleDebug = useDebugStore(state => state.toggleDebug);
  const currentNav = NAVIGATION_CONFIG.find(item => item.path === location.pathname);
  const pageTitle = currentNav ? currentNav.label : location.pathname === '/' ? 'Home' : 'Settings';

  return (
    <div className="flex h-screen w-full bg-[#F9FAFB] text-[#1F2937] overflow-hidden selection:bg-[#10B981]/10 selection:text-[#059669] font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-10 border-b border-[#E5E7EB] bg-white shrink-0">
            <AnimatePresence mode="wait">
              <motion.div 
                key={pageTitle}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="flex items-center gap-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#9CA3AF] text-[13px] font-bold uppercase tracking-[0.1em]">Workspace</span>
                </div>
                <div className="w-[1px] h-3 bg-[#E5E7EB]" />
                <h1 className="text-[#111827] text-[16px] font-bold tracking-tight font-display">{pageTitle}</h1>
              </motion.div>
            </AnimatePresence>
            
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                     <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest leading-none">Neural ID</span>
                     <span className="text-[13px] font-bold text-[#10B981] mt-1 tracking-tight">AX-720</span>
                  </div>
               </div>
            </div>
        </header>

        <section className="flex-1 overflow-y-auto p-10 no-scrollbar custom-scroll">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
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
