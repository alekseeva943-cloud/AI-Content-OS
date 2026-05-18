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
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      className="h-full bg-[#0B0F14]/95 backdrop-blur-3xl border-r border-white/5 flex flex-col relative z-50 overflow-hidden"
    >
      {/* Logo Area */}
      <Link to="/" className="h-20 px-6 flex items-center gap-3 border-b border-white/[0.03] group/logo transition-colors hover:bg-white/[0.01]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/20 relative">
          <div className="absolute inset-0 bg-white/20 blur-lg rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity" />
          <Sparkles className="w-5 h-5 text-white relative z-10 transition-transform group-hover/logo:scale-110" />
        </div>
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col whitespace-nowrap"
            >
              <span className="font-bold text-white tracking-[0.14em] text-sm uppercase">AI Content OS</span>
              <span className="text-[10px] text-emerald-400/40 font-mono tracking-tighter uppercase group-hover/logo:text-emerald-400/60 transition-colors">Premium Workspace</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
        {NAVIGATION_CONFIG.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative",
              isActive 
                ? "bg-white/[0.08] text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)]" 
                : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110",
                  isActive ? "text-emerald-400 opacity-100" : "opacity-60 group-hover:opacity-100"
                )} />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium tracking-tight whitespace-nowrap">{item.label}</span>
                )}
                
                {/* Active Glow Indicator */}
                <div
                  className={cn(
                    "absolute left-[-2px] w-[3px] h-5 bg-emerald-500 rounded-r-full transition-all duration-500 opacity-0 blur-[2px]",
                    isActive && "opacity-100 scale-y-100"
                  )}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System & Footer */}
      <div className="p-4 border-t border-white/[0.03] space-y-1.5">
        <button
          onClick={toggleDebug}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all group"
        >
          <Terminal className="w-5 h-5 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
          {!sidebarCollapsed && <span className="text-xs font-mono uppercase tracking-widest whitespace-nowrap">Консоль отладки</span>}
        </button>

        {FOOTER_NAVIGATION.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
              isActive 
                ? "bg-white/[0.08] text-white" 
                : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-opacity",
                  isActive ? "text-emerald-400 opacity-100" : "opacity-60 group-hover:opacity-100"
                )} />
                {!sidebarCollapsed && <span className="text-sm font-medium tracking-tight">{item.label}</span>}
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
