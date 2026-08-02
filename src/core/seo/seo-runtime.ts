import type {
  SEORuntimeConfig,
  SEOPageInput,
  SEOResolvedPage,
  SEOMetadataResult,
  SEOCanonicalResult,
  SEOOpenGraphResult,
  SEOTwitterResult,
  SEOSchemaResult,
  SEORobotsMetaResult,
  SEOHreflangResult,
  SEOAISearchResult,
  SEOValidationResult,
  SEOSitemapResult,
} from "./seo.types";
import { getMetadataRuntime, MetadataRuntime } from "./metadata-runtime";
import { getCanonicalRuntime, CanonicalRuntime } from "./canonical-runtime";
import { getOpenGraphRuntime, OpenGraphRuntime } from "./opengraph-runtime";
import { getTwitterRuntime, TwitterRuntime } from "./twitter-runtime";
import { getSchemaRuntime, SchemaRuntime } from "./schema-runtime";
import { getRobotsRuntime, RobotsRuntime } from "./robots-runtime";
import { getSitemapRuntime, SitemapRuntime } from "./sitemap-runtime";
import { getHreflangRuntime, HreflangRuntime } from "./hreflang-runtime";
import { getAISearchRuntime, AISearchRuntime } from "./ai-search-runtime";
import { getValidationRuntime, ValidationRuntime } from "./seo-validation-runtime";
import { getSEOCache } from "./seo-cache";

const DEFAULT_RUNTIME_CONFIG: SEORuntimeConfig = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "https://tamerstudio.com",
  siteName: "Tamer Studio",
  defaultLocale: "en",
  supportedLocales: ["en", "id"],
  defaultImage: `${process.env.NEXT_PUBLIC_APP_URL || "https://tamerstudio.com"}/og-image.svg`,
  twitterSite: "@tamerstudio",
  twitterCreator: "@tamerstudio",
  cacheEnabled: true,
  cacheTTL: 60 * 1000,
  cacheMaxSize: 200,
};

export class SEORuntime {
  private config: SEORuntimeConfig;
  private metadata: MetadataRuntime;
  private canonical: CanonicalRuntime;
  private openGraph: OpenGraphRuntime;
  private twitter: TwitterRuntime;
  private schema: SchemaRuntime;
  private robots: RobotsRuntime;
  private sitemap: SitemapRuntime;
  private hreflang: HreflangRuntime;
  private aiSearch: AISearchRuntime;
  private validation: ValidationRuntime;

  constructor(config?: Partial<SEORuntimeConfig>) {
    this.config = { ...DEFAULT_RUNTIME_CONFIG, ...config };
    this.metadata = getMetadataRuntime();
    this.canonical = getCanonicalRuntime();
    this.openGraph = getOpenGraphRuntime();
    this.twitter = getTwitterRuntime();
    this.schema = getSchemaRuntime();
    this.robots = getRobotsRuntime();
    this.sitemap = getSitemapRuntime();
    this.hreflang = getHreflangRuntime();
    this.aiSearch = getAISearchRuntime();
    this.validation = getValidationRuntime();
  }

