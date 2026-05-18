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
      transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
      className="h-full bg-[#15181E] border-r border-[#242933] flex flex-col relative z-50 overflow-hidden"
    >
      {/* Logo Area */}
      <Link to="/" className="h-16 px-6 flex items-center gap-3 border-b border-[#242933] group/logo transition-colors hover:bg-[#1C2028]">
        <div className="w-8 h-8 rounded-lg bg-[#10B981] flex-shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/10 relative">
          <Sparkles className="w-4 h-4 text-[#0D0F12] relative z-10" />
        </div>
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              className="flex flex-col whitespace-nowrap"
            >
              <span className="font-bold text-[#F1F2F4] tracking-wider text-[14px]">CONTENT OS</span>
              <span className="text-[9px] text-[#10B981] font-bold font-mono tracking-widest uppercase">Workspace</span>
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
                ? "bg-[#1C2028] text-[#F1F2F4] border border-[#383E4C]" 
                : "text-[#898E9E] hover:text-[#E2E4E9] hover:bg-[#1C2028]/50"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "w-4.5 h-4.5 flex-shrink-0 transition-colors",
                  isActive ? "text-[#10B981]" : "text-[#4B5262] group-hover:text-[#898E9E]"
                )} />
                {!sidebarCollapsed && (
                  <span className="text-[13px] font-medium tracking-tight whitespace-nowrap">{item.label}</span>
                )}
                
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System & Footer */}
      <div className="p-3 border-t border-[#242933] space-y-1 bg-[#15181E]">
        <button
          onClick={toggleDebug}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4B5262] hover:text-[#898E9E] hover:bg-[#1C2028]/50 transition-all group"
        >
          <Terminal className="w-4.5 h-4.5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-[11px] font-bold font-mono uppercase tracking-widest whitespace-nowrap">Debug Logs</span>}
        </button>

        {FOOTER_NAVIGATION.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
              isActive 
                ? "bg-[#1C2028] text-[#F1F2F4]" 
                : "text-[#898E9E] hover:text-[#E2E4E9] hover:bg-[#1C2028]/50"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "w-4.5 h-4.5 flex-shrink-0 transition-colors",
                  isActive ? "text-[#10B981]" : "text-[#4B5262] group-hover:text-[#898E9E]"
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
        className="absolute bottom-10 -right-0 w-6 h-12 bg-[#1C2028] hover:bg-[#242933] border-y border-l border-[#383E4C] flex items-center justify-center text-[#4B5262] hover:text-[#10B981] transition-all rounded-l-lg z-50 overflow-hidden"
      >
        {sidebarCollapsed ? <ChevronRight size={12} strokeWidth={3} /> : <ChevronLeft size={12} strokeWidth={3} />}
      </button>
    </motion.div>
  );
}
