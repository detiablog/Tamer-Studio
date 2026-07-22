import type { PlatformStats } from "./dashboard.types";
import { db } from "@/lib/db";
import { userProfile, workspace, invoice, wallet, usageRecord, creditTransaction } from "@/lib/db/schema";
import { sql, count, eq, and } from "drizzle-orm";
import { ProvidersService } from "../providers";
import { OperationsService } from "../operations";
import { MaintenanceService } from "../maintenance";

export class DashboardService {
  private providersService = new ProvidersService();
  private operationsService = new OperationsService();
  private maintenanceService = new MaintenanceService();

  async getPlatformStats(): Promise<PlatformStats> {
    const [users, workspaces, aiUsage, credits, revenue, providers, jobs, system, alerts] = await Promise.all([
      this.getUserStats(),
      this.getWorkspaceStats(),
      this.getAIUsageStats(),
      this.getCreditStats(),
      this.getRevenueStats(),
      this.getProviderStats(),
      this.getJobStats(),
      this.getSystemStats(),
      this.getAlertStats(),
    ]);

    return {
      users,
      workspaces,
      aiUsage,
      credits,
      revenue,
      providers,
      jobs,
      system,
      alerts,
    };
  }

  private async getUserStats(): Promise<PlatformStats["users"]> {
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

  private async getWorkspaceStats(): Promise<PlatformStats["workspaces"]> {
    const [totalResult, statusResult, typeResult] = await Promise.all([
      db.select({ total: count() }).from(workspace),
      db.select({
        active: sql<number>`coalesce(sum(case when ${workspace.status} = 'active' then 1 else 0 end), 0)`,
        suspended: sql<number>`coalesce(sum(case when ${workspace.status} = 'suspended' then 1 else 0 end), 0)`,
      }).from(workspace),
      db.select({
        team: sql<number>`coalesce(sum(case when ${workspace.type} = 'team' then 1 else 0 end), 0)`,
        personal: sql<number>`coalesce(sum(case when ${workspace.type} = 'personal' then 1 else 0 end), 0)`,
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

  private async getAIUsageStats(): Promise<PlatformStats["aiUsage"]> {
    const [usageResult, activeProviderCount] = await Promise.all([
      db.select({
        totalRequests: count(),
        totalTokens: sql<number>`coalesce(sum(cast(${usageRecord.tokens} as numeric)), 0)`,
        totalEstimatedCost: sql<number>`coalesce(sum(cast(${usageRecord.estimatedCost} as numeric)), 0)`,
      }).from(usageRecord),
      this.providersService.listProviders().then(providers => providers.filter(p => p.status === "active").length),
    ]);

    return {
      totalRequests: usageResult[0]?.totalRequests ?? 0,
      totalTokens: usageResult[0]?.totalTokens ?? 0,
      totalEstimatedCost: usageResult[0]?.totalEstimatedCost ?? 0,
      currency: "USD",
      activeProviders: activeProviderCount,
      failedRequests: 0,
    };
  }

  private async getCreditStats(): Promise<PlatformStats["credits"]> {
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

  private async getRevenueStats(): Promise<PlatformStats["revenue"]> {
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
      currency: "USD",
    };
  }

  private async getProviderStats(): Promise<PlatformStats["providers"]> {
    const allProviders = await this.providersService.listProviders();
    return {
      totalProviders: allProviders.length,
      activeProviders: allProviders.filter((p) => p.status === "active").length,
      unhealthyProviders: allProviders.filter((p) => p.status === "error" || p.health.status === "unhealthy").length,
      disabledProviders: allProviders.filter((p) => !p.enabled).length,
    };
  }

  private async getJobStats(): Promise<PlatformStats["jobs"]> {
    const allJobs = await this.operationsService.listJobs();
    return {
      totalJobs: allJobs.length,
      queuedJobs: allJobs.filter((j) => j.status === "queued").length,
      runningJobs: allJobs.filter((j) => j.status === "running").length,
      completedJobs: allJobs.filter((j) => j.status === "completed").length,
      failedJobs: allJobs.filter((j) => j.status === "failed").length,
    };
  }

  private async getSystemStats(): Promise<PlatformStats["system"]> {
    const maintenance = await this.maintenanceService.getStatus();
    const memUsage = process.memoryUsage();

    return {
      uptime: process.uptime(),
      memoryUsage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      cpuUsage: 0,
      diskUsage: 0,
      nodeVersion: process.version,
      env: process.env.NODE_ENV || "development",
      maintenanceMode: maintenance.mode !== "normal",
      readOnlyMode: maintenance.mode === "read_only",
    };
  }

  private async getAlertStats(): Promise<PlatformStats["alerts"]> {
    const providers = await this.providersService.listProviders();
    const alerts: PlatformStats["alerts"]["recent"] = [];

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
}
