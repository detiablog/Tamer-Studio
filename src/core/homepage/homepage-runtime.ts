import { CMSService } from "@/core/cms/cms.service";
import { getOrCreateLandingPage } from "@/core/cms/landing-page.helper";
import { getNavigationRuntime } from "@/core/navigation/navigation-runtime";
import { getLocalizationService } from "@/lib/localization";
import { getSEORuntime } from "@/core/seo";
import type { CMSPage, CMSSection, CMSMedia } from "@/core/cms/cms.types";
import type { NavigationItem, BreadcrumbItem } from "@/core/navigation/navigation.types";
import type {
  HomepageSectionDefinition,
  HomepageSEOData,
  HomepageNavigationData,
  HomepageContext,
  HomepageResolutionResult,
  HomepagePreviewOptions,
  HomepageMetadata,
  HomepagePerformanceConfig,
  HomepageMediaItem,
} from "./homepage.types";
import { getSectionRegistry, type SectionRegistry } from "./section-registry";
import { getHomepageCache } from "./homepage-cache";

export interface HomepageRuntimeConfig {
  performance: HomepagePerformanceConfig;
  defaultLocale: string;
  defaultDevice: "desktop" | "tablet" | "mobile";
  cacheEnabled: boolean;
  cacheTTL: number;
}

const DEFAULT_CONFIG: HomepageRuntimeConfig = {
  performance: {
    lazyLoading: true,
    codeSplitting: true,
    imageOptimization: true,
    prefetch: true,
    caching: true,
    streaming: true,
    isrCompat: true,
    isrRevalidate: 60,
  },
  defaultLocale: "en",
  defaultDevice: "desktop",
  cacheEnabled: true,
  cacheTTL: 60000,
};

export class HomepageRuntime {
  private cmsService: CMSService;
  private sectionRegistry: SectionRegistry;
  private config: HomepageRuntimeConfig;

  constructor(cmsService?: CMSService, config?: Partial<HomepageRuntimeConfig>) {
    this.cmsService = cmsService ?? new CMSService();
    this.sectionRegistry = getSectionRegistry();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async resolveHomepage(context: HomepageContext): Promise<HomepageResolutionResult> {
    const cache = getHomepageCache();
    const cacheKey = cache.buildKey(
      context.locale,
      context.device,
      context.isPreview,
      context.previewMode
    );

    if (this.config.cacheEnabled && !context.isPreview) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }

    const page = await this.resolvePage(context);
    const sections = await this.resolveSections(page, context);
    const navigation = await this.resolveNavigation(context);
    const seo = await this.resolveSEO(page, context);
    const localization = this.resolveLocalization(context);
    const media = this.resolveMedia(sections);

    const result: HomepageResolutionResult = {
      page,
      sections,
      navigation,
      seo,
      localization,
      media,
      context,
      resolvedAt: new Date().toISOString(),
    };

    if (this.config.cacheEnabled && !context.isPreview) {
      cache.set(cacheKey, result, ["homepage", context.locale]);
    }

    return result;
  }

  async resolvePage(context: HomepageContext): Promise<CMSPage | null> {
    try {
      const pageId = await getOrCreateLandingPage(this.cmsService);

      if (context.isPreview && context.previewMode === "draft") {
        const page = await this.cmsService.getPage(pageId);
        return page ?? null;
      }

      const page = await this.cmsService.getPage(pageId);
      if (!page) return null;

      if (page.status !== "published" && !context.isPreview) {
        return null;
      }

      return page;
    } catch {
      return null;
    }
  }

  async resolveSections(
    page: CMSPage | null,
    context: HomepageContext
  ): Promise<HomepageSectionDefinition[]> {
    if (!page) return this.getFallbackSections();

    let cmsSections: CMSSection[];
    try {
      cmsSections = await this.cmsService.listSections(page.id);
    } catch {
      return this.getFallbackSections();
    }

    const definitions: HomepageSectionDefinition[] = cmsSections.map((section) =>
      this.mapCMSToDefinition(section)
    );

    for (const entry of this.sectionRegistry.getAll()) {
      if (!definitions.find((d) => d.sectionKey === entry.sectionKey)) {
        definitions.push(this.sectionRegistryToDefinition(entry));
      }
    }

    const resolved = definitions
      .filter((section) => this.evaluateVisibility(section, context))
      .filter((section) => this.evaluateConditionalRules(section, context))
      .sort((a, b) => a.order - b.order);

    return resolved;
  }

  async resolveNavigation(context: HomepageContext): Promise<HomepageNavigationData> {
    const runtime = getNavigationRuntime();
    const headerItems = runtime.getItemsByPosition("header");
    const footerItems = runtime.getItemsByPosition("footer");
    const breadcrumbs = runtime.getBreadcrumbs("/", context.locale);
    const menus = runtime.getAllMenus();

    return {
      header: headerItems,
      footer: footerItems,
      breadcrumbs,
      menus,
      routeMetadata: {},
    };
  }

