import { MetadataRoute } from "next";
import { config } from "@/core/config";

const baseUrl = config.app.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const marketing = [
    "/",
    "/features",
    "/pricing",
    "/blog",
    "/roadmap",
    "/careers",
    "/support",
    "/docs",
    "/about",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
  ];

  return marketing.map((path) => ({
    url: new URL(path, baseUrl).toString(),
    lastModified: new Date("2026-07-25"),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