  async resolvePage(input: SEOPageInput): Promise<SEOResolvedPage> {
    const cache = getSEOCache();
    if (this.config.cacheEnabled) {
      const cacheKey = cache.buildKey(["page", input.route, input.locale ?? "en"]);
      const cached = await cache.get<SEOResolvedPage>(cacheKey);
      if (cached) return cached;
    }

    const locale = input.locale || this.config.defaultLocale;
    const title = input.title || this.config.siteName;
    const description = input.description || "Tamer Studio is an AI-first production operating system.";
    const image = input.image || this.config.defaultImage;
    const url = this.getUrlForRoute(input.route, locale);

    const metadata = await this.metadata.resolve({
      title,
      description,
      keywords: input.keywords,
      author: input.author,
      locale,
      route: input.route,
      baseUrl: this.config.baseUrl,
    });

    const canonicalResult = await this.canonical.resolveWithAlternates(
      { route: input.route, locale, baseUrl: this.config.baseUrl },
      this.config.supportedLocales,
      this.config.defaultLocale
    );

    const ogImage = input.image || this.config.defaultImage;
    const openGraph = await this.openGraph.resolve({
      title,
      description,
      url,
      image: ogImage,
      imageAlt: input.imageAlt || title,
      locale,
      siteName: this.config.siteName,
      type: input.type || "website",
      author: input.author,
      publishedTime: input.publishedTime,
      modifiedTime: input.modifiedTime,
    });

    const twitterResult = await this.twitter.resolve({
      title,
      description,
      image: ogImage,
      imageAlt: input.imageAlt || title,
    });

    const schemaResults = await this.buildSchemas(input);

    const robotsResult: SEORobotsMetaResult = {
      index: !input.noindex,
      follow: !input.nofollow,
      archive: !input.noindex,
      snippet: true,
    };

    const hreflangResults = await this.hreflang.resolve({
      route: input.route,
      locales: this.config.supportedLocales,
      baseUrl: this.config.baseUrl,
      defaultLocale: this.config.defaultLocale,
    });

    const sitemapResult: SEOSitemapResult | null = input.route
      ? {
          url,
          lastModified: new Date().toISOString(),
          changeFrequency: input.changeFrequency || "weekly",
          priority: input.priority ?? 0.7,
        }
      : null;

    const aiSearchResult = await this.aiSearch.resolve({
      title,
      description,
      author: input.author,
      publishedTime: input.publishedTime,
      modifiedTime: input.modifiedTime,
      type: input.type,
      route: input.route,
      baseUrl: this.config.baseUrl,
    });

    const validationResult = await this.validation.validate({
      route: input.route,
      metadata,
      canonical: canonicalResult,
      openGraph,
      twitter: twitterResult,
      schema: schemaResults,
      robots: robotsResult,
      hreflang: hreflangResults,
    });

    const result: SEOResolvedPage = {
      metadata,
      canonical: canonicalResult,
      openGraph,
      twitter: twitterResult,
      schema: schemaResults,
      robots: robotsResult,
      hreflang: hreflangResults,
      sitemap: sitemapResult,
      aiSearch: aiSearchResult,
      validation: validationResult,
      metadataBase: this.config.baseUrl,
    };

    if (this.config.cacheEnabled) {
      const cacheKey = cache.buildKey(["page", input.route, input.locale ?? "en"]);
      await cache.set(cacheKey, result, { tags: ["page", locale] });
    }

    return result;
  }

  async resolveMetadata(input: SEOPageInput): Promise<SEOMetadataResult> {
    return this.metadata.resolve({
      title: input.title || this.config.siteName,
      description: input.description || "",
      keywords: input.keywords,
      author: input.author,
      locale: input.locale,
      route: input.route,
      baseUrl: this.config.baseUrl,
    });
  }

  async resolveCanonical(input: SEOPageInput): Promise<SEOCanonicalResult> {
    return this.canonical.resolveWithAlternates(
      { route: input.route, locale: input.locale, baseUrl: this.config.baseUrl },
      this.config.supportedLocales,
      this.config.defaultLocale
    );
  }

  async resolveOpenGraph(input: SEOPageInput): Promise<SEOOpenGraphResult> {
    const url = this.getUrlForRoute(input.route, input.locale || this.config.defaultLocale);
    return this.openGraph.resolve({
      title: input.title || this.config.siteName,
      description: input.description || "",
      url,
      image: input.image || this.config.defaultImage,
      imageAlt: input.imageAlt || input.title,
      locale: input.locale,
      siteName: this.config.siteName,
      type: input.type || "website",
      author: input.author,
      publishedTime: input.publishedTime,
      modifiedTime: input.modifiedTime,
    });
  }

  async resolveTwitter(input: SEOPageInput): Promise<SEOTwitterResult> {
    return this.twitter.resolve({
      title: input.title || this.config.siteName,
      description: input.description || "",
      image: input.image || this.config.defaultImage,
      imageAlt: input.imageAlt || input.title,
    });
  }

  async resolveSchemas(input: SEOPageInput): Promise<SEOSchemaResult[]> {
    return this.buildSchemas(input);
  }

  async resolveRobots(input?: { route?: string; noindex?: boolean }): Promise<SEORobotsMetaResult> {
    if (input?.noindex) {
      return { index: false, follow: true, archive: false, snippet: true };
    }
    return this.robots.resolveRobotsForPage(input?.route ? { route: input.route } : undefined);
  }

  async resolveHreflang(input: SEOPageInput): Promise<SEOHreflangResult[]> {
    return this.hreflang.resolve({
      route: input.route,
      locales: this.config.supportedLocales,
      baseUrl: this.config.baseUrl,
      defaultLocale: this.config.defaultLocale,
    });
  }

  async resolveAISearch(input: SEOPageInput): Promise<SEOAISearchResult> {
    return this.aiSearch.resolve({
      title: input.title || this.config.siteName,
      description: input.description || "",
      author: input.author,
      publishedTime: input.publishedTime,
      modifiedTime: input.modifiedTime,
      type: input.type,
      route: input.route,
      baseUrl: this.config.baseUrl,
    });
  }

