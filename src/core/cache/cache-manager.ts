import { logger } from "@/core/logger/logger";
import type { Cache, CacheTTL } from "./cache.types";
import { InMemoryCache } from "./memory-cache";
import type { RedisCache } from "./redis-cache";

export type CacheProvider = "memory" | "redis";

export interface CacheManagerConfig {
  provider: CacheProvider;
  redisClient?: RedisCache;
}

export class CacheManager {
  private cache: Cache;

  constructor(config: CacheManagerConfig) {
    if (config.provider === "redis" && config.redisClient) {
      this.cache = config.redisClient;
      logger.info("Cache manager initialized with redis provider");
    } else {
      this.cache = new InMemoryCache();
      logger.info("Cache manager initialized with memory provider");
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlMs?: CacheTTL): Promise<void> {
    await this.cache.set(key, value, ttlMs);
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

  getMemoryStats(): { size: number; hits: number; misses: number } | undefined {
    if (this.cache instanceof InMemoryCache) {
      return this.cache.getStats();
    }
    return undefined;
  }
}