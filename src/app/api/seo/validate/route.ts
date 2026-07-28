import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSEORuntime } from "@/core/seo";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const route = searchParams.get("route") || "/";
    const locale = searchParams.get("locale") || "en";

    const seoRuntime = getSEORuntime();

    const resolved = await seoRuntime.resolvePage({
      route,
      locale,
    });

    const validation = resolved.validation;

    return NextResponse.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error("[GET /api/seo/validate] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate SEO" },
      { status: 500 }
    );
  }
}
