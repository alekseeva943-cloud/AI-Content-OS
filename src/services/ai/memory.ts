// File: src/services/ai/memory.ts

import { AIConsolvedAsset } from "@/src/types/ai";

const MEMORY_STORAGE_KEY = "ai_memory";

const MAX_MEMORY_ITEMS = 100;

const MAX_CONTEXT_RESULTS = 5;

const MEMORY_EXPIRATION_DAYS = 30;

type MemoryType =
  | "plan"
  | "post"
  | "campaign"
  | "insight"
  | "brand";

export interface MemoryAsset
  extends AIConsolvedAsset {

  memoryType?: MemoryType;

  summary?: string;
}

export class AIMemory {

  private static instance: AIMemory;

  private assets: MemoryAsset[] = [];

  private constructor() {

    this.load();

    this.cleanup();
  }

  static getInstance(): AIMemory {

    if (!AIMemory.instance) {

      AIMemory.instance =
        new AIMemory();
    }

    return AIMemory.instance;
  }

  private load() {

    try {

      const saved =
        localStorage.getItem(
          MEMORY_STORAGE_KEY
        );

      if (!saved) return;

      this.assets =
        JSON.parse(saved);

    } catch (error) {

      console.error(
        "[AIMemory] Failed to load memory",
        error
      );

      this.assets = [];
    }
  }

  private persist() {

    try {

      localStorage.setItem(
        MEMORY_STORAGE_KEY,
        JSON.stringify(this.assets)
      );

    } catch (error) {

      console.error(
        "[AIMemory] Persist failed",
        error
      );
    }
  }

  private cleanup() {

    const now = Date.now();

    const expirationMs =
      MEMORY_EXPIRATION_DAYS *
      24 *
      60 *
      60 *
      1000;

    this.assets =
      this.assets
        .filter(asset => {

          return (
            now - asset.timestamp <
            expirationMs
          );
        })

        .slice(-MAX_MEMORY_ITEMS);

    this.persist();
  }

  private deduplicate() {

    const seen = new Set<string>();

    this.assets =
      this.assets.filter(asset => {

        const fingerprint =
          JSON.stringify(asset.content);

        if (
          seen.has(fingerprint)
        ) {
          return false;
        }

        seen.add(fingerprint);

        return true;
      });
  }

  saveAsset(
    asset: Omit<
      MemoryAsset,
      "id" | "timestamp"
    >
  ) {

    const newAsset: MemoryAsset = {

      ...asset,

      id: crypto.randomUUID(),

      timestamp: Date.now(),

      summary:
        asset.summary ||
        this.createSummary(
          asset.content
        )
    };

    this.assets.push(newAsset);

    this.deduplicate();

    this.cleanup();

    this.persist();

    console.log(
      "[AIMemory] Asset saved",
      {
        moduleId:
          asset.moduleId,

        type:
          asset.memoryType
      }
    );

    return newAsset;
  }

  private createSummary(
    content: any
  ): string {

    try {

      const text =
        typeof content === "string"
          ? content
          : JSON.stringify(content);

      return text
        .slice(0, 200);

    } catch {

      return "";
    }
  }

  getAssetsByModule(
    moduleId: string
  ) {

    return this.assets.filter(
      asset =>
        asset.moduleId ===
        moduleId
    );
  }

  getRelevantContext(
    query: string
  ): string[] {

    const normalized =
      query.toLowerCase();

    const scored =
      this.assets.map(asset => {

        let score = 0;

        const content =
          JSON.stringify(
            asset.content
          ).toLowerCase();

        const summary =
          (
            asset.summary || ""
          ).toLowerCase();

        // tag relevance
        asset.tags?.forEach(tag => {

          if (
            normalized.includes(
              tag.toLowerCase()
            )
          ) {
            score += 5;
          }
        });

        // content relevance
        if (
          content.includes(
            normalized
          )
        ) {
          score += 10;
        }

        // summary relevance
        if (
          summary.includes(
            normalized
          )
        ) {
          score += 7;
        }

        // recency bonus
        const ageHours =
          (
            Date.now() -
            asset.timestamp
          ) /
          (1000 * 60 * 60);

        score += Math.max(
          0,
          24 - ageHours
        );

        return {
          asset,
          score
        };
      });

    return scored

      .sort(
        (a, b) =>
          b.score - a.score
      )

      .slice(
        0,
        MAX_CONTEXT_RESULTS
      )

      .map(result => {

        return result.asset.summary ||
          JSON.stringify(
            result.asset.content
          );
      });
  }

  clearMemory() {

    this.assets = [];

    this.persist();

    console.log(
      "[AIMemory] Cleared"
    );
  }

  getStats() {

    return {

      total:
        this.assets.length,

      byModule:
        this.assets.reduce(
          (acc, asset) => {

            acc[
              asset.moduleId
            ] =
              (
                acc[
                  asset.moduleId
                ] || 0
              ) + 1;

            return acc;

          },
          {} as Record<
            string,
            number
          >
        )
    };
  }
}

export const aiMemory =
  AIMemory.getInstance();

