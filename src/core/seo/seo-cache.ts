export interface SEOCacheEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
  createdAt: number;
}

export interface SEOCacheConfig {
  ttl: number;
  maxSize: number;
  enableInvalidation: boolean;
}

const DEFAULT_CACHE_CONFIG: SEOCacheConfig = {
  ttl: 60 * 1000,
  maxSize: 200,
  enableInvalidation: true,
};

export class SEOCache {
  private cache: Map<string, SEOCacheEntry<unknown>> = new Map();
  private tagsIndex: Map<string, Set<string>> = new Map();
  private config: SEOCacheConfig;

  constructor(config?: Partial<SEOCacheConfig>) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as SEOCacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.removeTagIndex(key);
      return null;
    }
    return entry.value;
  }

  set<T>(key: string, value: T, tags?: string[]): void {
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: SEOCacheEntry<T> = {
      value,
      expiresAt: Date.now() + this.config.ttl,
      tags: tags ?? [],
      createdAt: Date.now(),
    };

    this.cache.set(key, entry as SEOCacheEntry<unknown>);
    this.addTagIndex(key, entry.tags);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.removeTagIndex(key);
      return false;
    }
    return true;
  }

  invalidate(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.removeTagIndex(key);
    }
    return this.cache.delete(key);
  }

  invalidateByTag(tag: string): number {
    const keys = this.tagsIndex.get(tag);
    if (!keys) return 0;
    let count = 0;
    for (const key of keys) {
      if (this.cache.delete(key)) {
        count++;
      }
    }
    this.tagsIndex.delete(tag);
    return count;
  }

  invalidateAll(): void {
    this.cache.clear();
    this.tagsIndex.clear();
  }

  buildKey(parts: string[]): string {
    return parts.join(":");
  }

  getSize(): number {
    return this.cache.size;
  }

  cleanup(): number {
    let count = 0;
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        this.removeTagIndex(key);
        count++;
      }
    }
    return count;
  }

  getConfig(): SEOCacheConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<SEOCacheConfig>): void {
    this.config = { ...this.config, ...config };
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
      this.removeTagIndex(oldestKey);
    }
  }

  private addTagIndex(key: string, tags: string[]): void {
    for (const tag of tags) {
      const keys = this.tagsIndex.get(tag);
      if (keys) {
        keys.add(key);
      } else {
        this.tagsIndex.set(tag, new Set([key]));
      }
    }
  }

  private removeTagIndex(key: string): void {
    for (const [, keys] of this.tagsIndex) {
      keys.delete(key);
    }
  }
}

let seoCacheInstance: SEOCache | null = null;

export function getSEOCache(): SEOCache {
  if (!seoCacheInstance) {
    seoCacheInstance = new SEOCache();
  }
  return seoCacheInstance;
}

export function resetSEOCache(): void {
  seoCacheInstance = null;
}
