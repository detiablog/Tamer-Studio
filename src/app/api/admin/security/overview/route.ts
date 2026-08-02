import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { db } from "@/lib/db";
import { secEvent, secIncident } from "@/lib/db/schema/security";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { count, eq, and, gte, sql } from "drizzle-orm";

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalEventsResult] = await db.select({ value: count() }).from(secEvent);
    const totalEvents = totalEventsResult?.value || 0;

    const [todayEventsResult] = await db.select({ value: count() }).from(secEvent).where(gte(secEvent.createdAt, today));
    const todayEvents = todayEventsResult?.value || 0;

    const [criticalEventsResult] = await db.select({ value: count() }).from(secEvent).where(eq(secEvent.severity, "critical"));
    const criticalEvents = criticalEventsResult?.value || 0;

    const [openIncidentsResult] = await db.select({ value: count() }).from(secIncident).where(sql`${secIncident.status} != 'resolved'`);
    const openIncidents = openIncidentsResult?.value || 0;

    const [totalIncidentsResult] = await db.select({ value: count() }).from(secIncident);
    const totalIncidents = totalIncidentsResult?.value || 0;

    const [failedLoginsResult] = await db.select({ value: count() }).from(secEvent).where(
      and(eq(secEvent.eventType, "failed_login"), gte(secEvent.createdAt, today))
    );
    const failedLogins = failedLoginsResult?.value || 0;

    const [rateLimitHitsResult] = await db.select({ value: count() }).from(secEvent).where(
      and(eq(secEvent.eventType, "rate_limit_exceeded"), gte(secEvent.createdAt, today))
    );
    const rateLimitHits = rateLimitHitsResult?.value || 0;

    const [totalAuditResult] = await db.select({ value: count() }).from(secEvent);
    const totalAuditEntries = totalAuditResult?.value || 0;

    const threatLevel = criticalEvents > 5 ? "high" : criticalEvents > 2 ? "medium" : "low";
    const securityScore = Math.max(0, 100 - (criticalEvents * 10) - (openIncidents * 5) - Math.min(failedLogins, 20));

    return NextResponse.json(successResponse({
      stats: {
        totalEvents,
        todayEvents,
        criticalEvents,
        openIncidents,
        totalIncidents,
        failedLogins,
        rateLimitHits,
        totalAuditEntries,
      },
      threatLevel,
      securityScore,
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