  async resolveSEO(page: CMSPage | null, context: HomepageContext): Promise<HomepageSEOData> {
    const seoRuntime = getSEORuntime();

    const defaultSEO: HomepageSEOData = {
      title: "Tamer Studio - AI-Powered Production Platform",
      description: "Build, deploy, and scale AI-powered applications with Tamer Studio.",
      keywords: ["AI", "production platform", "automation", "AI providers", "multi-model", "enterprise AI"],
      image: "https://tamer.studio/og-image.png",
      url: "https://tamer.studio",
      canonical: "https://tamer.studio",
      robots: "index, follow",
      ogType: "website",
      ogLocale: context.locale === "id" ? "id_ID" : "en_US",
      twitterCard: "summary_large_image",
      twitterSite: "@tamerstudio",
      hreflangs: [
        { hreflang: "en", href: "https://tamer.studio" },
        { hreflang: "id", href: "https://tamer.studio/id" },
        { hreflang: "x-default", href: "https://tamer.studio" },
      ],
    };

    const resolved = await seoRuntime.resolvePage({
      route: '/',
      locale: context.locale,
      title: page?.seo?.title || defaultSEO.title,
      description: page?.seo?.description || defaultSEO.description,
      keywords: defaultSEO.keywords,
      image: page?.seo?.ogImage || defaultSEO.image,
      type: 'website',
      author: 'Tamer Studio',
    });

    return {
      title: resolved.metadata.title,
      description: resolved.metadata.description,
      keywords: resolved.metadata.keywords,
      image: resolved.openGraph.images[0]?.url || defaultSEO.image,
      url: resolved.openGraph.url,
      canonical: resolved.canonical.canonical,
      robots: resolved.robots.index && resolved.robots.follow ? "index, follow" : "noindex",
      ogType: resolved.openGraph.type,
      ogLocale: resolved.openGraph.locale,
      twitterCard: resolved.twitter.card,
      twitterSite: resolved.twitter.site,
      hreflangs: resolved.hreflang.map(h => ({
        hreflang: h.hreflang,
        href: h.href,
      })),
    };
  }

  resolveLocalization(context: HomepageContext): HomepageResolutionResult["localization"] {
    const service = getLocalizationService();
    service.setLocale(context.locale as any);

    return {
      locale: context.locale,
      fallbackLocale: "en",
      translations: service.getTranslations(),
      namespace: "homepage",
    };
  }

  resolveMedia(sections: HomepageSectionDefinition[]): HomepageMediaItem[] {
    const media: HomepageMediaItem[] = [];
    for (const section of sections) {
      media.push(...section.media);
    }
    return media;
  }

  async resolvePreview(
    options: HomepagePreviewOptions,
    context: HomepageContext
  ): Promise<HomepageResolutionResult> {
    const previewContext: HomepageContext = {
      ...context,
      isPreview: true,
      previewMode: options.mode,
      locale: options.locale ?? context.locale,
      device: options.device ?? context.device,
    };

    return this.resolveHomepage(previewContext);
  }

  generateMetadata(resolution: HomepageResolutionResult): HomepageMetadata {
    const { seo } = resolution;
    return {
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords,
      openGraph: {
        title: seo.title,
        description: seo.description,
        type: seo.ogType,
        url: seo.url,
        siteName: "Tamer Studio",
        images: [
          {
            url: seo.image,
            width: 1200,
            height: 630,
            alt: seo.title,
          },
        ],
        locale: seo.ogLocale,
      },
      twitter: {
        card: seo.twitterCard,
        title: seo.title,
        description: seo.description,
        images: [seo.image],
      },
      robots: { index: true, follow: true },
      alternates: {
        canonical: seo.canonical,
        languages: seo.hreflangs.reduce<Record<string, string>>((acc, h) => {
          acc[h.hreflang] = h.href;
          return acc;
        }, {}),
      },
    };
  }

  getPerformanceConfig(): HomepagePerformanceConfig {
    return { ...this.config.performance };
  }

  getSectionRegistry(): SectionRegistry {
    return this.sectionRegistry;
  }

  invalidateCache(locale?: string): void {
    const cache = getHomepageCache();
    if (locale) {
      cache.invalidateByTag(locale);
    } else {
      cache.invalidateAll();
    }
  }

  private mapCMSToDefinition(section: CMSSection): HomepageSectionDefinition {
    return {
      id: section.id,
      sectionKey: section.sectionKey,
      type: section.type,
      component: section.component || section.type,
      title: section.title,
      description: section.description,
      order: section.order,
      visible: section.visible,
      locked: section.locked,
      visibility: "public",
      config: section.config,
      styles: section.styles,
      media: (section.media || []).map((m, idx) => ({
        id: m.id,
        url: m.url,
        alt: m.alt || "",
        type: m.type,
        order: idx,
      })),
      permissions: [],
      featureFlags: [],
      localization: {
        namespace: "homepage",
        fallbackLocale: "en",
        translations: {},
      },
    };
  }

