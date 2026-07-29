import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSEORuntime } from "@/core/seo";
import { logger } from "@/core/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const route = searchParams.get("route") || "/";
    const locale = searchParams.get("locale") || "en";
    const title = searchParams.get("title") || undefined;
    const description = searchParams.get("description") || undefined;

    const seoRuntime = getSEORuntime();

    const resolved = await seoRuntime.resolvePage({
      route,
      locale,
      title,
      description,
    });

    return NextResponse.json({
      success: true,
      data: resolved,
    });
  } catch (error) {
    logger.error("[GET /api/seo/runtime] Error:", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: "Failed to resolve SEO data" },
      { status: 500 }
    );
  }
}
