import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ctx: RequestContext = {
    request, params: {},
    state: { rateLimit: undefined, origin: undefined, adminSession: undefined, userSession: undefined, authError: undefined, permissionError: undefined, csrfError: undefined, rateLimitError: undefined, auditContext: undefined },
    method: "GET", pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };
  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;
  if (!ctx.state.userSession?.userId) return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });

  return NextResponse.json(successResponse({
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    uptime: Math.round(process.uptime()),
    memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    database: process.env.DATABASE_URL ? "configured" : "not_configured",
    redis: process.env.REDIS_URL ? "configured" : "not_configured",
    storage: process.env.STORAGE_PROVIDER || "not_configured",
    aiProviders: {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      google: !!process.env.GOOGLE_AI_API_KEY,
    },
  }));
}
