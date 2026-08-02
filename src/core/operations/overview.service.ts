import { alertService } from "./alert.service";
import { incidentService } from "./incident.service";
import { opsHealthService } from "./health.service";
import { deploymentService } from "./deployment.service";
import { auditService } from "./audit.service";
import { metricService } from "./metric.service";

export class OverviewService {
  async getExecutiveOverview() {
    const [health, alertStats, incidentStats, latestDeployment, latestHealth, auditStats, metricSummary] = await Promise.all([
      opsHealthService.getOverallStatus(),
      alertService.getStats(),
      incidentService.getStats(),
      deploymentService.getLatestDeployment(),
      opsHealthService.getLatestSnapshot(),
      auditService.getStats(),
      metricService.getMetricSummary(24),
    ]);

    return {
      health,
      alerts: alertStats,
      incidents: incidentStats,
      deployment: latestDeployment ? {
        version: latestDeployment.version,
        status: latestDeployment.status,
        environment: latestDeployment.environment,
        deployedAt: latestDeployment.startedAt,
      } : null,
      uptime: latestHealth?.metadata ? (latestHealth.metadata as Record<string, unknown>).uptime as number || 0 : 0,
      audit: auditStats,
      metrics: metricSummary,
    };
  }
}

export const overviewService = new OverviewService();
