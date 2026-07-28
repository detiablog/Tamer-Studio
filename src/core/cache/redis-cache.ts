import { Redis } from "@upstash/redis";
import type { SharedCache, CacheStats } from "./cache.interface";
import { MemoryCache } from "./memory-cache";

const TAG_PREFIX = "cache:tag:";
const VALUE_PREFIX = "cache:value:";
const META_PREFIX = "cache:meta:";

interface CacheMetadata {
  tags: string[];
  createdAt: number;
}

export class RedisCache implements SharedCache {
  private client: Redis;
  private fallback: MemoryCache;
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private connected = false;
  private readonly defaultTtl: number;

  constructor(options?: {
    url?: string;
    token?: string;
    defaultTtl?: number;
    fallbackMaxSize?: number;
  }) {
    this.defaultTtl = options?.defaultTtl ?? 60_000;

    this.client = new Redis({
      url: options?.url ?? process.env.UPSTASH_REDIS_REST_URL ?? "",
      token: options?.token ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    });

    this.fallback = new MemoryCache({
      maxSize: options?.fallbackMaxSize ?? 1000,
      defaultTtl: this.defaultTtl,
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const raw = await this.client.get<string>(`${VALUE_PREFIX}${key}`);
      if (raw === null || raw === undefined) {
        this.misses++;
        return undefined;
      }
      this.hits++;
      return typeof raw === "string" ? (JSON.parse(raw) as T) : (raw as T);
    } catch {
      return this.fallback.get<T>(key);
    }
  }

  async set<T>(key: string, value: T, options?: { ttl?: number; tags?: string[] }): Promise<void> {
    const ttl = options?.ttl ?? this.defaultTtl;
    const tags = options?.tags ?? [];
    const ttlSeconds = Math.ceil(ttl / 1000);

    try {
      const serialized = JSON.stringify(value);

      await this.client.set(`${VALUE_PREFIX}${key}`, serialized, { ex: ttlSeconds });

      const meta: CacheMetadata = { tags, createdAt: Date.now() };
      await this.client.set(`${META_PREFIX}${key}`, JSON.stringify(meta), { ex: ttlSeconds });

      if (tags.length > 0) {
        const pipeline = this.client.pipeline();
        for (const tag of tags) {
          pipeline.sadd(`${TAG_PREFIX}${tag}`, key);
          pipeline.expire(`${TAG_PREFIX}${tag}`, ttlSeconds);
        }
        await pipeline.exec();
      }
    } catch {
      await this.fallback.set(key, value, { ttl, tags });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const metaRaw = await this.client.get<string>(`${META_PREFIX}${key}`);
      if (metaRaw) {
        const meta: CacheMetadata = typeof metaRaw === "string" ? JSON.parse(metaRaw) : metaRaw;
        for (const tag of meta.tags) {
          await this.client.srem(`${TAG_PREFIX}${tag}`, key);
        }
      }

      await this.client.del(`${VALUE_PREFIX}${key}`, `${META_PREFIX}${key}`);
    } catch {
      await this.fallback.delete(key);
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      const keys = await this.client.smembers(`${TAG_PREFIX}${tag}`);
      if (keys && keys.length > 0) {
        const pipeline = this.client.pipeline();
        for (const key of keys) {
          pipeline.del(`${VALUE_PREFIX}${key}`, `${META_PREFIX}${key}`);
        }
        pipeline.del(`${TAG_PREFIX}${tag}`);
        await pipeline.exec();
      }
    } catch {
      await this.fallback.invalidateByTag(tag);
    }
  }

  async invalidateAll(): Promise<void> {
    try {
      const valueKeys = await this.client.keys(`${VALUE_PREFIX}*`);
      const metaKeys = await this.client.keys(`${META_PREFIX}*`);
      const tagKeys = await this.client.keys(`${TAG_PREFIX}*`);

      const allKeys = [...valueKeys, ...metaKeys, ...tagKeys];
      if (allKeys.length > 0) {
        const pipeline = this.client.pipeline();
        for (const key of allKeys) {
          pipeline.del(key);
        }
        await pipeline.exec();
      }
    } catch {
      await this.fallback.invalidateAll();
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const exists = await this.client.exists(`${VALUE_PREFIX}${key}`);
      if (exists === 1) {
        this.hits++;
        return true;
      }
      this.misses++;
      return false;
    } catch {
      return this.fallback.has(key);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.invalidateAll();
    } catch {
      await this.fallback.clear();
    }
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  getStats(): CacheStats {
    return {
      size: 0,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      tags: 0,
    };
  }

  getFallbackStats(): CacheStats {
    return this.fallback.getStats();
  }
}
