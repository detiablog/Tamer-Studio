export interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  details?: Record<string, unknown>;
  checkedAt: string;
}

export interface HealthDashboard {
  registerCheck(name: string, check: () => Promise<HealthCheck>): void;
  runChecks(): Promise<HealthCheck[]>;
  getSummary(): { healthy: number; degraded: number; unhealthy: number; lastChecked: string };
}

export class InMemoryHealthDashboard implements HealthDashboard {
  private checks = new Map<string, () => Promise<HealthCheck>>();
  private lastResults: HealthCheck[] = [];

  registerCheck(name: string, check: () => Promise<HealthCheck>): void {
    this.checks.set(name, check);
  }

  async runChecks(): Promise<HealthCheck[]> {
    const results: HealthCheck[] = [];

    for (const [, checkFn] of this.checks) {
      try {
        const result = await checkFn();
        results.push(result);
      } catch {
        results.push({
          name: "unknown",
          status: "unhealthy",
          details: { error: "Check threw an exception" },
          checkedAt: new Date().toISOString(),
        });
      }
    }

    this.lastResults = results;
    return results;
  }

  getSummary(): { healthy: number; degraded: number; unhealthy: number; lastChecked: string } {
    let healthy = 0;
    let degraded = 0;
    let unhealthy = 0;
    let lastChecked = new Date().toISOString();

    for (const check of this.lastResults) {
      if (check.status === "healthy") healthy += 1;
      else if (check.status === "degraded") degraded += 1;
      else if (check.status === "unhealthy") unhealthy += 1;
      if (new Date(check.checkedAt).getTime() > new Date(lastChecked).getTime()) {
        lastChecked = check.checkedAt;
      }
    }

    return { healthy, degraded, unhealthy, lastChecked };
  }
}

export const healthDashboard = new InMemoryHealthDashboard();
