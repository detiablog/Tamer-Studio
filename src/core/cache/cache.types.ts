export type CacheTTL = number | undefined;

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
}

export interface CacheTags {
  tag(key: string): void;
  invalidate(key: string): void;
  invalidateAll(keys: string[]): void;
}

export interface Cache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs?: number, tags?: string[]): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  invalidateByTag(tag: string): Promise<void>;
  has(key: string): Promise<boolean>;
}

export interface MemoryCache extends Cache {
  getStats(): { size: number; hits: number; misses: number };
}

export interface RedisCache extends Cache {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}