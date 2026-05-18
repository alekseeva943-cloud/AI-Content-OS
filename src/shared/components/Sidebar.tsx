import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Terminal, Sparkles } from 'lucide-react';
import { NAVIGATION_CONFIG, FOOTER_NAVIGATION } from '@/src/config/navigation';
import { useAppStore } from '@/src/stores/useAppStore';
import { useDebugStore } from '@/src/stores/useDebugStore';
import { cn } from '@/src/shared/utils/cn';

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { toggleDebug } = useDebugStore();

  return (
    <motion.div
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
      className="h-full bg-[#0D0F14] border-r border-white/5 flex flex-col relative z-50 overflow-hidden"
    >
      {/* Logo Area */}
      <Link to="/" className="h-20 px-6 flex items-center gap-3 border-b border-white/[0.04] group/logo transition-colors hover:bg-white/[0.02]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/10 relative">
          <Sparkles className="w-4 h-4 text-white relative z-10 transition-transform group-hover/logo:scale-110" />
        </div>
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              className="flex flex-col whitespace-nowrap"
            >
              <span className="font-bold text-white/90 tracking-[0.1em] text-[13px] uppercase">AI Content OS</span>
              <span className="text-[9px] text-emerald-400/50 font-mono tracking-tight uppercase group-hover/logo:text-emerald-400/70 transition-colors">Premium Workspace</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto no-scrollbar">
        {NAVIGATION_CONFIG.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
              isActive 
                ? "bg-white/[0.06] text-white shadow-sm" 
                : "text-white/40 hover:text-white/80 hover:bg-white/[0.03]"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "w-4.5 h-4.5 flex-shrink-0 transition-all",
                  isActive ? "text-emerald-400" : "opacity-50 group-hover:opacity-100"
                )} />
                {!sidebarCollapsed && (
                  <span className="text-[13px] font-medium tracking-tight whitespace-nowrap">{item.label}</span>
                )}
                
                {/* Active Indicator Bar */}
                <div
                  className={cn(
                    "absolute left-[-12px] w-[3px] h-4 bg-emerald-500 rounded-r-full transition-all duration-300 opacity-0",
                    isActive && "opacity-100"
                  )}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System & Footer */}
      <div className="p-3 border-t border-white/[0.04] space-y-1">
        <button
          onClick={toggleDebug}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.03] transition-all group"
        >
          <Terminal className="w-4.5 h-4.5 flex-shrink-0 opacity-40 group-hover:opacity-100" />
          {!sidebarCollapsed && <span className="text-[11px] font-mono uppercase tracking-widest whitespace-nowrap">Консоль отладки</span>}
        </button>

        {FOOTER_NAVIGATION.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
              isActive 
                ? "bg-white/[0.06] text-white" 
                : "text-white/40 hover:text-white/80 hover:bg-white/[0.03]"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "w-4.5 h-4.5 flex-shrink-0 transition-all",
                  isActive ? "text-emerald-400" : "opacity-50 group-hover:opacity-100"
                )} />
                {!sidebarCollapsed && <span className="text-[13px] font-medium tracking-tight">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute bottom-10 -right-0 w-6 h-12 bg-white/[0.02] hover:bg-white/[0.05] border-y border-l border-white/[0.05] flex items-center justify-center text-white/20 hover:text-emerald-400 transition-all rounded-l-lg z-50 overflow-hidden"
      >
        {sidebarCollapsed ? <ChevronRight size={12} strokeWidth={3} /> : <ChevronLeft size={12} strokeWidth={3} />}
      </button>
    </motion.div>
  );
}
