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
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
      className="h-full bg-[#0D0F12] border-r border-[#242933] flex flex-col relative z-50 overflow-hidden"
    >
      {/* Brand area */}
      <Link to="/" className="h-20 px-6 flex items-center gap-4 group/logo transition-colors hover:bg-white/[0.02]">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex-shrink-0 flex items-center justify-center shadow-lg shadow-[#10B981]/10 relative">
          <Sparkles className="w-5 h-5 text-[#0D0F12] relative z-10" />
          <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover/logo:opacity-100 transition-opacity" />
        </div>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col whitespace-nowrap"
          >
            <span className="font-bold text-[#F1F2F4] text-[16px] font-display tracking-tight">Studio AI</span>
            <span className="text-[10px] text-[#10B981] font-bold tracking-[0.1em] uppercase opacity-60">Creative OS</span>
          </motion.div>
        )}
      </Link>

      {/* Tools area */}
      <nav className="flex-1 px-3 py-8 space-y-2 overflow-y-auto no-scrollbar">
        {!sidebarCollapsed && (
          <div className="px-4 mb-4 text-[10px] font-bold text-[#4B5262] uppercase tracking-[0.2em]">Инструменты</div>
        )}
        {NAVIGATION_CONFIG.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative",
              isActive 
                ? "bg-[#1C2028] text-[#10B981] border border-[#383E4C] shadow-sm" 
                : "text-[#898E9E] hover:text-[#E2E4E9] hover:bg-white/[0.03]"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-all",
                  isActive ? "text-[#10B981] scale-110" : "text-[#4B5262] group-hover:text-[#898E9E]"
                )} />
                {!sidebarCollapsed && (
                  <span className="text-[14px] font-semibold tracking-tight whitespace-nowrap">{item.label}</span>
                )}
                
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-[-12px] w-1 h-6 bg-[#10B981] rounded-r-full shadow-[0_0_12px_rgba(16,185,129,0.5)]" 
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer area */}
      <div className="p-3 border-t border-[#242933] space-y-1 bg-[#0D0F12]">
        {FOOTER_NAVIGATION.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
              isActive 
                ? "bg-[#1C2028] text-[#F1F2F4]" 
                : "text-[#898E9E] hover:text-[#E2E4E9] hover:bg-white/[0.03]"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  isActive ? "text-[#10B981]" : "text-[#4B5262] group-hover:text-[#898E9E]"
                )} />
                {!sidebarCollapsed && <span className="text-[14px] font-semibold whitespace-nowrap">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute bottom-10 -right-0 w-6 h-12 bg-[#1C2028] border-y border-l border-[#383E4C] flex items-center justify-center text-[#4B5262] hover:text-[#10B981] transition-all rounded-l-lg z-50 overflow-hidden"
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.div>
  );
}
