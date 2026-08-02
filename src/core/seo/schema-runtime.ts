import type { SEOSchemaInput, SEOSchemaResult, SchemaType } from "./seo.types";
import { getSEOCache } from "./seo-cache";

export class SchemaRuntime {
  private baseUrl: string;
  private siteName: string;

  constructor(baseUrl?: string, siteName?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://tamerstudio.com";
    this.siteName = siteName || "Tamer Studio";
  }

  async resolve(input: SEOSchemaInput): Promise<SEOSchemaResult> {
    const cache = getSEOCache();
    const cacheKey = cache.buildKey(["schema", input.type, input.locale ?? "en"]);

    const cached = await cache.get<SEOSchemaResult>(cacheKey);
    if (cached) return cached;

    let result: SEOSchemaResult;

    switch (input.type) {
      case "Organization":
        result = this.buildOrganization(input.data);
        break;
      case "Website":
        result = this.buildWebsite(input.data);
        break;
      case "WebPage":
        result = this.buildWebPage(input.data);
        break;
      case "BreadcrumbList":
        result = this.buildBreadcrumbList(input.data);
        break;
      case "FAQPage":
        result = this.buildFAQPage(input.data);
        break;
      case "Article":
        result = this.buildArticle(input.data);
        break;
      case "SoftwareApplication":
        result = this.buildSoftwareApplication(input.data);
        break;
      case "Product":
        result = this.buildProduct(input.data);
        break;
      case "VideoObject":
        result = this.buildVideoObject(input.data);
        break;
      case "ImageObject":
        result = this.buildImageObject(input.data);
        break;
      default:
        result = { "@context": "https://schema.org", "@type": input.type, ...input.data };
    }

    await cache.set(cacheKey, result, { tags: ["schema", input.type] });
    return result;
  }

  async resolveForPage(schemas: SEOSchemaInput[]): Promise<SEOSchemaResult[]> {
    return Promise.all(schemas.map((s) => this.resolve(s)));
  }

  async resolveOrganization(data?: Record<string, unknown>): Promise<SEOSchemaResult> {
    return this.resolve({ type: "Organization", data: data || {} });
  }

  async resolveWebsite(data?: Record<string, unknown>): Promise<SEOSchemaResult> {
    return this.resolve({ type: "Website", data: data || {} });
  }