  async resolveSitemap(routes?: Array<{ path: string; priority?: number; changeFrequency?: string }>): Promise<SEOSitemapResult[]> {
    const sitemapRoutes = routes?.map((r) => ({
      path: r.path,
      priority: r.priority,
      changeFrequency: r.changeFrequency as "weekly" | "daily" | "monthly" | "yearly" | "hourly" | "always" | "never" | undefined,
    }));

    return this.sitemap.resolve({
      baseUrl: this.config.baseUrl,
      routes: sitemapRoutes,
    });
  }

  async resolveRobotsTxt(): Promise<string> {
    return this.robots.generateRobotsTxtString({
      isProduction: process.env.NODE_ENV === "production",
    });
  }

  generateMetadata(input: SEOPageInput) {
    return this.resolvePage(input).then((resolved) => ({
      title: resolved.metadata.title,
      description: resolved.metadata.description,
      keywords: resolved.metadata.keywords,
      openGraph: {
        title: resolved.openGraph.title,
        description: resolved.openGraph.description,
        type: resolved.openGraph.type,
        url: resolved.openGraph.url,
        siteName: resolved.openGraph.siteName,
        images: resolved.openGraph.images,
        locale: resolved.openGraph.locale,
      },
      twitter: {
        card: resolved.twitter.card,
        title: resolved.twitter.title,
        description: resolved.twitter.description,
        images: resolved.twitter.images,
      },
      robots: {
        index: resolved.robots.index,
        follow: resolved.robots.follow,
      },
      alternates: {
        canonical: resolved.canonical.canonical,
        languages: resolved.hreflang.reduce<Record<string, string>>((acc, h) => {
          acc[h.hreflang] = h.href;
          return acc;
        }, {}),
      },
    }));
  }

  getConfig(): SEORuntimeConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<SEORuntimeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  async invalidateCache(locale?: string): Promise<void> {
    const cache = getSEOCache();
    if (locale) {
      await cache.invalidateByTag(locale);
    } else {
      await cache.invalidateAll();
    }
  }

  getMetadataRuntime(): MetadataRuntime {
    return this.metadata;
  }

  getCanonicalRuntime(): CanonicalRuntime {
    return this.canonical;
  }

  getOpenGraphRuntime(): OpenGraphRuntime {
    return this.openGraph;
  }

  getTwitterRuntime(): TwitterRuntime {
    return this.twitter;
  }

  getSchemaRuntime(): SchemaRuntime {
    return this.schema;
  }

  getRobotsRuntime(): RobotsRuntime {
    return this.robots;
  }

  getSitemapRuntime(): SitemapRuntime {
    return this.sitemap;
  }

  getHreflangRuntime(): HreflangRuntime {
    return this.hreflang;
  }

  getAISearchRuntime(): AISearchRuntime {
    return this.aiSearch;
  }

  getValidationRuntime(): ValidationRuntime {
    return this.validation;
  }

  private async buildSchemas(input: SEOPageInput): Promise<SEOSchemaResult[]> {
    const schemas: SEOSchemaResult[] = [];

    schemas.push(await this.schema.resolveOrganization());
    schemas.push(await this.schema.resolveWebsite());

    if (input.breadcrumbs?.length) {
      schemas.push(await this.schema.resolveBreadcrumbs(input.breadcrumbs));
    }

    if (input.schema?.length) {
      for (const s of input.schema) {
        schemas.push(await this.schema.resolve({
          type: s.type,
          data: s.data,
          locale: input.locale,
          baseUrl: this.config.baseUrl,
        }));
      }
    }

    if (input.type === "article") {
      schemas.push(await this.schema.resolveArticle({
        title: input.title || this.config.siteName,
        description: input.description || "",
        author: input.author,
        publishedTime: input.publishedTime,
        modifiedTime: input.modifiedTime,
        image: input.image,
        url: this.getUrlForRoute(input.route, input.locale),
      }));
    }

    return schemas;
  }

  private getUrlForRoute(route?: string, locale?: string): string {
    const base = this.config.baseUrl;
    const loc = locale || this.config.defaultLocale;

    if (!route) return base;

    if (loc === this.config.defaultLocale) {
      return `${base}${route}`;
    }

    return `${base}/${loc}${route}`;
  }
}

let seoRuntimeInstance: SEORuntime | null = null;

export function getSEORuntime(): SEORuntime {
  if (!seoRuntimeInstance) {
    seoRuntimeInstance = new SEORuntime();
  }
  return seoRuntimeInstance;
}

export function resetSEORuntime(): void {
  seoRuntimeInstance = null;
}
