import type { SEOCanonicalInput, SEOCanonicalResult } from "./seo.types";
import { getSEOCache } from "./seo-cache";

export class CanonicalRuntime {
  private defaultBaseUrl: string;

  constructor(baseUrl?: string) {
    this.defaultBaseUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://tamerstudio.com";
  }

  async resolve(input: SEOCanonicalInput): Promise<SEOCanonicalResult> {
    const cache = getSEOCache();
    const cacheKey = cache.buildKey(["canonical", input.route, input.locale ?? "en"]);

    const cached = await cache.get<SEOCanonicalResult>(cacheKey);
    if (cached) return cached;

    const base = input.baseUrl || this.defaultBaseUrl;
    const locale = input.locale;
    const route = this.normalizeRoute(input.route);

    let canonical: string;
    if (locale && locale !== "en") {
      canonical = `${base}/${locale}${route}`;
    } else {
      canonical = `${base}${route}`;
    }

    const result: SEOCanonicalResult = {
      canonical: this.stripTrailingSlash(canonical),
      isAlternate: !!locale && locale !== "en",
      alternates: [],
    };

    await cache.set(cacheKey, result, { tags: ["canonical", locale ?? "en"] });
    return result;
  }

  async resolveWithAlternates(
    input: SEOCanonicalInput,
    locales: string[],
    defaultLocale?: string
  ): Promise<SEOCanonicalResult> {
    const base = input.baseUrl || this.defaultBaseUrl;
    const def = defaultLocale || "en";
    const route = this.normalizeRoute(input.route);

    const canonical = await this.resolve({ ...input, locale: def });

    const alternates = locales.map((locale) => {
      const href = locale === def
        ? `${this.stripTrailingSlash(base)}${route}`
        : `${this.stripTrailingSlash(base)}/${locale}${route}`;
      return { hreflang: locale, href: this.stripTrailingSlash(href) };
    });

    alternates.push({
      hreflang: "x-default",
      href: `${this.stripTrailingSlash(base)}${route}`,
    });

    return {
      ...canonical,
      alternates,
    };
  }

  validateCanonical(canonical: string, baseUrl?: string): boolean {
    try {
      const url = new URL(canonical);
      const base = baseUrl || this.defaultBaseUrl;
      const baseHost = new URL(base).host;
      return url.host === baseHost;
    } catch {
      return false;
    }
  }

  stripTrailingSlash(url: string): string {
    return url.endsWith("/") && url !== `${this.defaultBaseUrl}/` ? url.slice(0, -1) : url;
  }

  private normalizeRoute(route: string): string {
    if (!route) return "/";
    if (!route.startsWith("/")) return `/${route}`;
    return route;
  }

  getDefaultBaseUrl(): string {
    return this.defaultBaseUrl;
  }
}

let canonicalRuntimeInstance: CanonicalRuntime | null = null;

export function getCanonicalRuntime(): CanonicalRuntime {
  if (!canonicalRuntimeInstance) {
    canonicalRuntimeInstance = new CanonicalRuntime();
  }
  return canonicalRuntimeInstance;
}

export function resetCanonicalRuntime(): void {
  canonicalRuntimeInstance = null;
}
