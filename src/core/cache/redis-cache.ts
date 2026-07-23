import { logger as _logger } from "@/core/logger/logger";
import type { CacheTTL } from "./cache.types";

interface RedisLike {
  connect(): Promise<void>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<string | null>;
  del(...keys: string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  exists(key: string): Promise<number>;
  disconnect(): Promise<void>;
}

export class RedisCache {
  private client: RedisLike;
  private connected = false;

  constructor(client: RedisLike) {
    this.client = client;
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.disconnect();
      this.connected = false;
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.client.get(key);
    if (value === null) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttlMs?: CacheTTL): Promise<void> {
    const serialized = JSON.stringify(value);
    const options = ttlMs ? { EX: Math.floor(ttlMs / 1000) } : undefined;
    await this.client.set(key, serialized, options);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async clear(): Promise<void> {
    const keys = await this.client.keys("*");
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    const keys = await this.client.keys(`tag:${tag}:*`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async has(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }
}