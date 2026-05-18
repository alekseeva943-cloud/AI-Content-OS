import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  activeModule: string;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveModule: (moduleId: string) => void;
}

export const useAppStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeModule: 'planner',
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setActiveModule: (activeModule) => set({ activeModule }),
}));