  private sectionRegistryToDefinition(
    entry: ReturnType<SectionRegistry["get"]> & object
  ): HomepageSectionDefinition {
    return {
      id: entry.sectionKey,
      sectionKey: entry.sectionKey,
      type: entry.type,
      component: entry.component,
      title: entry.title,
      description: entry.description,
      order: entry.order,
      visible: entry.visible,
      locked: entry.locked,
      visibility: entry.visibility,
      config: entry.config,
      styles: entry.styles,
      media: [],
      permissions: entry.permissions,
      featureFlags: entry.featureFlags,
      localization: entry.localization,
      fallbackSection: entry.fallbackSection,
      conditionalRules: entry.conditionalRules,
    };
  }

  private evaluateVisibility(
    section: HomepageSectionDefinition,
    context: HomepageContext
  ): boolean {
    if (!section.visible) return false;

    if (section.visibility === "admin" && context.role !== "admin") return false;
    if (section.visibility === "authenticated" && !context.role) return false;

    if (section.permissions.length > 0) {
      const hasPermission = section.permissions.some((p) => context.permissions.includes(p));
      if (!hasPermission) return false;
    }

    if (section.featureFlags.length > 0) {
      const hasFlag = section.featureFlags.every((f) => context.featureFlags.includes(f));
      if (!hasFlag) return false;
    }

    return true;
  }

  private evaluateConditionalRules(
    section: HomepageSectionDefinition,
    context: HomepageContext
  ): boolean {
    if (!section.conditionalRules || section.conditionalRules.length === 0) return true;

    return this.sectionRegistry.resolveConditionalRules(section.sectionKey, {
      locale: context.locale,
      role: context.role ?? undefined,
      permissions: context.permissions,
      featureFlags: context.featureFlags,
      device: context.device,
    });
  }

  private getFallbackSections(): HomepageSectionDefinition[] {
    return [
      {
        id: "fallback-hero",
        sectionKey: "hero",
        type: "hero",
        component: "hero",
        title: "Hero",
        order: 0,
        visible: true,
        locked: false,
        visibility: "public",
        config: {},
        styles: {},
        media: [],
        permissions: [],
        featureFlags: [],
        localization: { namespace: "homepage", fallbackLocale: "en", translations: {} },
      },
      {
        id: "fallback-features",
        sectionKey: "features",
        type: "features",
        component: "features",
        title: "Features",
        order: 1,
        visible: true,
        locked: false,
        visibility: "public",
        config: {},
        styles: {},
        media: [],
        permissions: [],
        featureFlags: [],
        localization: { namespace: "homepage", fallbackLocale: "en", translations: {} },
      },
      {
        id: "fallback-pricing",
        sectionKey: "pricing",
        type: "pricing",
        component: "pricing",
        title: "Pricing",
        order: 2,
        visible: true,
        locked: false,
        visibility: "public",
        config: {},
        styles: {},
        media: [],
        permissions: [],
        featureFlags: [],
        localization: { namespace: "homepage", fallbackLocale: "en", translations: {} },
      },
      {
        id: "fallback-faq",
        sectionKey: "faq",
        type: "faq",
        component: "faq",
        title: "FAQ",
        order: 3,
        visible: true,
        locked: false,
        visibility: "public",
        config: {},
        styles: {},
        media: [],
        permissions: [],
        featureFlags: [],
        localization: { namespace: "homepage", fallbackLocale: "en", translations: {} },
      },
      {
        id: "fallback-cta",
        sectionKey: "cta",
        type: "cta",
        component: "cta",
        title: "CTA",
        order: 4,
        visible: true,
        locked: false,
        visibility: "public",
        config: {},
        styles: {},
        media: [],
        permissions: [],
        featureFlags: [],
        localization: { namespace: "homepage", fallbackLocale: "en", translations: {} },
      },
      {
        id: "fallback-footer",
        sectionKey: "footer",
        type: "footer",
        component: "footer",
        title: "Footer",
        order: 5,
        visible: true,
        locked: false,
        visibility: "public",
        config: {},
        styles: {},
        media: [],
        permissions: [],
        featureFlags: [],
        localization: { namespace: "homepage", fallbackLocale: "en", translations: {} },
      },
    ];
  }
}

let runtimeInstance: HomepageRuntime | null = null;

export function getHomepageRuntime(): HomepageRuntime {
  if (!runtimeInstance) {
    runtimeInstance = new HomepageRuntime();
  }
  return runtimeInstance;
}

export function resetHomepageRuntime(): void {
  runtimeInstance = null;
}
