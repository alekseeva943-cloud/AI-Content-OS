import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BrandVariables {
  companyName: string;
  authorName: string;
  website: string;
  telegram: string;
  brandVoice: string;
  targetAudience: string;
  productName: string;
  defaultCTA: string;
}

interface BrandStore {
  variables: BrandVariables;
  updateVariable: (key: keyof BrandVariables, value: string) => void;
  updateAll: (variables: Partial<BrandVariables>) => void;
}

export const useBrandStore = create<BrandStore>()(
  persist(
    (set) => ({
      variables: {
        companyName: '',
        authorName: '',
        website: '',
        telegram: '',
        brandVoice: 'Professional & Helpful',
        targetAudience: 'Entrepreneurs and Digital Creators',
        productName: '',
        defaultCTA: 'Узнать больше'
      },
      updateVariable: (key, value) => set((state) => ({
        variables: { ...state.variables, [key]: value }
      })),
      updateAll: (variables) => set((state) => ({
        variables: { ...state.variables, ...variables }
      }))
    }),
    { name: 'brand-variables' }
  )
);
