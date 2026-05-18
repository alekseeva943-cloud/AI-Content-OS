import { AIConsolvedAsset } from '@/src/types/ai';

export class AIMemory {
  private static instance: AIMemory;
  private assets: AIConsolvedAsset[] = [];

  private constructor() {
    // In a real app, this would load from localStorage or a database
    const saved = localStorage.getItem('ai_memory');
    if (saved) {
      try {
        this.assets = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load shared memory', e);
      }
    }
  }

  static getInstance(): AIMemory {
    if (!AIMemory.instance) {
      AIMemory.instance = new AIMemory();
    }
    return AIMemory.instance;
  }

  saveAsset(asset: Omit<AIConsolvedAsset, 'id' | 'timestamp'>) {
    const newAsset: AIConsolvedAsset = {
      ...asset,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    this.assets.push(newAsset);
    this.persist();
    return newAsset;
  }

  getAssetsByModule(moduleId: string) {
    return this.assets.filter(a => a.moduleId === moduleId);
  }

  getRelevantContext(query: string): string[] {
    // Simple filter for now - later could be vector search
    return this.assets
      .filter(a => a.tags.some(t => query.toLowerCase().includes(t.toLowerCase())))
      .map(a => JSON.stringify(a.content))
      .slice(0, 3);
  }

  private persist() {
    localStorage.setItem('ai_memory', JSON.stringify(this.assets));
  }
}

export const aiMemory = AIMemory.getInstance();
