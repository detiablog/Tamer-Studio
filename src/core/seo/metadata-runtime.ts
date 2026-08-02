import type { SEOMetadataInput, SEOMetadataResult } from "./seo.types";
import { getSEOCache } from "./seo-cache";

export class MetadataRuntime {
  private defaultConfig: SEOMetadataResult;

  constructor(defaults?: Partial<SEOMetadataResult>) {
    this.defaultConfig = {
      title: "Tamer Studio",
      description: "Tamer Studio is an AI-first production operating system.",
      keywords: ["AI", "Studio", "Production", "Automation"],
      author: "Tamer Studio",
      publisher: "Tamer Studio",
      category: "Technology",
      language: "en",
      locale: "en_US",
      themeColor: "#0f172a",
      manifest: null,
      metadataBase: process.env.NEXT_PUBLIC_APP_URL || "https://tamerstudio.com",
      ...defaults,
    };
  }

  async resolve(input: SEOMetadataInput, baseUrl?: string): Promise<SEOMetadataResult> {
    const cache = getSEOCache();
    const cacheKey = cache.buildKey(["metadata", input.route ?? "root", input.locale ?? "en"]);

    const cached = await cache.get<SEOMetadataResult>(cacheKey);
    if (cached) return cached;

    const result: SEOMetadataResult = {
      title: input.title || this.defaultConfig.title,
      description: input.description || this.defaultConfig.description,
      keywords: input.keywords?.length ? input.keywords : this.defaultConfig.keywords,
      author: input.author || this.defaultConfig.author,
      publisher: input.publisher || this.defaultConfig.publisher,
      category: input.category || this.defaultConfig.category,
      language: input.language || this.defaultConfig.language,
      locale: input.locale || this.defaultConfig.locale,
      themeColor: input.themeColor || this.defaultConfig.themeColor,
      manifest: input.manifest || this.defaultConfig.manifest,
      metadataBase: input.baseUrl || baseUrl || this.defaultConfig.metadataBase,
    };

    await cache.set(cacheKey, result, { tags: ["metadata", input.locale ?? "en"] });
    return result;
  }

  async resolveForPage(input: SEOMetadataInput): Promise<SEOMetadataResult> {
    return this.resolve(input);
  }

  resolveTitle(title: string, siteName?: string): string {
    if (!title) return this.defaultConfig.title;
    const name = siteName || "Tamer Studio";
    if (title.includes(name)) return title;
    return `${title} | ${name}`;
  }

  resolveDescription(description?: string): string {
    return description || this.defaultConfig.description;
  }

  resolveKeywords(keywords?: string[]): string[] {
    return keywords?.length ? keywords : this.defaultConfig.keywords;
  }

  getDefault(): SEOMetadataResult {
    return { ...this.defaultConfig };
  }
}

let metadataRuntimeInstance: MetadataRuntime | null = null;

export function getMetadataRuntime(): MetadataRuntime {
  if (!metadataRuntimeInstance) {
    metadataRuntimeInstance = new MetadataRuntime();
  }
  return metadataRuntimeInstance;
}

export function resetMetadataRuntime(): void {
  metadataRuntimeInstance = null;
}
