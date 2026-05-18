import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  openaiKey: string;
  heygenKey: string;
  elevenlabsKey: string;
  isDarkMode: boolean;
  setOpenAIKey: (key: string) => void;
  setHeygenKey: (key: string) => void;
  setElevenlabsKey: (key: string) => void;
  toggleDarkMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openaiKey: '',
      heygenKey: '',
      elevenlabsKey: '',
      isDarkMode: false,
      setOpenAIKey: (openaiKey) => set({ openaiKey }),
      setHeygenKey: (heygenKey) => set({ heygenKey }),
      setElevenlabsKey: (elevenlabsKey) => set({ elevenlabsKey }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
