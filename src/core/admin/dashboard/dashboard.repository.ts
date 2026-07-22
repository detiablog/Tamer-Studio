import { db } from "@/lib/db";
import { userProfile, workspace, invoice, wallet, usageRecord, creditTransaction } from "@/lib/db/schema";
import { sql, count, eq, and } from "drizzle-orm";
import type { AIProvider } from "../providers/providers.types";
import type { Alert } from "./dashboard.types";

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
    teamCount: number;
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
}