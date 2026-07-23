import { describe, it, expect, beforeEach } from "vitest";
import { PerformanceCollector } from "@/core/observability/performance";

describe("PerformanceCollector", () => {
  let collector: PerformanceCollector;

  beforeEach(() => {
    collector = new PerformanceCollector();
  });

  it("records latency metrics", () => {
    collector.recordLatency("api.request", 120, { route: "/users" });
    const metrics = collector.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({
      name: "api.request",
      value: 120,
      unit: "ms",
      tags: { route: "/users" },
    });
  });

  it("records throughput metrics", () => {
    collector.recordThroughput("api.request", 50, { route: "/users" });
    const metrics = collector.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].value).toBe(50);
    expect(metrics[0].unit).toBe("count");
  });

  it("records error metrics", () => {
    collector.recordError("api.request", { route: "/users" });
    const metrics = collector.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].value).toBe(1);
    expect(metrics[0].tags.error).toBe("true");
  });

  it("clears all metrics", () => {
    collector.recordLatency("api.request", 100);
    collector.clear();
    expect(collector.getMetrics()).toHaveLength(0);
  });

  it("records multiple metrics independently", () => {
    collector.recordLatency("api.request", 100);
    collector.recordThroughput("api.request", 10);
    collector.recordError("api.request");
    expect(collector.getMetrics()).toHaveLength(3);
  });
});
