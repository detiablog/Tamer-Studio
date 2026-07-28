export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  evictions: number;
  tags: number;
}

export interface SharedCache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, options?: { ttl?: number; tags?: string[] }): Promise<void>;
  delete(key: string): Promise<void>;
  invalidateByTag(tag: string): Promise<void>;
  invalidateAll(): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getStats(): CacheStats;
}
