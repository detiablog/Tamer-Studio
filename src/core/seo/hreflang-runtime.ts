import type { SEOHreflangInput, SEOHreflangResult } from "./seo.types";
import { getSEOCache } from "./seo-cache";

export class HreflangRuntime {
  private baseUrl: string;
  private defaultLocale: string;
  private supportedLocales: string[];

  constructor(baseUrl?: string, defaultLocale?: string, supportedLocales?: string[]) {
    this.baseUrl = baseUrl || "https://tamer.studio";
    this.defaultLocale = defaultLocale || "en";
    this.supportedLocales = supportedLocales || ["en", "id"];
  }

  resolve(input: SEOHreflangInput): SEOHreflangResult[] {
    const cache = getSEOCache();
    const cacheKey = cache.buildKey(["hreflang", input.route, input.locales.join(",")]);

    const cached = cache.get<SEOHreflangResult[]>(cacheKey);
    if (cached) return cached;

    const base = input.baseUrl || this.baseUrl;
    const defaultLocale = input.defaultLocale || this.defaultLocale;
    const route = this.normalizeRoute(input.route);

    const results: SEOHreflangResult[] = input.locales.map((locale) => {
      const href = locale === defaultLocale
        ? `${this.stripTrailingSlash(base)}${route}`
        : `${this.stripTrailingSlash(base)}/${locale}${route}`;

      return {
        hreflang: locale,
        href: this.stripTrailingSlash(href),
        rel: "alternate" as const,
      };
    });

    results.push({
      hreflang: "x-default",
      href: `${this.stripTrailingSlash(base)}${route}`,
      rel: "alternate",
    });

    cache.set(cacheKey, results, ["hreflang"]);
    return results;
  }

  resolveForPage(route: string, baseUrl?: string): SEOHreflangResult[] {
    return this.resolve({
      route,
      locales: this.supportedLocales,
      baseUrl: baseUrl || this.baseUrl,
      defaultLocale: this.defaultLocale,
    });
  }

  resolveHreflangMap(route: string, baseUrl?: string): Record<string, string> {
    const results = this.resolveForPage(route, baseUrl);
    const map: Record<string, string> = {};
    for (const r of results) {
      map[r.hreflang] = r.href;
    }
    return map;
  }

  resolveCanonicalForLocale(route: string, locale: string, baseUrl?: string): string {
    const base = baseUrl || this.baseUrl;
    const normalizedRoute = this.normalizeRoute(route);

    if (locale === this.defaultLocale) {
      return `${this.stripTrailingSlash(base)}${normalizedRoute}`;
    }

    return `${this.stripTrailingSlash(base)}/${locale}${normalizedRoute}`;
  }

  validateHreflang(hreflang: string): boolean {
    const validPatterns = [
      /^[a-z]{2}$/,
      /^[a-z]{2}-[A-Z]{2}$/,
      /^x-default$/,
    ];
    return validPatterns.some((pattern) => pattern.test(hreflang));
  }

  validateHreflangSet(hreflangResults: SEOHreflangResult[]): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    const hreflangs = hreflangResults.map((r) => r.hreflang);

    if (!hreflangs.includes("x-default")) {
      issues.push("Missing x-default hreflang");
    }

    const locales = hreflangs.filter((h) => h !== "x-default");
    for (const locale of locales) {
      if (!this.validateHreflang(locale)) {
        issues.push(`Invalid hreflang value: ${locale}`);
      }
    }

    const hrefs = hreflangResults.map((r) => r.href);
    const uniqueHrefs = new Set(hrefs);
    if (uniqueHrefs.size !== hrefs.length) {
      issues.push("Duplicate href values found");
    }

    return { valid: issues.length === 0, issues };
  }

  private normalizeRoute(route: string): string {
    if (!route) return "/";
    if (!route.startsWith("/")) return `/${route}`;
    return route;
  }

  private stripTrailingSlash(url: string): string {
    return url.endsWith("/") && url !== `${this.baseUrl}/` ? url.slice(0, -1) : url;
  }

  getSupportedLocales(): string[] {
    return [...this.supportedLocales];
  }

  getDefaultLocale(): string {
    return this.defaultLocale;
  }
}

let hreflangRuntimeInstance: HreflangRuntime | null = null;

export function getHreflangRuntime(): HreflangRuntime {
  if (!hreflangRuntimeInstance) {
    hreflangRuntimeInstance = new HreflangRuntime();
  }
  return hreflangRuntimeInstance;
}

export function resetHreflangRuntime(): void {
  hreflangRuntimeInstance = null;
}
