import type { NavigationCacheConfig, NavigationCacheEntry } from "./navigation.types";

class NavigationCache {
  private registryCache: Map<string, NavigationCacheEntry<unknown>> = new Map();
  private menuCache: Map<string, NavigationCacheEntry<unknown>> = new Map();
  private routeCache: Map<string, NavigationCacheEntry<unknown>> = new Map();
  private config: NavigationCacheConfig;
  private tagsIndex: Map<string, Set<string>> = new Map();

  constructor(config?: Partial<NavigationCacheConfig>) {
    this.config = {
      registryTTL: 300000,
      menuTTL: 120000,
      routeTTL: 60000,
      breadcrumbTTL: 60000,
      maxSize: 1000,
      enableInvalidation: true,
      ...config,
    };
  }

  getRegistry<T>(key: string): T | undefined {
    const entry = this.registryCache.get(key);
    if (!entry) return undefined;
    if (this.isExpired(entry)) {
      this.registryCache.delete(key);
      this.removeTagIndex(key);
      return undefined;
    }
    return entry.value as T;
  }

  setRegistry<T>(key: string, value: T, tags?: string[]): void {
    this.evictIfNecessary();
    this.registryCache.set(key, this.createEntry(value, tags));
    this.addTagIndex(key, tags);
  }

  getMenu<T>(key: string): T | undefined {
    const entry = this.menuCache.get(key);
    if (!entry) return undefined;
    if (this.isExpired(entry)) {
      this.menuCache.delete(key);
      this.removeTagIndex(key);
      return undefined;
    }
    return entry.value as T;
  }

  setMenu<T>(key: string, value: T, tags?: string[]): void {
    this.evictIfNecessary();
    this.menuCache.set(key, this.createEntry(value, tags));
    this.addTagIndex(key, tags);
  }

  getRoute<T>(key: string): T | undefined {
    const entry = this.routeCache.get(key);
    if (!entry) return undefined;
    if (this.isExpired(entry)) {
      this.routeCache.delete(key);
      this.removeTagIndex(key);
      return undefined;
    }
    return entry.value as T;
  }

  setRoute<T>(key: string, value: T, tags?: string[]): void {
    this.evictIfNecessary();
    this.routeCache.set(key, this.createEntry(value, tags));
    this.addTagIndex(key, tags);
  }

  invalidateByTag(tag: string): void {
    const keys = this.tagsIndex.get(tag);
    if (!keys) return;
    for (const key of keys) {
      this.registryCache.delete(key);
      this.menuCache.delete(key);
      this.routeCache.delete(key);
    }
    this.tagsIndex.delete(tag);
  }

  invalidateKey(key: string): void {
    this.registryCache.delete(key);
    this.menuCache.delete(key);
    this.routeCache.delete(key);
    this.removeTagIndex(key);
  }

  invalidateAll(): void {
    this.registryCache.clear();
    this.menuCache.clear();
    this.routeCache.clear();
    this.tagsIndex.clear();
  }

  getStats(): {
    registrySize: number;
    menuSize: number;
    routeSize: number;
    totalSize: number;
    maxSize: number;
  } {
    return {
      registrySize: this.registryCache.size,
      menuSize: this.menuCache.size,
      routeSize: this.routeCache.size,
      totalSize: this.registryCache.size + this.menuCache.size + this.routeCache.size,
      maxSize: this.config.maxSize,
    };
  }

  getConfig(): NavigationCacheConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<NavigationCacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private createEntry<T>(value: T, tags?: string[]): NavigationCacheEntry<T> {
    return {
      value,
      expiresAt: Date.now() + this.config.registryTTL,
      tags: tags ?? [],
      createdAt: Date.now(),
    };
  }

  private isExpired<T>(entry: NavigationCacheEntry<T>): boolean {
    return Date.now() > entry.expiresAt;
  }

  private evictIfNecessary(): void {
    const totalSize =
      this.registryCache.size + this.menuCache.size + this.routeCache.size;
    if (totalSize >= this.config.maxSize) {
      const now = Date.now();
      this.evictExpired();
      if (
        this.registryCache.size + this.menuCache.size + this.routeCache.size >=
        this.config.maxSize
      ) {
        const oldestKey = this.findOldestEntry();
        if (oldestKey) {
          this.registryCache.delete(oldestKey);
          this.menuCache.delete(oldestKey);
          this.routeCache.delete(oldestKey);
          this.removeTagIndex(oldestKey);
        }
      }
    }
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.registryCache) {
      if (now > entry.expiresAt) {
        this.registryCache.delete(key);
        this.removeTagIndex(key);
      }
    }
    for (const [key, entry] of this.menuCache) {
      if (now > entry.expiresAt) {
        this.menuCache.delete(key);
        this.removeTagIndex(key);
      }
    }
    for (const [key, entry] of this.routeCache) {
      if (now > entry.expiresAt) {
        this.routeCache.delete(key);
        this.removeTagIndex(key);
      }
    }
  }

  private findOldestEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const [key, entry] of this.registryCache) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }
    for (const [key, entry] of this.menuCache) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }
    for (const [key, entry] of this.routeCache) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }
    return oldestKey;
  }

  private addTagIndex(key: string, tags?: string[]): void {
    if (!tags) return;
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

let navigationCacheInstance: NavigationCache | null = null;

export function getNavigationCache(): NavigationCache {
  if (!navigationCacheInstance) {
    navigationCacheInstance = new NavigationCache();
  }
  return navigationCacheInstance;
}

export function resetNavigationCache(): void {
  navigationCacheInstance = null;
}

export { NavigationCache };