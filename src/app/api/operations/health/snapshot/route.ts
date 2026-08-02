import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { opsHealthService } from "@/core/operations/health.service";

export async function POST(request: NextRequest) {
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
    method: "POST",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const snapshot = await opsHealthService.takeSnapshot({
      overallStatus: body.overallStatus,
      databaseStatus: body.databaseStatus,
      redisStatus: body.redisStatus,
      storageStatus: body.storageStatus,
      aiRuntimeStatus: body.aiRuntimeStatus,
      smtpStatus: body.smtpStatus,
      queueStatus: body.queueStatus,
      workerStatus: body.workerStatus,
      databaseLatencyMs: body.databaseLatencyMs,
      redisLatencyMs: body.redisLatencyMs,
      totalUsers: body.totalUsers,
      activeUsers: body.activeUsers,
      totalSessions: body.totalSessions,
      cpuUsage: body.cpuUsage,
      memoryUsage: body.memoryUsage,
      diskUsage: body.diskUsage,
      metadata: body.metadata,
    });
    return NextResponse.json(successResponse(snapshot), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
