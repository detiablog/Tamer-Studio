import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getSEORuntime } from "@/core/seo";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const locale =
      cookieStore.get("tamer_locale")?.value ||
      request.headers.get("accept-language")?.split(",")[0]?.split("-")[0] ||
      "en";

    const seoRuntime = getSEORuntime();

    const metadataResult = seoRuntime.resolveMetadata({
      route: '/',
      locale,
    });

    const resolved = await seoRuntime.resolvePage({
      route: '/',
      locale,
      title: metadataResult.title,
      description: metadataResult.description,
      type: 'website',
      author: 'Tamer Studio',
    });

    return NextResponse.json({
      success: true,
      data: {
        title: resolved.metadata.title,
        description: resolved.metadata.description,
        keywords: resolved.metadata.keywords,
        image: resolved.openGraph.images[0]?.url || 'https://tamer.studio/og-image.svg',
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
    console.error("[GET /api/landing/seo] Error:", error);
    return NextResponse.json({
      success: true,
      data: {
        title: "Tamer Studio - AI-Powered Production Platform",
        description: "Build, deploy, and scale AI-powered applications with Tamer Studio.",
        keywords: "AI, production platform, automation",
        image: "https://tamer.studio/og-image.png",
        url: "https://tamer.studio",
        type: "website",
        locale: "en",
        hreflangs: [
          { hreflang: "en", href: "https://tamer.studio" },
          { hreflang: "x-default", href: "https://tamer.studio" },
        ],
        twitter: {
          card: "summary_large_image",
          site: "@tamerstudio",
          title: "Tamer Studio - AI-Powered Production Platform",
          description: "Build, deploy, and scale AI-powered applications with Tamer Studio.",
          image: "https://tamer.studio/og-image.png",
        },
        openGraph: {
          title: "Tamer Studio - AI-Powered Production Platform",
          description: "Build, deploy, and scale AI-powered applications with Tamer Studio.",
          type: "website",
          url: "https://tamer.studio",
          image: "https://tamer.studio/og-image.png",
          locale: "en",
          siteName: "Tamer Studio",
        },
      },
    });
  }
}
