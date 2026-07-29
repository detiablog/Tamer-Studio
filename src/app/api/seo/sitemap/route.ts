import { NextResponse } from "next/server";
import { getSEORuntime } from "@/core/seo";
import { logger } from "@/core/logger";

export async function GET() {
  try {
    const seoRuntime = getSEORuntime();
    const sitemapEntries = seoRuntime.resolveSitemap();

    return NextResponse.json({
      success: true,
      data: sitemapEntries,
    });
  } catch (error) {
    logger.error("[GET /api/seo/sitemap] Error:", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: "Failed to generate sitemap" },
      { status: 500 }
    );
  }
}
