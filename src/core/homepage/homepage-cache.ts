import type { HomepageCacheEntry, HomepageCacheConfig, HomepageResolutionResult } from "./homepage.types";

const DEFAULT_CACHE_CONFIG: HomepageCacheConfig = {
  ttl: 60 * 1000,
  maxSize: 50,
  enableInvalidation: true,
  tags: [],
};

export class HomepageCache {
  private cache: Map<string, HomepageCacheEntry> = new Map();
  private config: HomepageCacheConfig;

  constructor(config?: Partial<HomepageCacheConfig>) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
  }

  get(key: string): HomepageResolutionResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: HomepageResolutionResult, tags?: string[]): void {
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      key,
      data,
      expiresAt: Date.now() + this.config.ttl,
      tags: tags ?? this.config.tags,
      createdAt: Date.now(),
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  invalidateByTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  buildKey(locale: string, device: string, isPreview: boolean, previewMode?: string): string {
    const parts = [`homepage`, locale, device];
    if (isPreview) parts.push(`preview`, previewMode ?? "draft");
    return parts.join(":");
  }

  getSize(): number {
    return this.cache.size;
  }

  getEntries(): Array<{ key: string; expiresAt: number; tags: string[] }> {
    return Array.from(this.cache.values()).map((entry) => ({
      key: entry.key,
      expiresAt: entry.expiresAt,
      tags: entry.tags,
    }));
  }

  cleanup(): number {
    let count = 0;
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

let cacheInstance: HomepageCache | null = null;

export function getHomepageCache(): HomepageCache {
  if (!cacheInstance) {
    cacheInstance = new HomepageCache();
  }
  return cacheInstance;
}

export function resetHomepageCache(): void {
  cacheInstance = null;
}
