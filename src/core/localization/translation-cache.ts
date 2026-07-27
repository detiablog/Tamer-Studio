import { logger } from "@/core/logger/logger";

type TranslationDict = Record<string, string>;

const namespaceCache = new Map<string, TranslationDict>();
const hotReloadEnabled = process.env.NODE_ENV === "development";

export class TranslationCache {
  private namespaces: string[];
  private locale: string;
  private loadedAt = new Map<string, number>();

  constructor(namespaces: string[], locale: string) {
    this.namespaces = namespaces;
    this.locale = locale;
  }

  get(namespace: string): TranslationDict | undefined {
    if (hotReloadEnabled) {
      return undefined;
    }
    return namespaceCache.get(`${this.locale}:${namespace}`);
  }

  set(namespace: string, data: TranslationDict): void {
    namespaceCache.set(`${this.locale}:${namespace}`, data);
    this.loadedAt.set(`${this.locale}:${namespace}`, Date.now());
  }

  invalidate(namespace?: string): void {
    if (namespace) {
      namespaceCache.delete(`${this.locale}:${namespace}`);
      this.loadedAt.delete(`${this.locale}:${namespace}`);
    } else {
      for (const key of namespaceCache.keys()) {
        if (key.startsWith(`${this.locale}:`)) {
          namespaceCache.delete(key);
        }
      }
      this.loadedAt.clear();
    }
    logger.info("Translation cache invalidated", { namespace, locale: this.locale });
  }

  hotReload(namespace: string, data: TranslationDict): void {
    if (!hotReloadEnabled) return;
    namespaceCache.set(`${this.locale}:${namespace}`, data);
    this.loadedAt.set(`${this.locale}:${namespace}`, Date.now());
  }

  getStats() {
    return {
      size: namespaceCache.size,
      namespaces: this.namespaces,
      locale: this.locale,
      loadedAt: Object.fromEntries(this.loadedAt),
    };
  }
}