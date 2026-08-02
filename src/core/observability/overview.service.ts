import { obsMetricsService } from "./metrics.service";
import { obsLoggingService } from "./logging.service";
import { obsTracingService } from "./tracing.service";
import { obsErrorService } from "./error.service";
import { obsAlertService } from "./alert.service";

export class ObsOverviewService {
  async getOverview() {
    const [metricsSummary, logStats, traceStats, errorStats, alertStats] = await Promise.all([
      obsMetricsService.summary(24),
      obsLoggingService.getStats(),
      obsTracingService.getTraceStats(),
      obsErrorService.getStats(),
      obsAlertService.getStats(),
    ]);

    return {
      metrics: { summary: metricsSummary },
      logs: logStats,
      traces: traceStats,
      errors: errorStats,
      alerts: alertStats,
      timestamp: new Date().toISOString(),
    };
  }
}

export const obsOverviewService = new ObsOverviewService();
