import type { NavigationCacheConfig } from "./navigation.types";
import type { SharedCache } from "@/core/cache/cache.interface";
import { getSharedCache } from "@/core/cache/shared-cache";

const REGISTRY_PREFIX = "nav:registry:";
const MENU_PREFIX = "nav:menu:";
const ROUTE_PREFIX = "nav:route:";

class NavigationCache {
  private shared: SharedCache;
  private config: NavigationCacheConfig;

  constructor(sharedCache?: SharedCache, config?: Partial<NavigationCacheConfig>) {
    this.shared = sharedCache ?? getSharedCache();
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

  async getRegistry<T>(key: string): Promise<T | undefined> {
    return this.shared.get<T>(`${REGISTRY_PREFIX}${key}`);
  }

  async setRegistry<T>(key: string, value: T, tags?: string[]): Promise<void> {
    await this.shared.set(`${REGISTRY_PREFIX}${key}`, value, {
      ttl: this.config.registryTTL,
      tags: tags ?? [],
    });
  }

  async getMenu<T>(key: string): Promise<T | undefined> {
    return this.shared.get<T>(`${MENU_PREFIX}${key}`);
  }

  async setMenu<T>(key: string, value: T, tags?: string[]): Promise<void> {
    await this.shared.set(`${MENU_PREFIX}${key}`, value, {
      ttl: this.config.menuTTL,
      tags: tags ?? [],
    });
  }

  async getRoute<T>(key: string): Promise<T | undefined> {
    return this.shared.get<T>(`${ROUTE_PREFIX}${key}`);
  }

  async setRoute<T>(key: string, value: T, tags?: string[]): Promise<void> {
    await this.shared.set(`${ROUTE_PREFIX}${key}`, value, {
      ttl: this.config.routeTTL,
      tags: tags ?? [],
    });
  }

  async invalidateByTag(tag: string): Promise<void> {
    await this.shared.invalidateByTag(tag);
  }

  async invalidateKey(key: string): Promise<void> {
    await Promise.all([
      this.shared.delete(`${REGISTRY_PREFIX}${key}`),
      this.shared.delete(`${MENU_PREFIX}${key}`),
      this.shared.delete(`${ROUTE_PREFIX}${key}`),
    ]);
  }

  async invalidateAll(): Promise<void> {
    await this.shared.invalidateAll();
  }

  getStats() {
    return this.shared.getStats();
  }

  getConfig(): NavigationCacheConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<NavigationCacheConfig>): void {
    this.config = { ...this.config, ...config };
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
