export type RobotsDirective = "index" | "noindex" | "follow" | "nofollow" | "noindex,nofollow" | "none";

export type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export type SchemaType =
  | "Organization"
  | "Website"
  | "WebPage"
  | "BreadcrumbList"
  | "FAQPage"
  | "Article"
  | "SoftwareApplication"
  | "Product"
  | "VideoObject"
  | "ImageObject"
  | "LocalBusiness"
  | "Event";

export interface SEOCanonicalInput {
  route: string;
  locale?: string;
  baseUrl?: string;
}

export interface SEOCanonicalResult {
  canonical: string;
  isAlternate: boolean;
  alternates?: Array<{ hreflang: string; href: string }>;
}

export interface SEOMetadataInput {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  publisher?: string;
  category?: string;
  language?: string;
  locale?: string;
  themeColor?: string;
  manifest?: string;
  route?: string;
  baseUrl?: string;
}

export interface SEOMetadataResult {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  publisher: string;
  category: string;
  language: string;
  locale: string;
  themeColor: string;
  manifest: string | null;
  metadataBase: string;
}

export interface SEOOpenGraphInput {
  title: string;
  description: string;
  url: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  video?: string;
  locale?: string;
  siteName?: string;
  type?: "website" | "article" | "product" | "profile";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export interface SEOOpenGraphResult {
  title: string;
  description: string;
  url: string;
  images: Array<{ url: string; width: number; height: number; alt: string }>;
  video?: string;
  locale: string;
  siteName: string;
  type: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export interface SEOTwitterInput {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  creator?: string;
  site?: string;
  card?: "summary" | "summary_large_image";
}

export interface SEOTwitterResult {
  card: "summary" | "summary_large_image";
  title: string;
  description: string;
  images: string[];
  creator: string;
  site: string;
}

export interface SEOSchemaInput {
  type: SchemaType;
  data: Record<string, unknown>;
  locale?: string;
  baseUrl?: string;
}

export interface SEOSchemaResult {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

export interface SEORobotsInput {
  route?: string;
  directive?: RobotsDirective;
  isProduction?: boolean;
  baseUrl?: string;
  noindexRoutes?: string[];
}

export interface SEORobotsResult {
  rules: Array<{ userAgent: string; allow?: string[]; disallow?: string[] }>;
  sitemap?: string;
}

export interface SEORobotsMetaResult {
  index: boolean;
  follow: boolean;
  archive: boolean;
  snippet: boolean;
}

export interface SEOSitemapInput {
  baseUrl: string;
  routes?: SEOSitemapRoute[];
  locale?: string;
  includeImages?: boolean;
  includeVideos?: boolean;
}

export interface SEOSitemapRoute {
  path: string;
  lastModified?: string;
  changeFrequency?: ChangeFrequency;
  priority?: number;
  locale?: string;
  image?: { url: string; title?: string; caption?: string };
  video?: { thumbnailUrl: string; title: string; description: string; contentUrl: string };
}

export interface SEOSitemapResult {
  url: string;
  lastModified: string;
  changeFrequency: string;
  priority: number;
  images?: Array<{ url: string; title?: string; caption?: string }>;
  videos?: Array<{ thumbnailUrl: string; title: string; description: string; contentUrl: string }>;
}

export interface SEOHreflangInput {
  route: string;
  locales: string[];
  baseUrl: string;
  defaultLocale?: string;
}

export interface SEOHreflangResult {
  hreflang: string;
  href: string;
  rel: "alternate";
}

export interface SEOAISearchInput {
  title: string;
  description: string;
  content?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  type?: string;
  route?: string;
  baseUrl?: string;
}

export interface SEOAISearchResult {
  llmMetadata: {
    title: string;
    summary: string;
    entities: string[];
    topics: string[];
  };
  crawlMetadata: {
    allowAI: boolean;
    indexable: boolean;
    freshness: string;
  };
  semanticMetadata: {
    description: string;
    keywords: string[];
    author: string;
    type: string;
  };
  knowledgeGraph: {
    name: string;
    description: string;
    url: string;
    sameAs?: string[];
  };
}

export interface SEOValidationInput {
  route: string;
  metadata?: SEOMetadataResult;
  canonical?: SEOCanonicalResult;
  openGraph?: SEOOpenGraphResult;
  twitter?: SEOTwitterResult;
  schema?: SEOSchemaResult[];
  robots?: SEORobotsMetaResult;
  hreflang?: SEOHreflangResult[];
}

export type ValidationIssueType = "missing" | "duplicate" | "broken" | "invalid" | "info";

export interface SEOValidationIssue {
  type: ValidationIssueType;
  severity: "error" | "warning" | "info";
  field: string;
  message: string;
  route?: string;
}

export interface SEOValidationResult {
  valid: boolean;
  issues: SEOValidationIssue[];
  score: number;
}

export interface SEORuntimeConfig {
  baseUrl: string;
  siteName: string;
  defaultLocale: string;
  supportedLocales: string[];
  defaultImage: string;
  twitterSite: string;
  twitterCreator: string;
  cacheEnabled: boolean;
  cacheTTL: number;
  cacheMaxSize: number;
}

export interface SEOPageInput {
  route: string;
  locale?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "product" | "profile";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  nofollow?: boolean;
  priority?: number;
  changeFrequency?: ChangeFrequency;
  schema?: Array<{ type: SchemaType; data: Record<string, unknown> }>;
  breadcrumbs?: Array<{ label: string; href: string }>;
  alternateLanguages?: Record<string, string>;
}

export interface SEOResolvedPage {
  metadata: SEOMetadataResult;
  canonical: SEOCanonicalResult;
  openGraph: SEOOpenGraphResult;
  twitter: SEOTwitterResult;
  schema: SEOSchemaResult[];
  robots: SEORobotsMetaResult;
  hreflang: SEOHreflangResult[];
  sitemap: SEOSitemapResult | null;
  aiSearch: SEOAISearchResult;
  validation: SEOValidationResult;
  metadataBase: string;
}
