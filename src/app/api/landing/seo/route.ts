import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getSEORuntime } from "@/core/seo";
import { logger } from "@/core/logger";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tamerstudio.com";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const locale =
      cookieStore.get("tamer_locale")?.value ||
      request.headers.get("accept-language")?.split(",")[0]?.split("-")[0] ||
      "en";

    const seoRuntime = getSEORuntime();

    const resolved = await Promise.race([
      seoRuntime.resolvePage({
        route: '/',
        locale,
        title: "Tamer Studio",
        description: "Build, deploy, and scale AI-powered applications with Tamer Studio.",
        type: 'website',
        author: 'Tamer Studio',
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("SEO resolution timeout")), 5000)),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        title: resolved.metadata.title,
        description: resolved.metadata.description,
        keywords: resolved.metadata.keywords,
        image: resolved.openGraph.images[0]?.url || `${APP_URL}/og-image.svg`,
        url: resolved.openGraph.url,
        type: resolved.openGraph.type,
        locale,
        hreflangs: resolved.hreflang.map(h => ({
          hreflang: h.hreflang,
          href: h.href,
        })),
        twitter: {
          card: resolved.twitter.card,
          site: resolved.twitter.site,
          title: resolved.twitter.title,
          description: resolved.twitter.description,
          image: resolved.twitter.images[0] || '',
        },
        openGraph: {
          title: resolved.openGraph.title,
          description: resolved.openGraph.description,
          type: resolved.openGraph.type,
          url: resolved.openGraph.url,
          image: resolved.openGraph.images[0]?.url || '',
          locale: resolved.openGraph.locale,
          siteName: resolved.openGraph.siteName,
        },
      },
    });
  } catch (error) {
    logger.error("[GET /api/landing/seo] Error:", error instanceof Error ? error : undefined);
    return NextResponse.json({
      success: true,
      data: {
        title: "Tamer Studio - AI-Powered Production Platform",
        description: "Build, deploy, and scale AI-powered applications with Tamer Studio.",
        keywords: "AI, production platform, automation",
        image: `${APP_URL}/og-image.png`,
        url: APP_URL,
        type: "website",
        locale: "en",
        hreflangs: [
          { hreflang: "en", href: APP_URL },
          { hreflang: "x-default", href: APP_URL },
        ],
        twitter: {
          card: "summary_large_image",
          site: "@tamerstudio",
          title: "Tamer Studio - AI-Powered Production Platform",
          description: "Build, deploy, and scale AI-powered applications with Tamer Studio.",
          image: `${APP_URL}/og-image.png`,
        },
        openGraph: {
          title: "Tamer Studio - AI-Powered Production Platform",
          description: "Build, deploy, and scale AI-powered applications with Tamer Studio.",
          type: "website",
          url: APP_URL,
          image: `${APP_URL}/og-image.png`,
          locale: "en",
          siteName: "Tamer Studio",
        },
      },
    });
  }
}
