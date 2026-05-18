import { create } from 'zustand';
import { AIStatus, AIModule, AIResponse } from '@/src/types/ai';

interface AIStore {
  status: AIStatus;
  currentModule: AIModule | null;
  lastResponse: AIResponse<any> | null;
  history: Array<{
    id: string;
    module: AIModule;
    timestamp: number;
    status: AIStatus;
    result?: any;
    error?: string;
  }>;

  setStatus: (status: AIStatus) => void;
  setCurrentModule: (moduleId: AIModule | null) => void;
  setLastResponse: (response: AIResponse<any> | null) => void;
  addToHistory: (entry: Omit<AIStore['history'][0], 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

export const useAIStore = create<AIStore>((set) => ({
  status: 'idle',
  currentModule: null,
  lastResponse: null,
  history: [],

  setStatus: (status) => set({ status }),
  setCurrentModule: (currentModule) => set({ currentModule }),
  setLastResponse: (lastResponse) => set({ lastResponse }),
  
  addToHistory: (entry) => set((state) => ({
    history: [
      { ...entry, id: crypto.randomUUID(), timestamp: Date.now() },
      ...state.history
    ].slice(0, 50) // Keep last 50
  })),

  clearHistory: () => set({ history: [] })
}));
