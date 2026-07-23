import { describe, it, expect, vi, beforeEach } from "vitest";
import { InMemoryHealthDashboard } from "@/core/observability/health";
import type { HealthCheck } from "@/core/observability/health";

describe("InMemoryHealthDashboard", () => {
  let dashboard: InMemoryHealthDashboard;

  beforeEach(() => {
    dashboard = new InMemoryHealthDashboard();
  });

  it("registers and runs health checks", async () => {
    const check = vi.fn().mockResolvedValue({ name: "db", status: "healthy" } as HealthCheck);
    dashboard.registerCheck("db", check);
    const results = await dashboard.runChecks();
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("db");
    expect(results[0].status).toBe("healthy");
  });

  it("handles failing checks gracefully", async () => {
    const check = vi.fn().mockRejectedValue(new Error("Connection refused"));
    dashboard.registerCheck("db", check);
    const results = await dashboard.runChecks();
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("unhealthy");
    expect(results[0].details?.error).toBe("Check threw an exception");
  });

  it("returns summary with counts", async () => {
    dashboard.registerCheck("check-1", vi.fn().mockResolvedValue({ name: "check-1", status: "healthy" }));
    dashboard.registerCheck("check-2", vi.fn().mockResolvedValue({ name: "check-2", status: "degraded" }));
    dashboard.registerCheck("check-3", vi.fn().mockResolvedValue({ name: "check-3", status: "unhealthy" }));

    await dashboard.runChecks();
    const summary = dashboard.getSummary();
    expect(summary.healthy).toBe(1);
    expect(summary.degraded).toBe(1);
    expect(summary.unhealthy).toBe(1);
  });

  it("returns empty summary with no checks", async () => {
    const summary = dashboard.getSummary();
    expect(summary.healthy).toBe(0);
    expect(summary.degraded).toBe(0);
    expect(summary.unhealthy).toBe(0);
  });
});
