import { MetadataRoute } from "next";
import { config } from "@/core/config";
import { getSEORuntime } from "@/core/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seoRuntime = getSEORuntime();
  const baseUrl = config.app.url;

  const sitemapResults = await seoRuntime.resolveSitemap();

  return sitemapResults.map((entry) => ({
    url: entry.url,
    lastModified: new Date(entry.lastModified),
    changeFrequency: entry.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: entry.priority,
  }));
}
