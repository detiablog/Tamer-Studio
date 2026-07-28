import type { SharedCache, CacheStats } from "./cache.interface";

interface CacheEntry {
  value: unknown;
  expiresAt: number;
  tags: string[];
  createdAt: number;
  lastAccessedAt: number;
}

export class MemoryCache implements SharedCache {
  private cache = new Map<string, CacheEntry>();
  private tagIndex = new Map<string, Set<string>>();
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private readonly maxSize: number;
  private readonly defaultTtl: number;

  constructor(options?: { maxSize?: number; defaultTtl?: number; cleanupIntervalMs?: number }) {
    this.maxSize = options?.maxSize ?? 1000;
    this.defaultTtl = options?.defaultTtl ?? 60_000;

    const interval = options?.cleanupIntervalMs ?? 60_000;
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), interval);
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    if (entry.expiresAt > 0 && entry.expiresAt < Date.now()) {
      this.deleteEntry(key);
      this.misses++;
      return undefined;
    }
    entry.lastAccessedAt = Date.now();
    this.hits++;
    return entry.value as T;
  }

  async set<T>(key: string, value: T, options?: { ttl?: number; tags?: string[] }): Promise<void> {
    if (this.cache.has(key)) {
      this.deleteEntry(key);
    }

    this.evictIfFull();

    const ttl = options?.ttl ?? this.defaultTtl;
    const entry: CacheEntry = {
      value,
      expiresAt: ttl > 0 ? Date.now() + ttl : 0,
      tags: options?.tags ?? [],
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    };

    this.cache.set(key, entry);
    this.addToTagIndex(key, entry.tags);
  }

  async delete(key: string): Promise<void> {
    this.deleteEntry(key);
  }

  async invalidateByTag(tag: string): Promise<void> {
    const keys = this.tagIndex.get(tag);
    if (!keys) return;
    for (const key of keys) {
      this.deleteEntry(key);
    }
    this.tagIndex.delete(tag);
  }

  async invalidateAll(): Promise<void> {
    this.cache.clear();
    this.tagIndex.clear();
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.expiresAt > 0 && entry.expiresAt < Date.now()) {
      this.deleteEntry(key);
      return false;
    }
    return true;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.tagIndex.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  getStats(): CacheStats {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      tags: this.tagIndex.size,
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  private deleteEntry(key: string): void {
    const entry = this.cache.get(key);
    if (!entry) return;
    this.removeFromTagIndex(key, entry.tags);
    this.cache.delete(key);
  }

  private addToTagIndex(key: string, tags: string[]): void {
    for (const tag of tags) {
      let set = this.tagIndex.get(tag);
      if (!set) {
        set = new Set();
        this.tagIndex.set(tag, set);
      }
      set.add(key);
    }
  }

  private removeFromTagIndex(key: string, tags: string[]): void {
    for (const tag of tags) {
      const set = this.tagIndex.get(tag);
      if (set) {
        set.delete(key);
        if (set.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }
  }

  private evictIfFull(): void {
    while (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessedAt < lruTime) {
        lruTime = entry.lastAccessedAt;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.deleteEntry(lruKey);
      this.evictions++;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (entry.expiresAt > 0 && entry.expiresAt < now) {
        this.deleteEntry(key);
      }
    }
  }
}
