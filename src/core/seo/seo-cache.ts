import type { SharedCache } from "@/core/cache/cache.interface";
import { getSharedCache } from "@/core/cache/shared-cache";

const PREFIX = "seo:";

export interface SEOCacheConfig {
  ttl: number;
  maxSize: number;
  enableInvalidation: boolean;
}

export class SEOCache {
  private shared: SharedCache;
  private config: SEOCacheConfig;

  constructor(sharedCache?: SharedCache, config?: Partial<SEOCacheConfig>) {
    this.shared = sharedCache ?? getSharedCache();
    this.config = {
      ttl: 60 * 1000,
      maxSize: 200,
      enableInvalidation: true,
      ...config,
    };
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.shared.get<T>(`${PREFIX}${key}`);
    return result ?? null;
  }

  async set<T>(key: string, value: T, tags?: string[] | { tags?: string[] }): Promise<void> {
    const resolvedTags = Array.isArray(tags) ? tags : tags?.tags ?? [];
    await this.shared.set(`${PREFIX}${key}`, value, {
      ttl: this.config.ttl,
      tags: resolvedTags,
    });
  }

  async has(key: string): Promise<boolean> {
    return this.shared.has(`${PREFIX}${key}`);
  }

  async invalidate(key: string): Promise<boolean> {
    const exists = await this.shared.has(`${PREFIX}${key}`);
    if (exists) {
      await this.shared.delete(`${PREFIX}${key}`);
      return true;
    }
    return false;
  }

  async invalidateByTag(tag: string): Promise<number> {
    await this.shared.invalidateByTag(`${PREFIX}${tag}`);
    return 0;
  }

  async invalidateAll(): Promise<void> {
    await this.shared.invalidateAll();
  }

  buildKey(parts: string[]): string {
    return parts.join(":");
  }

  async getSize(): Promise<number> {
    return this.shared.getStats().size;
  }

  getConfig(): SEOCacheConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<SEOCacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getStats() {
    return this.shared.getStats();
  }
}

let seoCacheInstance: SEOCache | null = null;

export function getSEOCache(): SEOCache {
  if (!seoCacheInstance) {
    seoCacheInstance = new SEOCache();
  }
  return seoCacheInstance;
}

export function resetSEOCache(): void {
  seoCacheInstance = null;
}
