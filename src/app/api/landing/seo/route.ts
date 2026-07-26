import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getLocalizationService } from "@/lib/localization";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const locale =
      cookieStore.get("tamer_locale")?.value ||
      request.headers.get("accept-language")?.split(",")[0]?.split("-")[0] ||
      "en";

    const service = getLocalizationService();
    service.setLocale(locale as any);

    const title = service.t("marketing.seoTitle", "Tamer Studio - AI-Powered Production Platform");
    const description = service.t("marketing.seoDescription", "Build, deploy, and scale AI-powered applications with Tamer Studio. Multi-provider AI, automated production pipelines, and enterprise-grade infrastructure.");
    const keywords = service.t("marketing.seoKeywords", "AI, production platform, automation, AI providers, multi-model, enterprise AI");
    const image = service.t("marketing.seoImage", "https://tamer.studio/og-image.png");

    return NextResponse.json({
      success: true,
      data: {
        title,
        description,
        keywords,
        image,
        url: "https://tamer.studio",
        type: "website",
        locale,
        hreflangs: [
          { hreflang: "en", href: "https://tamer.studio" },
          { hreflang: "id", href: "https://tamer.studio/id" },
          { hreflang: "x-default", href: "https://tamer.studio" },
        ],
        twitter: {
          card: "summary_large_image",
          site: "@tamerstudio",
          title,
          description,
          image,
        },
        openGraph: {
          title,
          description,
          type: "website",
          url: "https://tamer.studio",
          image,
          locale,
          siteName: "Tamer Studio",
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