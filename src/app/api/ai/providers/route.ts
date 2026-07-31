import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { getAvailableProviders } from "@/core/ai/provider-registry";
import { providerRouter } from "@/core/ai/provider-router";
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
    const providers = getAvailableProviders();
    const healthStatus = await providerRouter.getHealthStatus();
    const healthMap = new Map(healthStatus.map(h => [h.providerId, h]));

    const enriched = providers.map(p => {
      const health = healthMap.get(p.name);
      return {
        id: p.name,
        name: p.displayName,
        enabled: p.enabled,
        models: p.models,
        status: health?.status || "unknown",
        latencyMs: health?.latencyMs || null,
        successRate: health?.successRate || "0",
        totalRequests: health?.totalRequests || 0,
        lastCheckedAt: health?.lastCheckedAt || null,
      };
    });

    return NextResponse.json(successResponse(enriched));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
