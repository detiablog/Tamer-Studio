import type {
  SEOValidationInput,
  SEOValidationResult,
  SEOValidationIssue,
  SEOMetadataResult,
  SEOCanonicalResult,
  SEOOpenGraphResult,
  SEOTwitterResult,
  SEOSchemaResult,
  SEORobotsMetaResult,
  SEOHreflangResult,
} from "./seo.types";
import { getSEOCache } from "./seo-cache";

export class ValidationRuntime {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || "https://tamer.studio";
  }

  validate(input: SEOValidationInput): SEOValidationResult {
    const cache = getSEOCache();
    const cacheKey = cache.buildKey(["validation", input.route]);

    const cached = cache.get<SEOValidationResult>(cacheKey);
    if (cached) return cached;

    const issues: SEOValidationIssue[] = [];

    if (input.metadata) {
      issues.push(...this.validateMetadata(input.metadata, input.route));
    }

    if (input.canonical) {
      issues.push(...this.validateCanonical(input.canonical, input.route));
    }

    if (input.openGraph) {
      issues.push(...this.validateOpenGraph(input.openGraph, input.route));
    }

    if (input.twitter) {
      issues.push(...this.validateTwitter(input.twitter, input.route));
    }

    if (input.schema) {
      issues.push(...this.validateSchema(input.schema, input.route));
    }

    if (input.robots) {
      issues.push(...this.validateRobots(input.robots, input.route));
    }

    if (input.hreflang) {
      issues.push(...this.validateHreflang(input.hreflang, input.route));
    }

    const errorCount = issues.filter((i) => i.severity === "error").length;
    const warningCount = issues.filter((i) => i.severity === "warning").length;
    const score = Math.max(0, 100 - errorCount * 15 - warningCount * 5);

    const result: SEOValidationResult = {
      valid: errorCount === 0,
      issues,
      score,
    };

    cache.set(cacheKey, result, ["validation"]);
    return result;
  }

  validateMetadata(metadata: SEOMetadataResult, route?: string): SEOValidationIssue[] {
    const issues: SEOValidationIssue[] = [];

    if (!metadata.title) {
      issues.push({ type: "missing", severity: "error", field: "title", message: "Title is missing", route });
    } else if (metadata.title.length > 60) {
      issues.push({ type: "invalid", severity: "warning", field: "title", message: `Title is too long (${metadata.title.length} chars, max 60)`, route });
    }

    if (!metadata.description) {
      issues.push({ type: "missing", severity: "error", field: "description", message: "Description is missing", route });
    } else if (metadata.description.length > 160) {
      issues.push({ type: "invalid", severity: "warning", field: "description", message: `Description is too long (${metadata.description.length} chars, max 160)`, route });
    }

    if (!metadata.keywords?.length) {
      issues.push({ type: "missing", severity: "warning", field: "keywords", message: "Keywords are missing", route });
    }

    return issues;
  }

  validateCanonical(canonical: SEOCanonicalResult, route?: string): SEOValidationIssue[] {
    const issues: SEOValidationIssue[] = [];

    if (!canonical.canonical) {
      issues.push({ type: "missing", severity: "error", field: "canonical", message: "Canonical URL is missing", route });
    } else {
      try {
        const url = new URL(canonical.canonical);
        if (!url.protocol.startsWith("http")) {
          issues.push({ type: "invalid", severity: "error", field: "canonical", message: "Canonical URL must use HTTP/HTTPS", route });
        }
      } catch {
        issues.push({ type: "invalid", severity: "error", field: "canonical", message: "Canonical URL is not valid", route });
      }
    }

    return issues;
  }

  validateOpenGraph(og: SEOOpenGraphResult, route?: string): SEOValidationIssue[] {
    const issues: SEOValidationIssue[] = [];

    if (!og.title) {
      issues.push({ type: "missing", severity: "error", field: "og:title", message: "OpenGraph title is missing", route });
    }

    if (!og.description) {
      issues.push({ type: "missing", severity: "error", field: "og:description", message: "OpenGraph description is missing", route });
    }

    if (!og.url) {
      issues.push({ type: "missing", severity: "warning", field: "og:url", message: "OpenGraph URL is missing", route });
    }

    if (!og.images?.length) {
      issues.push({ type: "missing", severity: "error", field: "og:image", message: "OpenGraph image is missing", route });
    }

    if (!og.locale) {
      issues.push({ type: "missing", severity: "warning", field: "og:locale", message: "OpenGraph locale is missing", route });
    }

    return issues;
  }

  validateTwitter(twitter: SEOTwitterResult, route?: string): SEOValidationIssue[] {
    const issues: SEOValidationIssue[] = [];

    if (!twitter.title) {
      issues.push({ type: "missing", severity: "error", field: "twitter:title", message: "Twitter title is missing", route });
    }

    if (!twitter.description) {
      issues.push({ type: "missing", severity: "error", field: "twitter:description", message: "Twitter description is missing", route });
    }

    if (!twitter.images?.length) {
      issues.push({ type: "missing", severity: "warning", field: "twitter:image", message: "Twitter image is missing", route });
    }

    return issues;
  }

  validateSchema(schemas: SEOSchemaResult[], route?: string): SEOValidationIssue[] {
    const issues: SEOValidationIssue[] = [];

    if (!schemas.length) {
      issues.push({ type: "missing", severity: "warning", field: "schema", message: "No structured data found", route });
      return issues;
    }

    for (const schema of schemas) {
      if (!schema["@type"]) {
        issues.push({ type: "invalid", severity: "error", field: "schema.@type", message: "Schema type is missing", route });
      }

      if (!schema["@context"]) {
        issues.push({ type: "invalid", severity: "error", field: "schema.@context", message: "Schema context is missing", route });
      }
    }

    return issues;
  }

  validateRobots(robots: SEORobotsMetaResult, route?: string): SEOValidationIssue[] {
    const issues: SEOValidationIssue[] = [];

    if (robots.index === false && robots.follow === false) {
      issues.push({ type: "info", severity: "info", field: "robots", message: "Page is set to noindex,nofollow", route });
    }

    return issues;
  }

  validateHreflang(hreflangs: SEOHreflangResult[], route?: string): SEOValidationIssue[] {
    const issues: SEOValidationIssue[] = [];

    if (!hreflangs.length) {
      issues.push({ type: "missing", severity: "warning", field: "hreflang", message: "No hreflang tags found", route });
      return issues;
    }

    const hasXDefault = hreflangs.some((h) => h.hreflang === "x-default");
    if (!hasXDefault) {
      issues.push({ type: "missing", severity: "warning", field: "hreflang", message: "Missing x-default hreflang", route });
    }

    const hrefs = hreflangs.map((h) => h.href);
    const uniqueHrefs = new Set(hrefs);
    if (uniqueHrefs.size !== hrefs.length) {
      issues.push({ type: "duplicate", severity: "warning", field: "hreflang", message: "Duplicate hreflang href values", route });
    }

    for (const hl of hreflangs) {
      if (!hl.href) {
        issues.push({ type: "broken", severity: "error", field: "hreflang", message: `Empty href for hreflang "${hl.hreflang}"`, route });
      }
    }

    return issues;
  }

  validateAllRoutes(routes: Array<{ route: string; input: SEOValidationInput }>): SEOValidationResult[] {
    return routes.map((r) => this.validate({ ...r.input, route: r.route }));
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

let validationRuntimeInstance: ValidationRuntime | null = null;

export function getValidationRuntime(): ValidationRuntime {
  if (!validationRuntimeInstance) {
    validationRuntimeInstance = new ValidationRuntime();
  }
  return validationRuntimeInstance;
}

export function resetValidationRuntime(): void {
  validationRuntimeInstance = null;
}
