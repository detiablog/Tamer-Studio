import type { PlatformStats } from "./dashboard.types";
import type { AIProvider } from "../providers/providers.types";
import { DefaultDashboardRepository } from "./dashboard.repository";
import { ProvidersService } from "../providers";

export class DashboardService {
  private providersService = new ProvidersService();
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
      this.repository.getJobStats(),
      this.repository.getSystemHealth(),
    ]);

    const providerStats = this.getProviderStats(providers);

    return {
      users,
      workspaces,
      aiUsage: { ...aiUsage, activeProviders: providerStats.activeProviders, currency: "USD" },
      credits,
      revenue: { ...revenue, currency: "USD" },
      providers: providerStats,
      jobs,
      system,
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
}
