import type { PlatformStats } from "./dashboard.types";
import type { AIProvider } from "../providers/providers.types";
import { DefaultDashboardRepository } from "./dashboard.repository";
import { ProvidersService } from "../providers";
import { OperationsService } from "../operations";
import { MaintenanceService } from "../maintenance";

export class DashboardService {
  private providersService = new ProvidersService();
  private operationsService = new OperationsService();
  private maintenanceService = new MaintenanceService();
  private repository = new DefaultDashboardRepository();

  async getPlatformStats(): Promise<PlatformStats> {
    const providers = await this.providersService.listProviders();
    const [users, workspaces, aiUsage, credits, revenue, alerts, jobs, system] = await Promise.all([
      this.repository.getUserStats(),
      this.repository.getWorkspaceStats(),
      this.repository.getAIUsageStats(),
      this.repository.getCreditStats(),
      this.repository.getRevenueStats(),
      this.repository.getAlerts(providers),
      this.operationsService.listJobs(),
      this.maintenanceService.getStatus(),
    ]);

    const providerStats = this.getProviderStats(providers);

    return {
      users,
      workspaces: { ...workspaces, active: providerStats.activeProviders },
      aiUsage: { ...aiUsage, activeProviders: providerStats.activeProviders, currency: "USD" },
      credits,
      revenue: { ...revenue, currency: "USD" },
      providers: providerStats,
      jobs: this.getJobStats(jobs),
      system: this.getSystemStats(system),
      alerts,
    };
  }

  private getProviderStats(allProviders: AIProvider[]): PlatformStats["providers"] {
    return {
      totalProviders: allProviders.length,
      activeProviders: allProviders.filter((p) => p.status === "active").length,
      unhealthyProviders: allProviders.filter((p) => p.status === "error" || p.health.status === "unhealthy").length,
      disabledProviders: allProviders.filter((p) => !p.enabled).length,
    };
  }

  private getJobStats(allJobs: { status: string }[]): PlatformStats["jobs"] {
    return {
      totalJobs: allJobs.length,
      queuedJobs: allJobs.filter((j) => j.status === "queued").length,
      runningJobs: allJobs.filter((j) => j.status === "running").length,
      completedJobs: allJobs.filter((j) => j.status === "completed").length,
      failedJobs: allJobs.filter((j) => j.status === "failed").length,
    };
  }

  private getSystemStats(maintenance: { mode: string }): PlatformStats["system"] {
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
}