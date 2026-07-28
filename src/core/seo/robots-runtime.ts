import type { SEORobotsInput, SEORobotsResult, SEORobotsMetaResult, RobotsDirective } from "./seo.types";
import { getSEOCache } from "./seo-cache";

export class RobotsRuntime {
  private isProduction: boolean;
  private defaultNoindexRoutes: string[];

  constructor(isProduction?: boolean, noindexRoutes?: string[]) {
    this.isProduction = isProduction ?? (process.env.NODE_ENV === "production");
    this.defaultNoindexRoutes = noindexRoutes || [
      "/(dashboard)",
      "/(auth)",
      "/admin",
      "/api",
    ];
  }

  resolveRobotsTxt(input?: SEORobotsInput): SEORobotsResult {
    const cache = getSEOCache();
    const cacheKey = cache.buildKey(["robots", "txt", this.isProduction ? "prod" : "dev"]);

    const cached = cache.get<SEORobotsResult>(cacheKey);
    if (cached) return cached;

    const isProduction = input?.isProduction ?? this.isProduction;

    let result: SEORobotsResult;

    if (isProduction) {
      const noindexRoutes = input?.noindexRoutes || this.defaultNoindexRoutes;
      result = {
        rules: [
          {
            userAgent: "*",
            allow: ["/"],
            disallow: noindexRoutes,
          },
        ],
        sitemap: `${input?.baseUrl || "https://tamer.studio"}/sitemap.xml`,
      };
    } else {
      result = {
        rules: [
          {
            userAgent: "*",
            disallow: ["/", "/(dashboard)", "/(auth)", "/admin", "/api"],
          },
        ],
      };
    }

    cache.set(cacheKey, result, ["robots", "txt"]);
    return result;
  }

  resolveRobotsMeta(directive: RobotsDirective): SEORobotsMetaResult {
    const cache = getSEOCache();
    const cacheKey = cache.buildKey(["robots", "meta", directive]);

    const cached = cache.get<SEORobotsMetaResult>(cacheKey);
    if (cached) return cached;

    const result = this.parseDirective(directive);

    cache.set(cacheKey, result, ["robots", "meta"]);
    return result;
  }

  resolveRobotsForPage(input?: SEORobotsInput): SEORobotsMetaResult {
    if (input?.directive) {
      return this.resolveRobotsMeta(input.directive);
    }

    if (input?.route) {
      const noindexRoutes = input.noindexRoutes || this.defaultNoindexRoutes;
      const isNoindex = noindexRoutes.some((route) => input.route?.startsWith(route));
      if (isNoindex) {
        return this.resolveRobotsMeta("noindex,nofollow");
      }
    }

    return this.resolveRobotsMeta("index");
  }

  generateRobotsTxtString(input?: SEORobotsInput): string {
    const robots = this.resolveRobotsTxt(input);
    const lines: string[] = [];

    for (const rule of robots.rules) {
      lines.push(`User-agent: ${rule.userAgent}`);
      if (rule.allow) {
        for (const path of rule.allow) {
          lines.push(`Allow: ${path}`);
        }
      }
      if (rule.disallow) {
        for (const path of rule.disallow) {
          lines.push(`Disallow: ${path}`);
        }
      }
    }

    if (robots.sitemap) {
      lines.push("");
      lines.push(`Sitemap: ${robots.sitemap}`);
    }

    return lines.join("\n");
  }

  private parseDirective(directive: RobotsDirective): SEORobotsMetaResult {
    switch (directive) {
      case "index":
        return { index: true, follow: true, archive: true, snippet: true };
      case "noindex":
        return { index: false, follow: true, archive: true, snippet: true };
      case "nofollow":
        return { index: true, follow: false, archive: false, snippet: true };
      case "noindex,nofollow":
        return { index: false, follow: false, archive: false, snippet: false };
      case "none":
        return { index: false, follow: false, archive: false, snippet: false };
      default:
        return { index: true, follow: true, archive: true, snippet: true };
    }
  }

  getIsProduction(): boolean {
    return this.isProduction;
  }
}

let robotsRuntimeInstance: RobotsRuntime | null = null;

export function getRobotsRuntime(): RobotsRuntime {
  if (!robotsRuntimeInstance) {
    robotsRuntimeInstance = new RobotsRuntime();
  }
  return robotsRuntimeInstance;
}

export function resetRobotsRuntime(): void {
  robotsRuntimeInstance = null;
}
