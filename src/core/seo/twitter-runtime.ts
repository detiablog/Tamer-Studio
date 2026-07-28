import type { SEOTwitterInput, SEOTwitterResult } from "./seo.types";
import { getSEOCache } from "./seo-cache";

export class TwitterRuntime {
  private defaultSite: string;
  private defaultCreator: string;

  constructor(site?: string, creator?: string) {
    this.defaultSite = site || "@tamerstudio";
    this.defaultCreator = creator || "@tamerstudio";
  }

  resolve(input: SEOTwitterInput): SEOTwitterResult {
    const cache = getSEOCache();
    const inputKey = input.title + (input.image || "");
    const cacheKey = cache.buildKey(["twitter", inputKey]);

    const cached = cache.get<SEOTwitterResult>(cacheKey);
    if (cached) return cached;

    const result: SEOTwitterResult = {
      card: input.card || "summary_large_image",
      title: input.title,
      description: input.description,
      images: input.image ? [input.image] : [],
      creator: input.creator || this.defaultCreator,
      site: input.site || this.defaultSite,
    };

    cache.set(cacheKey, result, ["twitter"]);
    return result;
  }

  resolveForPage(input: SEOTwitterInput): SEOTwitterResult {
    return this.resolve(input);
  }

  resolveCardType(hasLargeImage?: boolean): "summary" | "summary_large_image" {
    return hasLargeImage !== false ? "summary_large_image" : "summary";
  }

  getDefaultSite(): string {
    return this.defaultSite;
  }

  getDefaultCreator(): string {
    return this.defaultCreator;
  }
}

let twitterRuntimeInstance: TwitterRuntime | null = null;

export function getTwitterRuntime(): TwitterRuntime {
  if (!twitterRuntimeInstance) {
    twitterRuntimeInstance = new TwitterRuntime();
  }
  return twitterRuntimeInstance;
}

export function resetTwitterRuntime(): void {
  twitterRuntimeInstance = null;
}
