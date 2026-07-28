import { NextResponse } from "next/server";
import { getSEORuntime } from "@/core/seo";

export async function GET() {
  try {
    const seoRuntime = getSEORuntime();
    const sitemapEntries = seoRuntime.resolveSitemap();

    return NextResponse.json({
      success: true,
      data: sitemapEntries,
    });
  } catch (error) {
    console.error("[GET /api/seo/sitemap] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate sitemap" },
      { status: 500 }
    );
  }
}
