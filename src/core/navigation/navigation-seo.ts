import type { NavigationItem, RouteMetadata, NavigationSEOMetadata } from "./navigation.types";

export class NavigationSEOIntegration {
  private seoMetadata: Map<string, NavigationSEOMetadata> = new Map();
  private sitemapRoutes: Set<string> = new Set();
  private noIndexRoutes: Set<string> = new Set();

  registerSEOMetadata(metadata: NavigationSEOMetadata): void {
    this.seoMetadata.set(metadata.route, metadata);
    if (metadata.sitemapVisibility) {
      this.sitemapRoutes.add(metadata.route);
    } else {
      this.sitemapRoutes.delete(metadata.route);
    }
    if (metadata.robotsVisibility.includes("noindex")) {
      this.noIndexRoutes.add(metadata.route);
    } else {
      this.noIndexRoutes.delete(metadata.route);
    }
  }

  registerNavigationItem(item: NavigationItem): void {
    this.registerSEOMetadata({
      route: item.route,
      canonicalRoute: item.seo.canonicalRoute,
      priority: item.seo.priority,
      robotsVisibility: item.seo.robotsVisibility,
      sitemapVisibility: item.seo.sitemapVisibility,
      changeFrequency: "weekly",
      lastModified: item.updatedAt,
    });
  }

  getSEOMetadata(route: string): NavigationSEOMetadata | undefined {
    return this.seoMetadata.get(route);
  }

  getCanonicalRoute(route: string): string {
    const metadata = this.seoMetadata.get(route);
    return metadata?.canonicalRoute ?? route;
  }

  getPriority(route: string): number {
    const metadata = this.seoMetadata.get(route);
    return metadata?.priority ?? 0.5;
  }

  getRobotsVisibility(route: string): string {
    const metadata = this.seoMetadata.get(route);
    return metadata?.robotsVisibility ?? "index";
  }

  isSitemapVisible(route: string): boolean {
    const metadata = this.seoMetadata.get(route);
    return metadata?.sitemapVisibility ?? true;
  }

  isNoIndex(route: string): boolean {
    return this.noIndexRoutes.has(route);
  }

  getSitemapRoutes(): string[] {
    return Array.from(this.sitemapRoutes);
  }

  getNoIndexRoutes(): string[] {
    return Array.from(this.noIndexRoutes);
  }

  generateSitemapEntries(): Array<{
    loc: string;
    lastModified: string;
    changeFrequency: string;
    priority: number;
  }> {
    return Array.from(this.seoMetadata.values())
      .filter((m) => m.sitemapVisibility)
      .map((m) => ({
        loc: m.canonicalRoute,
        lastModified: m.lastModified,
        changeFrequency: m.changeFrequency,
        priority: m.priority,
      }));
  }

  generateRobotsTxt(): string {
    const lines = ["User-agent: *"];
    const noIndexRoutes = this.getNoIndexRoutes();
    if (noIndexRoutes.length > 0) {
      lines.push(`Disallow: ${noIndexRoutes.join("\nDisallow: ")}`);
    }
    lines.push("");
    lines.push("Sitemap: /sitemap.xml");
    return lines.join("\n");
  }

  removeSEOMetadata(route: string): void {
    this.seoMetadata.delete(route);
    this.sitemapRoutes.delete(route);
    this.noIndexRoutes.delete(route);
  }

  clearAll(): void {
    this.seoMetadata.clear();
    this.sitemapRoutes.clear();
    this.noIndexRoutes.clear();
  }

  getAllMetadata(): NavigationSEOMetadata[] {
    return Array.from(this.seoMetadata.values());
  }
}

let navigationSEOInstance: NavigationSEOIntegration | null = null;

export function getNavigationSEO(): NavigationSEOIntegration {
  if (!navigationSEOInstance) {
    navigationSEOInstance = new NavigationSEOIntegration();
  }
  return navigationSEOInstance;
}

export function resetNavigationSEO(): void {
  navigationSEOInstance = null;
}