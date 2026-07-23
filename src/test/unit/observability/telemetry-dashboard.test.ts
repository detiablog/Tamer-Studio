import { describe, it, expect, vi, beforeEach } from "vitest";
import { InMemoryTelemetryDashboard } from "@/core/observability/telemetry-dashboard";
import type { Span } from "@/core/observability/tracing";
import type { PerformanceMetric } from "@/core/observability/performance";
import type { HealthCheck, HealthDashboard } from "@/core/observability/health";
import type { SystemMetrics } from "@/core/observability/metrics";

describe("InMemoryTelemetryDashboard", () => {
  let dashboard: InMemoryTelemetryDashboard;
  let mockMetrics: { getSystemMetrics: () => SystemMetrics };
  let mockTracer: { getSpans: () => Span[] };
  let mockPerformance: { getMetrics: () => PerformanceMetric[] };
  let mockHealth: HealthDashboard;

  beforeEach(() => {
    mockMetrics = {
      getSystemMetrics: vi.fn().mockReturnValue({
        activeUsers: 10,
        apiRequestCount: 100,
        authSuccessCount: 80,
        authFailureCount: 2,
        avgApiLatencyMs: 50,
        lastUpdated: new Date().toISOString(),
      } as SystemMetrics),
    };

    mockTracer = {
      getSpans: vi.fn().mockReturnValue([
        {
          id: "span-1",
          name: "test",
          traceId: "trace-1",
          startTime: new Date().toISOString(),
          status: "ok",
          attributes: {},
          events: [],
        } as Span,
      ]),
    };

    mockPerformance = {
      getMetrics: vi.fn().mockReturnValue([
        { name: "latency", value: 100, unit: "ms", timestamp: new Date().toISOString(), tags: {} } as PerformanceMetric,
      ]),
    };

    mockHealth = {
      registerCheck: vi.fn(),
      runChecks: vi.fn().mockResolvedValue([
        { name: "db", status: "healthy" } as HealthCheck,
      ]),
      getSummary: vi.fn().mockReturnValue({ healthy: 1, degraded: 0, unhealthy: 0, lastChecked: new Date().toISOString() }),
    };

    dashboard = new InMemoryTelemetryDashboard(mockMetrics, mockTracer, mockPerformance, mockHealth);
  });

  it("returns system metrics", () => {
    const metrics = dashboard.getMetrics();
    expect(metrics.apiRequestCount).toBe(100);
    expect(mockMetrics.getSystemMetrics).toHaveBeenCalled();
  });

  it("returns spans", () => {
    const spans = dashboard.getSpans();
    expect(spans).toHaveLength(1);
    expect(spans[0].name).toBe("test");
    expect(mockTracer.getSpans).toHaveBeenCalled();
  });

  it("filters spans by trace id", () => {
    const spans = dashboard.getSpans("trace-1");
    expect(spans).toHaveLength(1);
    expect(spans[0].traceId).toBe("trace-1");
  });

  it("returns performance metrics", () => {
    const metrics = dashboard.getPerformance();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe("latency");
  });

  it("returns health checks", async () => {
    const checks = await dashboard.getHealth();
    expect(checks).toHaveLength(1);
    expect(checks[0].name).toBe("db");
    expect(mockHealth.runChecks).toHaveBeenCalled();
  });
});
