import type { SEOOpenGraphInput, SEOOpenGraphResult } from "./seo.types";
import { getSEOCache } from "./seo-cache";

export class OpenGraphRuntime {
  private defaultSiteName: string;
  private defaultImage: string;

  constructor(siteName?: string, defaultImage?: string) {
    this.defaultSiteName = siteName || "Tamer Studio";
    this.defaultImage = defaultImage || `${process.env.NEXT_PUBLIC_APP_URL || "https://tamerstudio.com"}/og-image.svg`;
  }

  async resolve(input: SEOOpenGraphInput): Promise<SEOOpenGraphResult> {
    const cache = getSEOCache();
    const cacheKey = cache.buildKey(["og", input.url ?? "root", input.locale ?? "en"]);

    const cached = await cache.get<SEOOpenGraphResult>(cacheKey);
    if (cached) return cached;

    const image = input.image || this.defaultImage;
    const imageAlt = input.imageAlt || input.title;

    const result: SEOOpenGraphResult = {
      title: input.title,
      description: input.description,
      url: input.url,
      images: [
        {
          url: image,
          width: input.imageWidth || 1200,
          height: input.imageHeight || 630,
          alt: imageAlt,
        },
      ],
      video: input.video,
      locale: this.mapLocale(input.locale),
      siteName: input.siteName || this.defaultSiteName,
      type: input.type || "website",
      author: input.author,
      publishedTime: input.publishedTime,
      modifiedTime: input.modifiedTime,
    };

    await cache.set(cacheKey, result, { tags: ["og", input.locale ?? "en"] });
    return result;
  }

  async resolveForPage(input: SEOOpenGraphInput): Promise<SEOOpenGraphResult> {
    return this.resolve(input);
  }

  async resolveForArticle(input: SEOOpenGraphInput): Promise<SEOOpenGraphResult> {
    return this.resolve({ ...input, type: "article" });
  }

  async resolveForProduct(input: SEOOpenGraphInput): Promise<SEOOpenGraphResult> {
    return this.resolve({ ...input, type: "website" });
  }

  resolveImage(imageUrl: string, alt?: string): { url: string; width: number; height: number; alt: string } {
    return {
      url: imageUrl,
      width: 1200,
      height: 630,
      alt: alt || this.defaultSiteName,
    };
  }

  private mapLocale(locale?: string): string {
    if (!locale) return "en_US";
    if (locale === "id") return "id_ID";
    if (locale.length === 2) return `${locale}_${locale.toUpperCase()}`;
    return locale;
  }

  getDefaultSiteName(): string {
    return this.defaultSiteName;
  }
}

let openGraphRuntimeInstance: OpenGraphRuntime | null = null;

export function getOpenGraphRuntime(): OpenGraphRuntime {
  if (!openGraphRuntimeInstance) {
    openGraphRuntimeInstance = new OpenGraphRuntime();
  }
  return openGraphRuntimeInstance;
}

export function resetOpenGraphRuntime(): void {
  openGraphRuntimeInstance = null;
}
