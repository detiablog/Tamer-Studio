import { db } from "@/lib/db";
import { userProfile, workspace, invoice, wallet, usageRecord, creditTransaction, job, auditLog, aiProvider, order, workspaceMetrics, user } from "@/lib/db/schema";
import { sql, count, eq, and, desc, gte, lt, sum, avg } from "drizzle-orm";
import type { AIProvider } from "../providers/providers.types";
import type { Alert, AuditLogEntry } from "./dashboard.types";

export interface DashboardRepository {
  getUserStats(): Promise<{
    total: number;
    active: number;
    suspended: number;
    verified: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  }>;
  getWorkspaceStats(): Promise<{
    total: number;
    active: number;
    suspended: number;
    personalCount: number;
  }>;
  getAIUsageStats(): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalEstimatedCost: number;
    failedRequests: number;
  }>;
  getCreditStats(): Promise<{
    totalCreditsIssued: number;
    totalCreditsConsumed: number;
    totalCreditsRemaining: number;
    lowBalanceWarnings: number;
  }>;
  getRevenueStats(): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    pendingPayments: number;
    failedPayments: number;
  }>;
  getJobStats(): Promise<{
    totalJobs: number;
    queuedJobs: number;
    runningJobs: number;
    completedJobs: number;
    failedJobs: number;
    cancelledJobs: number;
    avgExecutionTime: number;
  }>;
  getAuditLogs(limit?: number): Promise<AuditLogEntry[]>;
  getSystemHealth(): Promise<{
    database: string;
    queue: string;
    aiProviders: string;
    storage: string;
    api: string;
    uptime: string;
  }>;
  getAlerts(providers: AIProvider[]): Promise<{
    critical: number;
    warning: number;
    info: number;
    recent: Alert[];
  }>;
}

export class DefaultDashboardRepository implements DashboardRepository {
  async getUserStats(): Promise<{
    total: number;
    active: number;
    suspended: number;
    verified: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(todayStart.getTime() - 29 * 24 * 60 * 60 * 1000);

    const [totalResult, statusResult, verifiedResult, newUsersResult] = await Promise.all([
      db.select({ total: count() }).from(userProfile),
      db.select({
        active: sql<number>`coalesce(sum(case when ${userProfile.status} = 'active' then 1 else 0 end), 0)`,
        suspended: sql<number>`coalesce(sum(case when ${userProfile.status} = 'suspended' then 1 else 0 end), 0)`,
      }).from(userProfile),
      db.select({ verified: sql<number>`coalesce(sum(case when ${userProfile.verificationStatus} = 'verified' then 1 else 0 end), 0)` }).from(userProfile),
      db.select({
        today: sql<number>`coalesce(sum(case when ${userProfile.createdAt} >= ${todayStart} then 1 else 0 end), 0)`,
        week: sql<number>`coalesce(sum(case when ${userProfile.createdAt} >= ${weekStart} then 1 else 0 end), 0)`,
        month: sql<number>`coalesce(sum(case when ${userProfile.createdAt} >= ${monthStart} then 1 else 0 end), 0)`,
      }).from(userProfile),
    ]);

    return {
      total: totalResult[0]?.total ?? 0,
      active: statusResult[0]?.active ?? 0,
      suspended: statusResult[0]?.suspended ?? 0,
      verified: verifiedResult[0]?.verified ?? 0,
      newToday: newUsersResult[0]?.today ?? 0,
      newThisWeek: newUsersResult[0]?.week ?? 0,
      newThisMonth: newUsersResult[0]?.month ?? 0,
    };
  }

