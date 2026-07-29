import { NextResponse } from "next/server";
import { getSEORuntime } from "@/core/seo";
import { logger } from "@/core/logger";

export async function GET() {
  try {
    const seoRuntime = getSEORuntime();
    const robotsTxt = await seoRuntime.resolveRobotsTxt();

    return new NextResponse(robotsTxt, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    logger.error("[GET /api/seo/robots] Error:", error instanceof Error ? error : undefined);
    return new NextResponse("User-agent: *\nDisallow: /", {
      headers: { "Content-Type": "text/plain" },
    });
  }
}
