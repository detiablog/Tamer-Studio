import { logger as _logger } from "@/core/logger/logger";
import type { MemoryCache } from "./cache.types";

interface EntryRecord {
  value: unknown;
  expiresAt: number;
  tags: string[];
}

export class InMemoryCache implements MemoryCache {
  private cache = new Map<string, EntryRecord>();
  private tagIndex = new Map<string, Set<string>>();
  private hits = 0;
  private misses = 0;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private maxSize = 10000) {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    if (entry.expiresAt > 0 && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      entry.tags.forEach((tag) => this.tagIndex.get(tag)?.delete(key));
      this.misses++;
      return undefined;
    }
    this.hits++;
    return entry.value as T;
  }

  async set<T>(_key: string, value: T, ttlMs?: number, tags?: string[]): Promise<void> {
    this.evictIfFull();
    const expiresAt = ttlMs ? Date.now() + ttlMs : 0;
    const entry: EntryRecord = { value, expiresAt, tags: tags ?? [] };
    this.cache.set(_key, entry);
    tags?.forEach((tag) => {
      let set = this.tagIndex.get(tag);
      if (!set) {
        set = new Set();
        this.tagIndex.set(tag, set);
      }
      set.add(_key);
    });
  }

  async delete(key: string): Promise<void> {
    const entry = this.cache.get(key);
    if (entry) {
      entry.tags.forEach((tag) => this.tagIndex.get(tag)?.delete(key));
      this.cache.delete(key);
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.tagIndex.clear();
    this.hits = 0;
    this.misses = 0;
  }

  async invalidateByTag(tag: string): Promise<void> {
    const keys = this.tagIndex.get(tag);
    if (!keys) return;
    keys.forEach((key) => {
      const entry = this.cache.get(key);
      if (entry) {
        entry.tags.forEach((t) => this.tagIndex.get(t)?.delete(key));
        this.cache.delete(key);
      }
    });
    this.tagIndex.delete(tag);
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.expiresAt > 0 && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  getStats(): { size: number; hits: number; misses: number } {
    this.cleanup();
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (entry.expiresAt > 0 && entry.expiresAt < now) {
        entry.tags.forEach((tag) => this.tagIndex.get(tag)?.delete(key));
        this.cache.delete(key);
      }
    }
  }

  private evictIfFull(): void {
    while (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        const entry = this.cache.get(oldestKey);
        entry?.tags.forEach((tag) => this.tagIndex.get(tag)?.delete(oldestKey));
      } else {
        break;
      }
    }
  }
}