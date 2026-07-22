import type { PlatformStats } from "./dashboard.types";
import { db } from "@/lib/db";
import { userProfile, workspace, invoice, wallet, usageRecord } from "@/lib/db/schema";
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
    const allRecords = await db.select().from(usageRecord);
    const totalRequests = allRecords.length;
    const totalTokens = allRecords.reduce((sum, r) => sum + parseInt(r.tokens || "0", 10), 0);
    const totalEstimatedCost = allRecords.reduce((sum, r) => sum + parseFloat(r.estimatedCost || "0"), 0);

    return {
      totalRequests,
      totalTokens,
      totalEstimatedCost,
      currency: "USD",
      activeProviders: (await this.providersService.listProviders()).filter((p) => p.status === "active").length,
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
      totalCreditsConsumed: totalCreditsIssued - totalCreditsRemaining,
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
