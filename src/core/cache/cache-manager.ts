import { logger } from "@/core/logger/logger";
import type { SharedCache } from "./cache.interface";
import { getSharedCache } from "./shared-cache";

export class CacheManager {
  private cache: SharedCache;

  constructor(sharedCache?: SharedCache) {
    this.cache = sharedCache ?? getSharedCache();
    logger.info("Cache manager initialized");
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, options?: { ttl?: number; tags?: string[] }): Promise<void> {
    await this.cache.set(key, value, options);
  }

  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
  }

  async clear(): Promise<void> {
    await this.cache.clear();
  }

  async invalidateByTag(tag: string): Promise<void> {
    await this.cache.invalidateByTag(tag);
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  getStats() {
    return this.cache.getStats();
  }
}
