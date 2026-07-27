import type { PlatformStats } from "./dashboard.types";
import type { AIProvider } from "../providers/providers.types";
import { UserRepository } from "@/core/users/user.repository";
import { WorkspaceRepository } from "@/core/workspace/workspace.repository";
import { DefaultDashboardRepository } from "./dashboard.repository";
import { ProvidersService } from "../providers";

export class DashboardService {
  private providersService = new ProvidersService();
  private dashboardRepository = new DefaultDashboardRepository();
  private userRepository = new UserRepository();
  private workspaceRepository = new WorkspaceRepository();

  async getPlatformStats(): Promise<PlatformStats> {
    const providers = await this.providersService.listProviders();
    const [users, workspaces, aiUsage, credits, revenue, alerts, jobs, system] = await Promise.all([
      this.dashboardRepository.getUserStats(),
      this.dashboardRepository.getWorkspaceStats(),
      this.dashboardRepository.getAIUsageStats(),
      this.dashboardRepository.getCreditStats(),
      this.dashboardRepository.getRevenueStats(),
      this.dashboardRepository.getAlerts(providers),
      this.dashboardRepository.getJobStats(),
      this.dashboardRepository.getSystemHealth(),
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