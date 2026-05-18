import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteItem {
  id: string;
  moduleId: string;
  type: string;
  title: string;
  content: any;
  metadata: {
    day?: string;
    channel?: string;
    time?: string;
    platform?: string;
    goal?: string;
    angle?: string;
    sourceId?: string; // ID of the item this was created from
    sourceModule?: string; // Module of the item this was created from
    [key: string]: any;
  };
  timestamp: number;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  addFavorite: (item: Omit<FavoriteItem, 'timestamp'>) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (item) => {
        const newItem: FavoriteItem = {
          ...item,
          timestamp: Date.now(),
        };
        set((state) => ({
          favorites: [newItem, ...state.favorites],
        }));
      },
      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        }));
      },
      isFavorite: (id) => {
        return get().favorites.some((f) => f.id === id);
      },
    }),
    {
      name: 'studio-ai-favorites',
    }
  )
);
