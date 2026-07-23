import type { Span } from "./tracing";
import type { PerformanceMetric } from "./performance";
import type { HealthCheck, HealthDashboard } from "./health";
import type { SystemMetrics } from "./metrics";

export interface TelemetryDashboard {
  getMetrics(): SystemMetrics;
  getSpans(traceId?: string): Span[];
  getPerformance(): PerformanceMetric[];
  getHealth(): Promise<HealthCheck[]>;
}

export class InMemoryTelemetryDashboard implements TelemetryDashboard {
  constructor(
    private metrics: { getSystemMetrics(): SystemMetrics },
    private tracer: { getSpans(): Span[] },
    private performance: { getMetrics(): PerformanceMetric[] },
    private health: HealthDashboard
  ) {}

  getMetrics(): SystemMetrics {
    return this.metrics.getSystemMetrics();
  }

  getSpans(traceId?: string): Span[] {
    const spans = this.tracer.getSpans();
    if (traceId) {
      return spans.filter((span) => span.traceId === traceId);
    }
    return spans;
  }

  getPerformance(): PerformanceMetric[] {
    return this.performance.getMetrics();
  }

  async getHealth(): Promise<HealthCheck[]> {
    return this.health.runChecks();
  }
}
