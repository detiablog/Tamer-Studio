import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  emailProvider,
  emailProviderHealth,
  emailQueue,
  emailTemplate,
  emailStatistics,
  emailLog,
} from "@/lib/db/schema/email";
import { sql, count, sum, eq, gte } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";

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

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalProvidersResult,
      activeProvidersResult,
      healthyProvidersResult,
      warningProvidersResult,
      offlineProvidersResult,
      totalQueueResult,
      queuedQueueResult,
      processingQueueResult,
      failedQueueResult,
      totalTemplatesResult,
      activeTemplatesResult,
      totalLogsResult,
      todayStatsResult,
    ] = await Promise.all([
      db.select({ value: count() }).from(emailProvider),
      db.select({ value: count() }).from(emailProvider).where(eq(emailProvider.isActive, true)),
      db.select({ value: count() }).from(emailProviderHealth).where(eq(emailProviderHealth.status, "healthy")),
      db.select({ value: count() }).from(emailProviderHealth).where(eq(emailProviderHealth.status, "warning")),
      db.select({ value: count() }).from(emailProviderHealth).where(eq(emailProviderHealth.status, "offline")),
      db.select({ value: count() }).from(emailQueue),
      db.select({ value: count() }).from(emailQueue).where(eq(emailQueue.status, "queued")),
      db.select({ value: count() }).from(emailQueue).where(eq(emailQueue.status, "processing")),
      db.select({ value: count() }).from(emailQueue).where(eq(emailQueue.status, "failed")),
      db.select({ value: count() }).from(emailTemplate),
      db.select({ value: count() }).from(emailTemplate).where(eq(emailTemplate.isActive, true)),
      db.select({ value: count() }).from(emailLog),
      db.select({
        sent: sql<number>`coalesce(${sum(emailStatistics.sent)}, 0)`,
        delivered: sql<number>`coalesce(${sum(emailStatistics.delivered)}, 0)`,
        failed: sql<number>`coalesce(${sum(emailStatistics.failed)}, 0)`,
        retry: sql<number>`coalesce(${sum(emailStatistics.retry)}, 0)`,
        bounce: sql<number>`coalesce(${sum(emailStatistics.bounce)}, 0)`,
      }).from(emailStatistics).where(gte(emailStatistics.date, todayStart)),
    ]);

    return NextResponse.json({
      providers: {
        total: totalProvidersResult[0]?.value ?? 0,
        active: activeProvidersResult[0]?.value ?? 0,
      },
      health: {
        total: totalProvidersResult[0]?.value ?? 0,
        healthy: healthyProvidersResult[0]?.value ?? 0,
        warning: warningProvidersResult[0]?.value ?? 0,
        offline: offlineProvidersResult[0]?.value ?? 0,
      },
      queue: {
        total: totalQueueResult[0]?.value ?? 0,
        queued: queuedQueueResult[0]?.value ?? 0,
        processing: processingQueueResult[0]?.value ?? 0,
        failed: failedQueueResult[0]?.value ?? 0,
      },
      templates: {
        total: totalTemplatesResult[0]?.value ?? 0,
        active: activeTemplatesResult[0]?.value ?? 0,
      },
      logs: {
        total: totalLogsResult[0]?.value ?? 0,
      },
      today: {
        sent: Number(todayStatsResult[0]?.sent ?? 0),
        delivered: Number(todayStatsResult[0]?.delivered ?? 0),
        failed: Number(todayStatsResult[0]?.failed ?? 0),
        retry: Number(todayStatsResult[0]?.retry ?? 0),
        bounce: Number(todayStatsResult[0]?.bounce ?? 0),
      },
    });
  } catch (error) {
    console.error("[Admin Email Overview] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch email overview", details: String(error) },
      { status: 500 }
    );
  }
}
