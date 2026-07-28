import { MetadataRoute } from "next";
import { config } from "@/core/config";
import { getSEORuntime } from "@/core/seo";

export default function robots(): MetadataRoute.Robots {
  const seoRuntime = getSEORuntime();
  const isProduction = config.app.env === "production";

  const robotsResult = seoRuntime.getRobotsRuntime().resolveRobotsTxt({
    isProduction,
    baseUrl: config.app.url,
  });

  return {
    rules: robotsResult.rules.map((rule) => ({
      userAgent: rule.userAgent,
      allow: rule.allow,
      disallow: rule.disallow,
    })),
    sitemap: robotsResult.sitemap,
  };
}
