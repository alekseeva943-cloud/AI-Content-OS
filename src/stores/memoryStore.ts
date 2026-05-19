import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlannerResult } from '@/src/types/planner';

interface MemoryItem {
  id: string;
  type: 'planner' | 'longread' | 'newsletter' | 'podcast' | 'avatars';
  timestamp: number;
  data: any;
  metadata: {
    topic: string;
    period?: string;
    channels?: string[];
  };
}

interface MemoryStore {
  history: MemoryItem[];
  sharedMemory: string[]; // Key insights or context bits shared across components
  addGeneration: (item: Omit<MemoryItem, 'id' | 'timestamp'>) => void;
  addToSharedMemory: (fact: string) => void;
  clearHistory: () => void;
}

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set) => ({
      history: [],
      sharedMemory: [],
      addGeneration: (item) => set((state) => ({
        history: [
          {
            ...item,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          },
          ...state.history,
        ].slice(0, 50), // Keep last 50
      })),
      addToSharedMemory: (fact) => set((state) => ({
        sharedMemory: [...state.sharedMemory, fact].slice(-20),
      })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'ai-content-os-memory',
    }
  )
);
