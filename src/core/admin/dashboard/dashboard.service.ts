import type { PlatformStats } from "./dashboard.types";
import { db } from "@/lib/db";
import { userProfile, workspace, invoice, wallet } from "@/lib/db/schema";
import { UsageService } from "@/core/usage";

export class DashboardService {
  private usageService = new UsageService();

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
    const allProfiles = await db.select().from(userProfile);
    const total = allProfiles.length;
    const active = allProfiles.filter((u) => u.status === "active").length;
    const suspended = allProfiles.filter((u) => u.status === "suspended").length;
    const verified = allProfiles.filter((u) => u.verificationStatus === "verified").length;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(todayStart.getTime() - 29 * 24 * 60 * 60 * 1000);

    const newToday = allProfiles.filter((u) => u.createdAt >= todayStart).length;
    const newThisWeek = allProfiles.filter((u) => u.createdAt >= weekStart).length;
    const newThisMonth = allProfiles.filter((u) => u.createdAt >= monthStart).length;

    return { total, active, suspended, verified, newToday, newThisWeek, newThisMonth };
  }

  private async getWorkspaceStats(): Promise<PlatformStats["workspaces"]> {
    const allWorkspaces = await db.select().from(workspace);
    const total = allWorkspaces.length;
    const active = allWorkspaces.filter((w) => w.status === "active").length;
    const suspended = allWorkspaces.filter((w) => w.status === "suspended").length;
    const teamCount = allWorkspaces.filter((w) => w.type === "team").length;
    const personalCount = allWorkspaces.filter((w) => w.type === "personal").length;

    return { total, active, suspended, teamCount, personalCount };
  }

  private async getAIUsageStats(): Promise<PlatformStats["aiUsage"]> {
    const summary = await this.usageService.getSummary();
    return {
      totalRequests: summary.totalRequests,
      totalTokens: summary.totalTokens,
      totalEstimatedCost: summary.totalEstimatedCost,
      currency: summary.currency,
      activeProviders: 0,
      failedRequests: 0,
    };
  }

  private async getCreditStats(): Promise<PlatformStats["credits"]> {
    const allWallets = await db.select().from(wallet);
    const totalCreditsIssued = allWallets.reduce((sum, w) => sum + parseInt(w.availableCredits || "0", 10) + parseInt(w.reservedCredits || "0", 10), 0);
    const totalCreditsRemaining = allWallets.reduce((sum, w) => sum + parseInt(w.availableCredits || "0", 10), 0);
    const lowBalanceWarnings = allWallets.filter((w) => parseInt(w.availableCredits || "0", 10) < 100).length;

    return {
      totalCreditsIssued,
      totalCreditsConsumed: 0,
      totalCreditsRemaining,
      lowBalanceWarnings,
    };
  }

  private async getRevenueStats(): Promise<PlatformStats["revenue"]> {
    const allInvoices = await db.select().from(invoice);
    const paidInvoices = allInvoices.filter((inv) => inv.status === "paid");
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || "0"), 0);
    const pendingPayments = allInvoices.filter((inv) => inv.status === "open").length;
    const failedPayments = allInvoices.filter((inv) => inv.status === "void").length;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = paidInvoices
      .filter((inv) => inv.createdAt >= monthStart)
      .reduce((sum, inv) => sum + parseFloat(inv.total || "0"), 0);

    return {
      totalRevenue,
      monthlyRevenue,
      pendingPayments,
      failedPayments,
      currency: "USD",
    };
  }

  private async getProviderStats(): Promise<PlatformStats["providers"]> {
    return {
      totalProviders: 0,
      activeProviders: 0,
      unhealthyProviders: 0,
      disabledProviders: 0,
    };
  }

  private async getJobStats(): Promise<PlatformStats["jobs"]> {
    return {
      totalJobs: 0,
      queuedJobs: 0,
      runningJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
    };
  }

  private async getSystemStats(): Promise<PlatformStats["system"]> {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      uptime,
      memoryUsage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      cpuUsage: 0,
      diskUsage: 0,
      nodeVersion: process.version,
      env: process.env.NODE_ENV || "development",
    };
  }

  private async getAlertStats(): Promise<PlatformStats["alerts"]> {
    return {
      critical: 0,
      warning: 0,
      info: 0,
      recent: [],
    };
  }
}
