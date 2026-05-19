import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ModuleState {
  formValues: Record<string, any>;
  result: any | null;
  showAdvanced: boolean;
  sourceInfo: { id?: string; module?: string; title?: string } | null;
  builderStep?: 'input' | 'variables' | 'generating' | 'result';
  requirements?: any[];
}

interface WorkspaceStore {
  modules: Record<string, ModuleState>;
  setModuleState: (moduleId: string, state: Partial<ModuleState>) => void;
  clearModule: (moduleId: string, defaultValues: Record<string, any>) => void;
  resetAll: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      modules: {},
      setModuleState: (moduleId, state) =>
        set((prev) => ({
          modules: {
            ...prev.modules,
            [moduleId]: {
              ...(prev.modules[moduleId] || {
                formValues: {},
                result: null,
                showAdvanced: false,
                sourceInfo: null,
              }),
              ...state,
            },
          },
        })),
      clearModule: (moduleId, defaultValues) =>
        set((prev) => ({
          modules: {
            ...prev.modules,
            [moduleId]: {
              formValues: defaultValues,
              result: null,
              showAdvanced: false,
              sourceInfo: null,
            },
          },
        })),
      resetAll: () => set({ modules: {} }),
    }),
    {
      name: 'ai-content-os-workspace',
    }
  )
);
