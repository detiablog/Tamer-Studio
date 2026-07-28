import type { SharedCache } from "./cache.interface";
import { MemoryCache } from "./memory-cache";
import { RedisCache } from "./redis-cache";

let cacheInstance: SharedCache | null = null;

export function getSharedCache(): SharedCache {
  if (cacheInstance) return cacheInstance;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  if (redisUrl) {
    cacheInstance = new RedisCache({
      url: redisUrl,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    cacheInstance = new MemoryCache();
  }

  return cacheInstance;
}

export function resetSharedCache(): void {
  cacheInstance = null;
}

export function setSharedCache(cache: SharedCache): void {
  cacheInstance = cache;
}