  async getWorkspaceStats(): Promise<{
    total: number;
    active: number;
    suspended: number;
    teamCount: number;
    personalCount: number;
  }> {
    const [totalResult, statusResult, typeResult] = await Promise.all([
      db.select({ total: count() }).from(workspace),
      db.select({
        active: sql<number>`coalesce(sum(case when ${workspace.status} = 'active' then 1 else 0 end), 0)`,
        suspended: sql<number>`coalesce(sum(case when ${workspace.status} = 'suspended' then 1 else 0 end), 0)`,
      }).from(workspace),
      db.select({
        personal: sql<number>`coalesce(sum(case when ${workspace.type} = 'personal' then 1 else 0 end), 0)`,
        team: sql<number>`coalesce(sum(case when ${workspace.type} = 'team' then 1 else 0 end), 0)`,
      }).from(workspace),
    ]);

    return {
      total: totalResult[0]?.total ?? 0,
      active: statusResult[0]?.active ?? 0,
      suspended: statusResult[0]?.suspended ?? 0,
      teamCount: typeResult[0]?.team ?? 0,
      personalCount: typeResult[0]?.personal ?? 0,
    };
  }

  async getAIUsageStats(): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalEstimatedCost: number;
    failedRequests: number;
  }> {
    const usageResult = await db.select({
      totalRequests: count(),
      totalTokens: sql<number>`coalesce(sum(cast(${usageRecord.tokens} as numeric)), 0)`,
      totalEstimatedCost: sql<number>`coalesce(sum(cast(${usageRecord.estimatedCost} as numeric)), 0)`,
    }).from(usageRecord);

    return {
      totalRequests: usageResult[0]?.totalRequests ?? 0,
      totalTokens: usageResult[0]?.totalTokens ?? 0,
      totalEstimatedCost: usageResult[0]?.totalEstimatedCost ?? 0,
      failedRequests: 0,
    };
  }

  async getCreditStats(): Promise<{
    totalCreditsIssued: number;
    totalCreditsConsumed: number;
    totalCreditsRemaining: number;
    lowBalanceWarnings: number;
  }> {
    const [walletResult, consumedResult, lowBalanceResult] = await Promise.all([
      db.select({
        totalIssued: sql<number>`coalesce(sum(cast(${wallet.availableCredits} as numeric) + cast(${wallet.reservedCredits} as numeric)), 0)`,
        totalRemaining: sql<number>`coalesce(sum(cast(${wallet.availableCredits} as numeric)), 0)`,
      }).from(wallet),
      db.select({ consumed: sql<number>`coalesce(sum(cast(${creditTransaction.amount} as numeric)), 0)` }).from(creditTransaction).where(eq(creditTransaction.type, "usage_debit")),
      db.select({ warnings: count() }).from(wallet).where(sql`cast(${wallet.availableCredits} as numeric) < 100`),
    ]);

    return {
      totalCreditsIssued: walletResult[0]?.totalIssued ?? 0,
      totalCreditsConsumed: consumedResult[0]?.consumed ?? 0,
      totalCreditsRemaining: walletResult[0]?.totalRemaining ?? 0,
      lowBalanceWarnings: lowBalanceResult[0]?.warnings ?? 0,
    };
  }

  async getRevenueStats(): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    pendingPayments: number;
    failedPayments: number;
  }> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [paidResult, openResult, voidResult, monthlyResult] = await Promise.all([
      db.select({ total: sql<number>`coalesce(sum(cast(${invoice.total} as numeric)), 0)` }).from(invoice).where(eq(invoice.status, "paid")),
      db.select({ count: count() }).from(invoice).where(eq(invoice.status, "open")),
      db.select({ count: count() }).from(invoice).where(eq(invoice.status, "void")),
      db.select({ monthly: sql<number>`coalesce(sum(cast(${invoice.total} as numeric)), 0)` }).from(invoice).where(and(eq(invoice.status, "paid"), sql`${invoice.createdAt} >= ${monthStart}`)),
    ]);

    return {
      totalRevenue: paidResult[0]?.total ?? 0,
      monthlyRevenue: monthlyResult[0]?.monthly ?? 0,
      pendingPayments: openResult[0]?.count ?? 0,
      failedPayments: voidResult[0]?.count ?? 0,
    };
  }

  async getAlerts(providers: AIProvider[]): Promise<{
    critical: number;
    warning: number;
    info: number;
    recent: Alert[];
  }> {
    const alerts: Alert[] = [];

    for (const provider of providers) {
      if (provider.health.status === "unhealthy") {
        alerts.push({
          id: `alert_${provider.id}`,
          severity: "critical",
          message: `Provider ${provider.name} is unhealthy`,
          source: "providers",
          createdAt: provider.health.lastChecked,
        });
      }
    }

    return {
      critical: alerts.filter((a) => a.severity === "critical").length,
      warning: alerts.filter((a) => a.severity === "warning").length,
      info: alerts.filter((a) => a.severity === "info").length,
      recent: alerts.slice(0, 10),
    };
  }

  async getJobStats(): Promise<{
    totalJobs: number;
    queuedJobs: number;
    runningJobs: number;
    completedJobs: number;
    failedJobs: number;
    cancelledJobs: number;
    avgExecutionTime: number;
  }> {
    const [totalResult, statusResult, avgResult] = await Promise.all([
      db.select({ total: count() }).from(job),
      db.select({
        queued: sql<number>`coalesce(sum(case when ${job.status} = 'queued' then 1 else 0 end), 0)`,
        running: sql<number>`coalesce(sum(case when ${job.status} = 'running' then 1 else 0 end), 0)`,
        completed: sql<number>`coalesce(sum(case when ${job.status} = 'completed' then 1 else 0 end), 0)`,
        failed: sql<number>`coalesce(sum(case when ${job.status} = 'failed' then 1 else 0 end), 0)`,
        cancelled: sql<number>`coalesce(sum(case when ${job.status} = 'cancelled' then 1 else 0 end), 0)`,
      }).from(job),
      db.select({
        avgTime: sql<number>`coalesce(avg(extract(epoch from (${job.completedAt} - ${job.startedAt}))), 0)`,
      }).from(job).where(and(eq(job.status, "completed"), sql`${job.startedAt} is not null`, sql`${job.completedAt} is not null`)),
    ]);

    return {
      totalJobs: totalResult[0]?.total ?? 0,
      queuedJobs: statusResult[0]?.queued ?? 0,
      runningJobs: statusResult[0]?.running ?? 0,
      completedJobs: statusResult[0]?.completed ?? 0,
      failedJobs: statusResult[0]?.failed ?? 0,
      cancelledJobs: statusResult[0]?.cancelled ?? 0,
      avgExecutionTime: Math.round(avgResult[0]?.avgTime ?? 0),
    };
  }

  async getAuditLogs(limit = 20): Promise<AuditLogEntry[]> {
    const rows = await db
      .select()
      .from(auditLog)
      .orderBy(desc(auditLog.createdAt))
      .limit(limit);

    return rows.map((entry) => ({
      id: entry.id,
      action: entry.action,
      actorId: entry.actorId ?? null,
      actorType: entry.actorType ?? null,
      resourceType: entry.resourceType ?? null,
      resourceId: entry.resourceId ?? null,
      createdAt: entry.createdAt,
    }));
  }

  async getSystemHealth(): Promise<{
    uptime: string;
    memoryUsage: string;
    cpuUsage: string;
    diskUsage: number;
    nodeVersion: string;
    env: string;
    maintenanceMode?: boolean;
    readOnlyMode?: boolean;
    database: string;
    queue: string;
    aiProviders: string;
    storage: string;
    api: string;
  }> {
    try {
      await db.select({ one: sql<number>`1` }).from(userProfile).limit(1);
    } catch {
      return {
        uptime: "Unavailable",
        memoryUsage: "Unavailable",
        cpuUsage: "Unavailable",
        diskUsage: 0,
        nodeVersion: "Unavailable",
        env: process.env.NODE_ENV || "development",
        database: "Unavailable",
        queue: "Unavailable",
        aiProviders: "Unavailable",
        storage: "Unavailable",
        api: "Unavailable",
      };
    }

    const providersResult = await db.select({ count: count() }).from(aiProvider);
    const jobsQueuedResult = await db.select({ count: count() }).from(job).where(eq(job.status, "queued"));

    return {
      uptime: "Unavailable",
      memoryUsage: "Unavailable",
      cpuUsage: "Unavailable",
      diskUsage: 0,
      nodeVersion: process.version,
      env: process.env.NODE_ENV || "development",
      database: "Healthy",
      queue: jobsQueuedResult[0]?.count ? "Busy" : "Healthy",
      aiProviders: providersResult[0]?.count ? "Healthy" : "Unavailable",
      storage: "Unavailable",
      api: "Healthy",
    };
  }

  async getAdminStats(): Promise<{
    users: {
      total: number;
      active: number;
      inactive: number;
      newToday: number;
      newWeek: number;
      newMonth: number;
      growth: number;
    };
    workspaces: {
      total: number;
      active: number;
      archived: number;
    };
    jobs: {
      total: number;
      queued: number;
      running: number;
      completed: number;
      failed: number;
      cancelled: number;
      avgProcessingTime: number;
    };
    revenue: {
      total: number;
      today: number;
      month: number;
      year: number;
      mrr: number;
      arr: number;
    };
    analytics: {
      totalUsers: number;
      newRegistrations: number;
      imagesGenerated: number;
      videosGenerated: number;
      creditsUsed: number;
      creditsPurchased: number;
      topAIProvider: string;
      avgJobTime: number;
    };
    auditLogs: AuditLogEntry[];
    system: {
      uptime: string;
      memoryUsage: string;
      cpuUsage: string;
      diskUsage: number;
      nodeVersion: string;
      env: string;
      database: string;
      queue: string;
      aiProviders: string;
      storage: string;
      api: string;
    };
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsersResult,
      activeUsersResult,
      inactiveUsersResult,
      newUsersTodayResult,
      newUsersWeekResult,
      newUsersMonthResult,
      newUsersPrevMonthResult,
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
      mediaGeneratedResult,
      recentAuditLogsResult,
      aiProviderStatsResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(userProfile),
      db.select({ count: count() }).from(userProfile).where(eq(userProfile.status, "active")),
      db.select({ count: count() }).from(userProfile).where(eq(userProfile.status, "inactive")),
      db.select({ count: count() }).from(user).where(gte(user.createdAt, todayStart)),
      db.select({ count: count() }).from(user).where(gte(user.createdAt, weekStart)),
      db.select({ count: count() }).from(user).where(gte(user.createdAt, monthStart)),
      db.select({ count: count() }).from(user).where(and(gte(user.createdAt, prevMonthStart), lt(user.createdAt, prevMonthEnd))),
      db.select({ count: count() }).from(workspace),
      db.select({ count: count() }).from(workspace).where(eq(workspace.status, "active")),
      db.select({ count: count() }).from(workspace).where(eq(workspace.status, "archived")),
      db.select({
        total: count(),
        queued: sql<number>`coalesce(sum(case when ${job.status} = 'queued' then 1 else 0 end)::numeric, 0)`,
        running: sql<number>`coalesce(sum(case when ${job.status} = 'running' or ${job.status} = 'processing' then 1 else 0 end)::numeric, 0)`,
        completed: sql<number>`coalesce(sum(case when ${job.status} = 'completed' then 1 else 0 end)::numeric, 0)`,
        failed: sql<number>`coalesce(sum(case when ${job.status} = 'failed' then 1 else 0 end)::numeric, 0)`,
        cancelled: sql<number>`coalesce(sum(case when ${job.status} = 'cancelled' then 1 else 0 end)::numeric, 0)`,
        avgTime: sql<number>`coalesce(avg(extract(epoch from (${job.completedAt} - ${job.startedAt}))), 0)`,
      }).from(job),
      db.select({
        total: sum(sql`(${order.total})::numeric`),
        today: sum(sql`case when created_at >= ${todayStart.toISOString()} then (${order.total})::numeric else 0 end`),
        month: sum(sql`case when created_at >= ${monthStart.toISOString()} then (${order.total})::numeric else 0 end`),
        year: sum(sql`case when created_at >= ${yearStart.toISOString()} then (${order.total})::numeric else 0 end`),
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
        mediaGenerated: sum(sql`(${workspaceMetrics.mediaGenerated})::numeric`),
      }).from(workspaceMetrics),
      db.select({
        id: auditLog.id,
        action: auditLog.action,
        actorId: auditLog.actorId,
        actorType: auditLog.actorType,
        resourceType: auditLog.resourceType,
        resourceId: auditLog.resourceId,
        createdAt: auditLog.createdAt,
      }).from(auditLog).orderBy(desc(auditLog.createdAt)).limit(10),
      db.select({
        total: count(),
        active: sql<number>`sum(case when enabled = true then 1 else 0 end)`,
      }).from(aiProvider),
    ]);

    const newUsersThisMonth = newUsersMonthResult[0]?.count ?? 0;
    const newUsersLastMonth = newUsersPrevMonthResult[0]?.count ?? 0;
    const growth = newUsersLastMonth > 0 ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100) : 0;

    const parseNumber = (val: unknown) => {
      if (val == null) return 0;
      const n = parseFloat(String(val));
      return isNaN(n) ? 0 : n;
    };

    const mediaGenerated = parseNumber(mediaGeneratedResult[0]?.mediaGenerated);

    const jobStats = {
      total: jobStatsResult[0]?.total ?? 0,
      queued: parseNumber(jobStatsResult[0]?.queued),
      running: parseNumber(jobStatsResult[0]?.running),
      completed: parseNumber(jobStatsResult[0]?.completed),
      failed: parseNumber(jobStatsResult[0]?.failed),
      cancelled: parseNumber(jobStatsResult[0]?.cancelled),
      avgProcessingTime: jobStatsResult[0]?.avgTime ? Math.round(parseNumber(jobStatsResult[0].avgTime)) : 0,
    };

    const recentAuditLogs = recentAuditLogsResult.map((log) => ({
      id: log.id,
      action: log.action,
      actorId: log.actorId,
      actorType: log.actorType,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      createdAt: log.createdAt ? new Date(log.createdAt) : null,
      user: log.actorId || "system",
    }));

    return {
      users: {
        total: totalUsersResult[0]?.count ?? 0,
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
      },
      jobs: jobStats,
      revenue: {
        total: parseNumber(revenueStatsResult[0]?.total),
        today: parseNumber(revenueStatsResult[0]?.today),
        month: parseNumber(revenueStatsResult[0]?.month),
        year: parseNumber(revenueStatsResult[0]?.year),
        mrr: parseNumber(mrrResult[0]?.mrr),
        arr: parseNumber(arrResult[0]?.arr),
      },
      analytics: {
        totalUsers: totalUsersResult[0]?.count ?? 0,
        newRegistrations: newUsersThisMonth,
        imagesGenerated: mediaGenerated,
        videosGenerated: 0,
        creditsUsed: parseNumber(creditsUsedResult[0]?.used),
        creditsPurchased: parseNumber(creditsPurchasedResult[0]?.purchased),
        topAIProvider: topProviderResult[0]?.provider ?? "N/A",
        avgJobTime: avgJobTimeResult[0]?.avgTime ? Math.round(parseNumber(avgJobTimeResult[0].avgTime)) : 0,
      },
      auditLogs: recentAuditLogs,
      system: {
        uptime: "Unavailable",
        memoryUsage: "Unavailable",
        cpuUsage: "Unavailable",
        diskUsage: 0,
        nodeVersion: process.version,
        env: process.env.NODE_ENV || "development",
        database: "Healthy",
        queue: jobStatsResult[0]?.queued === 0 ? "Healthy" : "Busy",
        aiProviders: `${aiProviderStatsResult[0]?.active ?? 0}/${aiProviderStatsResult[0]?.total ?? 0} Active`,
        storage: "Unavailable",
        api: "Healthy",
      },
    };
  }
}