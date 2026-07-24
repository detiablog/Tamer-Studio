import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, userProfile, workspace, job, aiProvider, creditTransaction, invoice, order, paymentIntent, auditLog, usageRecord } from "@/lib/db/schema";
import { sql, eq, gte, lt, desc, count, sum, avg, and } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";

interface AuditLogEntry {
  id: string;
  action: string;
  actorId: string | null;
  actorType: string | null;
  resourceType: string | null;
  resourceId: string | null;
  createdAt: Date | null;
}

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

  const errorResponse = await runMiddleware([
    adminAuthentication(),
    requireAdminPermission("admin:stats"),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const todayStartStr = todayStart.toISOString();
    const weekStartStr = weekStart.toISOString();
    const monthStartStr = monthStart.toISOString();
    const yearStartStr = yearStart.toISOString();

    const [
      totalUsersResult,
      activeUsersResult,
      inactiveUsersResult,
      newUsersTodayResult,
      newUsersWeekResult,
      newUsersMonthResult,
      totalWorkspacesResult,
      activeWorkspacesResult,
      archivedWorkspacesResult,
      jobStatsResult,
      revenueStatsResult,
      mrrResult,
      arrResult,
      creditsUsedResult,
      creditsPurchasedResult,
      topProviderResult,
      avgJobTimeResult,
      recentAuditLogsResult,
      aiProviderStatsResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(user),
      db.select({ count: count() }).from(userProfile).where(eq(userProfile.status, "active")),
      db.select({ count: count() }).from(userProfile).where(eq(userProfile.status, "inactive")),
      db.select({ count: count() }).from(user).where(gte(user.createdAt, todayStart)),
      db.select({ count: count() }).from(user).where(gte(user.createdAt, weekStart)),
      db.select({ count: count() }).from(user).where(gte(user.createdAt, monthStart)),
      db.select({ count: count() }).from(workspace),
      db.select({ count: count() }).from(workspace).where(eq(workspace.status, "active")),
      db.select({ count: count() }).from(workspace).where(eq(workspace.status, "archived")),
      db.select({
        total: count(),
        queued: sql<number>`sum(case when status = 'queued' then 1 else 0 end)`,
        running: sql<number>`sum(case when status = 'running' or status = 'processing' then 1 else 0 end)`,
        completed: sql<number>`sum(case when status = 'completed' then 1 else 0 end)`,
        failed: sql<number>`sum(case when status = 'failed' then 1 else 0 end)`,
        cancelled: sql<number>`sum(case when status = 'cancelled' then 1 else 0 end)`,
        avgTime: avg(sql`extract(epoch from (completed_at - started_at))`),
      }).from(job),
      db.select({
        total: sum(sql`(${order.total})::numeric`),
        today: sum(sql`case when created_at >= ${todayStartStr} then (${order.total})::numeric else 0 end`),
        month: sum(sql`case when created_at >= ${monthStartStr} then (${order.total})::numeric else 0 end`),
        year: sum(sql`case when created_at >= ${yearStartStr} then (${order.total})::numeric else 0 end`),
      }).from(order).where(eq(order.status, "paid")),
      db.select({
        mrr: sum(sql`(${invoice.total})::numeric`),
      }).from(invoice).where(and(
        gte(invoice.createdAt, monthStart),
        eq(invoice.status, "paid")
      )),
      db.select({
        arr: sum(sql`(${invoice.total})::numeric`),
      }).from(invoice).where(and(
        gte(invoice.createdAt, yearStart),
        eq(invoice.status, "paid")
      )),
      db.select({
        used: sum(sql`(${creditTransaction.amount})::numeric`),
      }).from(creditTransaction).where(eq(creditTransaction.type, "usage")),
      db.select({
        purchased: sum(sql`(${creditTransaction.amount})::numeric`),
      }).from(creditTransaction).where(eq(creditTransaction.type, "purchase")),
      db.select({
        provider: usageRecord.providerId,
        count: count(),
      }).from(usageRecord).groupBy(usageRecord.providerId).orderBy(desc(sql`count`)).limit(1),
      db.select({
        avgTime: avg(sql`(${usageRecord.executionTimeMs})::numeric`),
      }).from(usageRecord),
      db.select({
        id: auditLog.id,
        action: auditLog.action,
        actorId: auditLog.actorId,
        actorType: auditLog.actorType,
        resourceType: auditLog.resourceType,
        resourceId: auditLog.resourceId,
        createdAt: auditLog.createdAt,
      }).from(auditLog).orderBy(desc(auditLog.createdAt)).limit(10) as Promise<AuditLogEntry[]>,
      db.select({
        total: count(),
        active: sql<number>`sum(case when enabled = true then 1 else 0 end)`,
      }).from(aiProvider),
    ]);

    const totalUsers = totalUsersResult[0]?.count ?? 0;
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const newUsersPrevMonth = await db.select({ count: count() }).from(user).where(
      and(gte(user.createdAt, prevMonthStart), lt(user.createdAt, prevMonthEnd))
    );
    const newUsersThisMonth = newUsersMonthResult[0]?.count ?? 0;
    const newUsersLastMonth = newUsersPrevMonth[0]?.count ?? 0;
    const growth = newUsersLastMonth > 0 ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100) : 0;

    const parseNumber = (val: unknown) => {
      if (val == null) return 0;
      const n = parseFloat(String(val));
      return isNaN(n) ? 0 : n;
    };

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsersResult[0]?.count ?? 0,
        inactive: inactiveUsersResult[0]?.count ?? 0,
        newToday: newUsersTodayResult[0]?.count ?? 0,
        newWeek: newUsersWeekResult[0]?.count ?? 0,
        newMonth: newUsersThisMonth,
        growth,
      },
      workspaces: {
        total: totalWorkspacesResult[0]?.count ?? 0,
        active: activeWorkspacesResult[0]?.count ?? 0,
        archived: archivedWorkspacesResult[0]?.count ?? 0,
        storageUsage: "N/A",
      },
      jobs: {
        total: jobStatsResult[0]?.total ?? 0,
        queued: jobStatsResult[0]?.queued ?? 0,
        running: jobStatsResult[0]?.running ?? 0,
        completed: jobStatsResult[0]?.completed ?? 0,
        failed: jobStatsResult[0]?.failed ?? 0,
        cancelled: jobStatsResult[0]?.cancelled ?? 0,
        avgProcessingTime: jobStatsResult[0]?.avgTime ? Math.round(parseNumber(jobStatsResult[0].avgTime) / 1000) : 0,
      },
      revenue: {
        total: parseNumber(revenueStatsResult[0]?.total),
        today: parseNumber(revenueStatsResult[0]?.today),
        month: parseNumber(revenueStatsResult[0]?.month),
        year: parseNumber(revenueStatsResult[0]?.year),
        mrr: parseNumber(mrrResult[0]?.mrr),
        arr: parseNumber(arrResult[0]?.arr),
      },
      analytics: {
        totalUsers,
        newRegistrations: newUsersThisMonth,
        imagesGenerated: 0,
        videosGenerated: 0,
        creditsUsed: parseNumber(creditsUsedResult[0]?.used),
        creditsPurchased: parseNumber(creditsPurchasedResult[0]?.purchased),
        topAIProvider: topProviderResult[0]?.provider ?? "N/A",
        avgJobTime: avgJobTimeResult[0]?.avgTime ? Math.round(parseNumber(avgJobTimeResult[0].avgTime)) : 0,
      },
      auditLogs: recentAuditLogsResult.map((log: AuditLogEntry) => ({
        id: log.id,
        action: log.action,
        actorId: log.actorId,
        actorType: log.actorType,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        createdAt: log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A",
      })),
      system: {
        database: "Online",
        queue: jobStatsResult[0]?.queued === 0 ? "Healthy" : "Busy",
        aiProviders: `${aiProviderStatsResult[0]?.active ?? 0}/${aiProviderStatsResult[0]?.total ?? 0} Active`,
        storage: "N/A",
        api: "Online",
        uptime: "99.9%",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Admin Stats] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard stats",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
