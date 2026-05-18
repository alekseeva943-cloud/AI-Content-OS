import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, LogOut, Terminal } from 'lucide-react';
import { NAVIGATION_CONFIG, FOOTER_NAVIGATION } from '@/src/config/navigation';
import { useAppStore } from '@/src/stores/useAppStore';
import { useDebugStore } from '@/src/stores/useDebugStore';
import { cn } from '@/src/shared/utils/cn';

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { toggleDebug } = useDebugStore();

  return (
    <motion.div
      animate={{ width: sidebarCollapsed ? 80 : 260 }}
      className="h-full bg-[#0B0F14]/80 backdrop-blur-3xl border-r border-white/5 flex flex-col relative z-50 overflow-hidden"
    >
      {/* Logo */}
      <div className="p-6 mb-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <div className="w-4 h-4 border-2 border-white/90 rounded-full" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold text-white tracking-tight whitespace-nowrap"
            >
              AI Content OS
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        {NAVIGATION_CONFIG.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
              isActive 
                ? "bg-white/10 text-white" 
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
            )}
            
            {/* Active Indicator */}
            <NavLink
              to={item.path}
              className={({ isActive }) => cn(
                "absolute left-0 w-1 h-4 bg-emerald-500 rounded-r-full transition-opacity duration-200 opacity-0",
                isActive && "opacity-100"
              )}
            />
          </NavLink>
        ))}
      </nav>

      {/* Footer Nav */}
      <div className="p-4 border-t border-white/5 space-y-1">
        <button
          onClick={toggleDebug}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all group"
        >
          <Terminal className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-sm font-medium">Debug Panel</span>}
        </button>

        {FOOTER_NAVIGATION.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
              isActive 
                ? "bg-white/10 text-white" 
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute bottom-6 -right-3 w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-emerald-500 transition-colors z-50"
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.div>
  );
}
