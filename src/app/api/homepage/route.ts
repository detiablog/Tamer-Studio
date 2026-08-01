import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getHomepageRuntime } from "@/core/homepage";
import type { HomepageContext } from "@/core/homepage";
import { logger } from "@/core/logger";

function detectDevice(userAgent: string | null): "desktop" | "tablet" | "mobile" {
  if (!userAgent) return "desktop";
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod/.test(ua)) return "mobile";
  if (/tablet|ipad/.test(ua)) return "tablet";
  return "desktop";
}

function detectLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("tamer_locale")?.value;
  if (cookieLocale) return cookieLocale;
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const primary = acceptLanguage.split(",")[0]?.split("-")[0];
    if (primary && ["en", "id", "ja", "fr", "de"].includes(primary)) {
      return primary;
    }
  }
  return "en";
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get("locale") || detectLocale(request);
    const device = searchParams.get("device") as "desktop" | "tablet" | "mobile" | null;
    const isPreview = searchParams.get("preview") === "true";
    const previewMode = searchParams.get("previewMode") as "published" | "draft" | "responsive" | "locale" | null;

    const userAgent = request.headers.get("user-agent");
    const detectedDevice = device || detectDevice(userAgent);

    const context: HomepageContext = {
      locale,
      currency: searchParams.get("currency") || "USD",
      country: searchParams.get("country"),
      timezone: searchParams.get("timezone"),
      role: null,
      permissions: [],
      featureFlags: [],
      workspace: null,
      isPreview,
      previewMode: previewMode || undefined,
      device: detectedDevice,
    };

    const runtime = getHomepageRuntime();
    const resolution = await runtime.resolveHomepage(context);
    const metadata = runtime.generateMetadata(resolution);

    return NextResponse.json({
      success: true,
      data: {
        sections: resolution.sections.filter((s) => s.visible),
        metadata,
        seo: resolution.seo,
        navigation: resolution.navigation,
        localization: resolution.localization,
        performance: runtime.getPerformanceConfig(),
        resolvedAt: resolution.resolvedAt,
      },
    });
  } catch (error) {
    logger.error("[GET /api/homepage] Error:", error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to resolve homepage",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { options, context: overrideContext } = body;

    const userAgent = request.headers.get("user-agent");
    const locale = detectLocale(request);

    const context: HomepageContext = {
      locale,
      currency: "USD",
      country: null,
      timezone: null,
      role: null,
      permissions: [],
      featureFlags: [],
      workspace: null,
      isPreview: true,
      previewMode: options?.mode || "draft",
      device: detectDevice(userAgent),
      ...overrideContext,
    };

    const runtime = getHomepageRuntime();
    const resolution = await runtime.resolvePreview(
      {
        mode: options?.mode || "draft",
        locale: options?.locale || locale,
        device: options?.device || context.device,
        version: options?.version,
      },
      context
    );

    const metadata = runtime.generateMetadata(resolution);

    return NextResponse.json({
      success: true,
      data: {
        sections: resolution.sections,
        metadata,
        seo: resolution.seo,
        navigation: resolution.navigation,
        localization: resolution.localization,
        resolvedAt: resolution.resolvedAt,
      },
    });
  } catch (error) {
    logger.error("[POST /api/homepage] Error:", error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to resolve homepage preview",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
