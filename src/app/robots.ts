import { MetadataRoute } from "next";
import { config } from "@/core/config";

export default function robots(): MetadataRoute.Robots {
  const isProduction = config.app.env === "production";

  if (isProduction) {
    return {
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${config.app.url}/sitemap.xml`,
    };
  }

  return {
    rules: [
      { userAgent: "*", disallow: ["/", "/(dashboard)", "/(auth)", "/admin", "/api"] },
    ],
  };
}
