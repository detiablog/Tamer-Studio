import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { generationHistoryService } from "@/core/ai/generation-history.service";
import { providerRouter } from "@/core/ai/provider-router";
import { db } from "@/lib/db";
import { aiGenerationHistory } from "@/lib/db/schema/ai-runtime";
import { sql } from "drizzle-orm";
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
    const stats = await generationHistoryService.getStats();
    const health = await providerRouter.getHealthStatus();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [creditsResult] = await db.select({ total: sql<number>`coalesce(sum(${aiGenerationHistory.creditsUsed}), 0)` }).from(aiGenerationHistory).where(sql`${aiGenerationHistory.createdAt} >= ${today}`);

    const [avgTimeResult] = await db.select({ avg: sql<number>`coalesce(avg(${aiGenerationHistory.executionTimeMs}), 0)` }).from(aiGenerationHistory).where(sql`${aiGenerationHistory.executionTimeMs} IS NOT NULL`);

    const [topModels] = await db.select({
      model: aiGenerationHistory.model,
      count: sql<number>`count(*)`,
    }).from(aiGenerationHistory).groupBy(aiGenerationHistory.model).orderBy(sql`count(*) DESC`).limit(5);

    return NextResponse.json(successResponse({
      stats,
      health,
      creditsConsumed: Number(creditsResult?.total ?? 0),
      avgGenerationTimeMs: Number(avgTimeResult?.avg ?? 0),
      topModels: topModels || [],
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
