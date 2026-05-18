import { create } from 'zustand';

interface LogEntry {
  id: string;
  timestamp: number;
  type: 'request' | 'response' | 'error' | 'info';
  module: string;
  message: string;
  data?: any;
}

interface DebugState {
  logs: LogEntry[];
  isOpen: boolean;
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  toggleDebug: () => void;
}

export const useDebugStore = create<DebugState>((set) => ({
  logs: [],
  isOpen: false,
  addLog: (entry) => set((state) => ({
    logs: [
      {
        ...entry,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
      },
      ...state.logs.slice(0, 49), // Keep last 50 logs
    ],
  })),
  clearLogs: () => set({ logs: [] }),
  toggleDebug: () => set((state) => ({ isOpen: !state.isOpen })),
}));
