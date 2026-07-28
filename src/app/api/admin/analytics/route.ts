import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";

export async function GET(request: NextRequest) {
  const ctx: RequestContext = {
    request,
    params: {},
    state: {
      rateLimit: undefined,
      origin: undefined,
      adminSession: undefined,
      userSession: undefined,
      authError: undefined,
      permissionError: undefined,
      csrfError: undefined,
      rateLimitError: undefined,
      auditContext: undefined,
    },
    method: "GET",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:read")], ctx);
  if (errorResponse) return errorResponse;

  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "7d";

    const now = new Date();
    const entries: Array<{
      id: string;
      date: string;
      pageViews: number;
      uniqueVisitors: number;
      bounceRate: string;
      avgDuration: string;
      conversions: number;
      revenue: number;
    }> = [];

    const days = range === "30d" ? 30 : range === "90d" ? 90 : 7;

    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const seed = d.getTime();
      const pv = Math.floor((seed % 5000) + 8000);
      const uv = Math.floor(pv * 0.65);
      const br = (25 + (seed % 15)).toFixed(1);
      const mins = 3 + (seed % 3);
      const secs = seed % 60;
      const conv = Math.floor(uv * 0.04);
      const rev = Math.floor(conv * 24.5);
      entries.push({
        id: `a_${i}`,
        date: d.toLocaleDateString("en-GB"),
        pageViews: pv,
        uniqueVisitors: uv,
        bounceRate: `${br}%`,
        avgDuration: `${mins}m ${secs}s`,
        conversions: conv,
        revenue: rev,
      });
    }

    return NextResponse.json(successResponse({ entries }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
