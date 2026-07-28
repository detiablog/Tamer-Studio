import type { SEOSitemapInput, SEOSitemapResult, SEOSitemapRoute } from "./seo.types";
import { getSEOCache } from "./seo-cache";

export class SitemapRuntime {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || "https://tamer.studio";
  }

  resolve(input: SEOSitemapInput): SEOSitemapResult[] {
    const cache = getSEOCache();
    const cacheKey = cache.buildKey(["sitemap", input.locale ?? "all"]);

    const cached = cache.get<SEOSitemapResult[]>(cacheKey);
    if (cached) return cached;

    const routes = input.routes || this.getDefaultRoutes();
    const results: SEOSitemapResult[] = routes.map((route) => this.resolveRoute(route, input.baseUrl));

    cache.set(cacheKey, results, ["sitemap"]);
    return results;
  }

  resolveRoute(route: SEOSitemapRoute, baseUrl?: string): SEOSitemapResult {
    const base = baseUrl || this.baseUrl;
    const url = route.path.startsWith("http") ? route.path : `${base}${route.path}`;

    const result: SEOSitemapResult = {
      url,
      lastModified: route.lastModified || new Date().toISOString(),
      changeFrequency: route.changeFrequency || "weekly",
      priority: route.priority ?? 0.7,
    };

    if (route.image) {
      result.images = [
        {
          url: route.image.url,
          title: route.image.title,
          caption: route.image.caption,
        },
      ];
    }

    if (route.video) {
      result.videos = [
        {
          thumbnailUrl: route.video.thumbnailUrl,
          title: route.video.title,
          description: route.video.description,
          contentUrl: route.video.contentUrl,
        },
      ];
    }

    return result;
  }

  resolveForStaticRoutes(routes: string[], baseUrl?: string): SEOSitemapResult[] {
    return routes.map((path) => ({
      url: `${baseUrl || this.baseUrl}${path}`,
      lastModified: new Date().toISOString(),
      changeFrequency: path === "/" ? "daily" : "weekly",
      priority: path === "/" ? 1 : 0.7,
    }));
  }

  resolveForBlogSlugs(slugs: string[], baseUrl?: string): SEOSitemapResult[] {
    return slugs.map((slug) => ({
      url: `${baseUrl || this.baseUrl}/blog/${slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  }

  resolveForCMSRoutes(pages: Array<{ slug: string; updatedAt?: string }>, baseUrl?: string): SEOSitemapResult[] {
    return pages.map((page) => ({
      url: `${baseUrl || this.baseUrl}/${page.slug}`,
      lastModified: page.updatedAt || new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  }

  resolveForLocalizedRoutes(
    routes: string[],
    locales: string[],
    defaultLocale: string,
    baseUrl?: string
  ): SEOSitemapResult[] {
    const results: SEOSitemapResult[] = [];
    const base = baseUrl || this.baseUrl;

    for (const route of routes) {
      for (const locale of locales) {
        if (locale === defaultLocale) {
          results.push({
            url: `${base}${route}`,
            lastModified: new Date().toISOString(),
            changeFrequency: "weekly",
            priority: route === "/" ? 1 : 0.7,
          });
        } else {
          results.push({
            url: `${base}/${locale}${route}`,
            lastModified: new Date().toISOString(),
            changeFrequency: "weekly",
            priority: route === "/" ? 0.9 : 0.7,
          });
        }
      }
    }

    return results;
  }

  generateSitemapXml(entries: SEOSitemapResult[]): string {
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
      '  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
      '  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
    ];

    for (const entry of entries) {
      lines.push("  <url>");
      lines.push(`    <loc>${this.escapeXml(entry.url)}</loc>`);
      lines.push(`    <lastmod>${entry.lastModified}</lastmod>`);
      lines.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
      lines.push(`    <priority>${entry.priority}</priority>`);

      if (entry.images) {
        for (const image of entry.images) {
          lines.push("    <image:image>");
          lines.push(`      <image:loc>${this.escapeXml(image.url)}</image:loc>`);
          if (image.title) lines.push(`      <image:title>${this.escapeXml(image.title)}</image:title>`);
          if (image.caption) lines.push(`      <image:caption>${this.escapeXml(image.caption)}</image:caption>`);
          lines.push("    </image:image>");
        }
      }

      if (entry.videos) {
        for (const video of entry.videos) {
          lines.push("    <video:video>");
          lines.push(`      <video:thumbnail_loc>${this.escapeXml(video.thumbnailUrl)}</video:thumbnail_loc>`);
          lines.push(`      <video:title>${this.escapeXml(video.title)}</video:title>`);
          lines.push(`      <video:description>${this.escapeXml(video.description)}</video:description>`);
          lines.push(`      <video:content_loc>${this.escapeXml(video.contentUrl)}</video:content_loc>`);
          lines.push("    </video:video>");
        }
      }

      lines.push("  </url>");
    }

    lines.push("</urlset>");
    return lines.join("\n");
  }

  private getDefaultRoutes(): SEOSitemapRoute[] {
    return [
      { path: "/", priority: 1, changeFrequency: "daily" },
      { path: "/features", priority: 0.8, changeFrequency: "weekly" },
      { path: "/pricing", priority: 0.8, changeFrequency: "weekly" },
      { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
      { path: "/roadmap", priority: 0.6, changeFrequency: "weekly" },
      { path: "/careers", priority: 0.6, changeFrequency: "monthly" },
      { path: "/support", priority: 0.6, changeFrequency: "monthly" },
      { path: "/docs", priority: 0.7, changeFrequency: "weekly" },
      { path: "/about", priority: 0.7, changeFrequency: "monthly" },
      { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
      { path: "/legal/privacy", priority: 0.3, changeFrequency: "yearly" },
      { path: "/legal/terms", priority: 0.3, changeFrequency: "yearly" },
    ];
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

let sitemapRuntimeInstance: SitemapRuntime | null = null;

export function getSitemapRuntime(): SitemapRuntime {
  if (!sitemapRuntimeInstance) {
    sitemapRuntimeInstance = new SitemapRuntime();
  }
  return sitemapRuntimeInstance;
}

export function resetSitemapRuntime(): void {
  sitemapRuntimeInstance = null;
}