  async resolveBreadcrumbs(items: Array<{ label: string; href: string }>): Promise<SEOSchemaResult> {
    return this.resolve({
      type: "BreadcrumbList",
      data: {
        items: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          item: item.href.startsWith("http") ? item.href : `${this.baseUrl}${item.href}`,
        })),
      },
    });
  }

  async resolveFAQ(questions: Array<{ question: string; answer: string }>): Promise<SEOSchemaResult> {
    return this.resolve({
      type: "FAQPage",
      data: {
        mainEntity: questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      },
    });
  }

  async resolveArticle(data: {
    title: string;
    description: string;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    image?: string;
    url?: string;
  }): Promise<SEOSchemaResult> {
    return this.resolve({
      type: "Article",
      data,
    });
  }

  async generateSchemasForPage(options: {
    includeOrganization?: boolean;
    includeWebsite?: boolean;
    breadcrumbs?: Array<{ label: string; href: string }>;
    faq?: Array<{ question: string; answer: string }>;
    article?: { title: string; description: string; author?: string; publishedTime?: string; modifiedTime?: string; image?: string; url?: string };
  }): Promise<SEOSchemaResult[]> {
    const schemas: SEOSchemaResult[] = [];

    if (options.includeOrganization) {
      schemas.push(await this.resolveOrganization());
    }

    if (options.includeWebsite) {
      schemas.push(await this.resolveWebsite());
    }

    if (options.breadcrumbs?.length) {
      schemas.push(await this.resolveBreadcrumbs(options.breadcrumbs));
    }

    if (options.faq?.length) {
      schemas.push(await this.resolveFAQ(options.faq));
    }

    if (options.article) {
      schemas.push(await this.resolveArticle(options.article));
    }

    return schemas;
  }

  private buildOrganization(data: Record<string, unknown>): SEOSchemaResult {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: (data.name as string) || this.siteName,
      url: (data.url as string) || this.baseUrl,
      description: (data.description as string) || `${this.siteName} is an AI-first production operating system.`,
      logo: (data.logo as string) || `${this.baseUrl}/favicon.svg`,
      contactPoint: data.contactPoint || {
        "@type": "ContactPoint",
        email: "support@tamerstudio.com",
        contactType: "customer support",
        availableLanguage: ["English", "Bahasa Indonesia"],
      },
      ...data,
    };
  }

  private buildWebsite(data: Record<string, unknown>): SEOSchemaResult {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: (data.name as string) || this.siteName,
      url: (data.url as string) || this.baseUrl,
      description: (data.description as string) || `${this.siteName} is an AI-first production operating system.`,
      potentialAction: data.potentialAction || {
        "@type": "SearchAction",
        target: `${this.baseUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
      ...data,
    };
  }

  private buildWebPage(data: Record<string, unknown>): SEOSchemaResult {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: (data.name as string) || this.siteName,
      url: (data.url as string) || this.baseUrl,
      description: (data.description as string) || "",
      isPartOf: {
        "@type": "WebSite",
        name: this.siteName,
        url: this.baseUrl,
      },
      ...data,
    };
  }

  private buildBreadcrumbList(data: Record<string, unknown>): SEOSchemaResult {
    const items = (data.items as Array<Record<string, unknown>>) || [];
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name || "",
        item: item.item || "",
      })),
    };
  }

  private buildFAQPage(data: Record<string, unknown>): SEOSchemaResult {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data.mainEntity || [],
    };
  }

  private buildArticle(data: Record<string, unknown>): SEOSchemaResult {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: data.title || data.headline || "",
      description: data.description || "",
      author: data.author ? {
        "@type": "Person",
        name: data.author,
      } : {
        "@type": "Organization",
        name: this.siteName,
      },
      publisher: {
        "@type": "Organization",
        name: this.siteName,
        logo: {
          "@type": "ImageObject",
          url: `${this.baseUrl}/favicon.svg`,
        },
      },
      datePublished: data.publishedTime || data.datePublished || new Date().toISOString(),
      dateModified: data.modifiedTime || data.dateModified || new Date().toISOString(),
      image: data.image || `${this.baseUrl}/og-image.svg`,
      url: data.url || this.baseUrl,
      ...data,
    };
  }

  private buildSoftwareApplication(data: Record<string, unknown>): SEOSchemaResult {
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: (data.name as string) || this.siteName,
      url: (data.url as string) || this.baseUrl,
      description: (data.description as string) || "",
      applicationCategory: (data.applicationCategory as string) || "BusinessApplication",
      operatingSystem: data.operatingSystem || "Web",
      ...data,
    };
  }

  private buildProduct(data: Record<string, unknown>): SEOSchemaResult {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: (data.name as string) || this.siteName,
      description: (data.description as string) || "",
      ...data,
    };
  }

  private buildVideoObject(data: Record<string, unknown>): SEOSchemaResult {
    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: (data.name as string) || "",
      description: (data.description as string) || "",
      thumbnailUrl: data.thumbnailUrl || "",
      uploadDate: data.uploadDate || new Date().toISOString(),
      ...data,
    };
  }

  private buildImageObject(data: Record<string, unknown>): SEOSchemaResult {
    return {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      url: (data.url as string) || "",
      caption: (data.caption as string) || "",
      ...data,
    };
  }
}

let schemaRuntimeInstance: SchemaRuntime | null = null;

export function getSchemaRuntime(): SchemaRuntime {
  if (!schemaRuntimeInstance) {
    schemaRuntimeInstance = new SchemaRuntime();
  }
  return schemaRuntimeInstance;
}

export function resetSchemaRuntime(): void {
  schemaRuntimeInstance = null;
}
