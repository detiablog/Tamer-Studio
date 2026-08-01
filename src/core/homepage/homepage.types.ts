import type { CMSPage, CMSSection, CMSMedia, CMSComponent, CMSVersion } from "@/core/cms/cms.types";
import type { NavigationItem, NavigationMenu, BreadcrumbItem } from "@/core/navigation/navigation.types";

export type HomepageStatus = "draft" | "published" | "scheduled";
export type SectionVisibility = "public" | "authenticated" | "admin";
export type PreviewMode = "published" | "draft" | "responsive" | "locale";

export interface HomepageSectionDefinition {
  id: string;
  sectionKey: string;
  type: string;
  component: string;
  title: string;
  description?: string;
  order: number;
  visible: boolean;
  locked: boolean;
  visibility: SectionVisibility;
  config: Record<string, unknown>;
  styles: Record<string, unknown>;
  media: HomepageMediaItem[];
  permissions: string[];
  featureFlags: string[];
  localization: {
    namespace: string;
    fallbackLocale: string;
    translations: Record<string, Record<string, string>>;
  };
  fallbackSection?: string;
  conditionalRules?: SectionConditionalRule[];
}

export interface SectionConditionalRule {
  type: "locale" | "permission" | "feature_flag" | "device" | "time_range";
  condition: string;
  value: string;
  negate?: boolean;
}

export interface HomepageMediaItem {
  id: string;
  url: string;
  alt: string;
  type: string;
  order: number;
  responsive?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export interface HomepageSEOData {
  title: string;
  description: string;
  keywords: string[];
  image: string;
  url: string;
  canonical: string;
  robots: string;
  ogType: string;
  ogLocale: string;
  twitterCard: string;
  twitterSite: string;
  hreflangs: Array<{ hreflang: string; href: string }>;
  schemaOrg?: Record<string, unknown>;
}

export interface HomepageNavigationData {
  header: NavigationItem[];
  footer: NavigationItem[];
  breadcrumbs: BreadcrumbItem[];
  menus: NavigationMenu[];
  routeMetadata: Record<string, unknown>;
}

export interface HomepageContext {
  locale: string;
  currency: string;
  country: string | null;
  timezone: string | null;
  role: string | null;
  permissions: string[];
  featureFlags: string[];
  workspace: string | null;
  isPreview: boolean;
  previewMode?: PreviewMode;
  device: "desktop" | "tablet" | "mobile";
}

export interface HomepageResolutionResult {
  page: CMSPage | null;
  sections: HomepageSectionDefinition[];
  navigation: HomepageNavigationData;
  seo: HomepageSEOData;
  localization: {
    locale: string;
    fallbackLocale: string;
    translations: Record<string, string>;
    namespace: string;
  };
  media: HomepageMediaItem[];
  context: HomepageContext;
  resolvedAt: string;
}

export interface HomepageCacheEntry {
  key: string;
  data: HomepageResolutionResult;
  expiresAt: number;
  tags: string[];
  createdAt: number;
}

export interface HomepageCacheConfig {
  ttl: number;
  maxSize: number;
  enableInvalidation: boolean;
  tags: string[];
}

export interface SectionRegistrationInput {
  sectionKey: string;
  type: string;
  component: string;
  title: string;
  description?: string;
  order?: number;
  visible?: boolean;
  locked?: boolean;
  visibility?: SectionVisibility;
  config?: Record<string, unknown>;
  styles?: Record<string, unknown>;
  permissions?: string[];
  featureFlags?: string[];
  localization?: Partial<HomepageSectionDefinition["localization"]>;
  fallbackSection?: string;
  conditionalRules?: SectionConditionalRule[];
}

export interface HomepagePreviewOptions {
  mode: PreviewMode;
  locale?: string;
  device?: "desktop" | "tablet" | "mobile";
  version?: number;
}

export interface HomepagePerformanceConfig {
  lazyLoading: boolean;
  codeSplitting: boolean;
  imageOptimization: boolean;
  prefetch: boolean;
  caching: boolean;
  streaming: boolean;
  isrCompat: boolean;
  isrRevalidate?: number;
}

export interface HomepageMetadata {
  title: string;
  description: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    type: string;
    url: string;
    siteName: string;
    images: Array<{ url: string; width: number; height: number; alt: string }>;
    locale: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    images: string[];
  };
  robots: { index: boolean; follow: boolean };
  alternates: {
    canonical: string;
    languages: Record<string, string>;
  };
}
