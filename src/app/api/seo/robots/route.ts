import { NextResponse } from "next/server";
import { getSEORuntime } from "@/core/seo";

export async function GET() {
  try {
    const seoRuntime = getSEORuntime();
    const robotsTxt = seoRuntime.resolveRobotsTxt();

    return new NextResponse(robotsTxt, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[GET /api/seo/robots] Error:", error);
    return new NextResponse("User-agent: *\nDisallow: /", {
      headers: { "Content-Type": "text/plain" },
    });
  }
}
