export interface CounterMetric {
  name: string;
  value: number;
  tags?: Record<string, string>;
}

export interface HistogramMetric {
  name: string;
  values: number[];
  unit?: string;
}

export interface SystemMetrics {
  activeUsers: number;
  apiRequestCount: number;
  authSuccessCount: number;
  authFailureCount: number;
  avgApiLatencyMs: number;
  lastUpdated: string;
}

type Snapshot = {
  apiRequestCount: number;
  authSuccessCount: number;
  authFailureCount: number;
  latencySum: number;
  latencyCount: number;
  activeUsers: number;
  lastUpdated: string;
};

class MetricsCollector {
  private counters = new Map<string, CounterMetric["value"]>();
  private snapshots: Snapshot = {
    apiRequestCount: 0,
    authSuccessCount: 0,
    authFailureCount: 0,
    latencySum: 0,
    latencyCount: 0,
    activeUsers: 0,
    lastUpdated: new Date().toISOString(),
  };

  increment(metricName: string, tags?: Record<string, string>): void {
    const key = tags ? `${metricName}:${JSON.stringify(tags)}` : metricName;
    this.counters.set(key, (this.counters.get(key) ?? 0) + 1);

    if (metricName === "api.request") {
      this.snapshots.apiRequestCount += 1;
    } else if (metricName === "auth.success") {
      this.snapshots.authSuccessCount += 1;
    } else if (metricName === "auth.failure") {
      this.snapshots.authFailureCount += 1;
    }
    this.snapshots.lastUpdated = new Date().toISOString();
  }

  observeLatency(durationMs: number): void {
    this.snapshots.latencySum += durationMs;
    this.snapshots.latencyCount += 1;
    this.snapshots.lastUpdated = new Date().toISOString();
  }

  setActiveUsers(count: number): void {
    this.snapshots.activeUsers = count;
    this.snapshots.lastUpdated = new Date().toISOString();
  }

  getCounter(name: string, tags?: Record<string, string>): number {
    const key = tags ? `${name}:${JSON.stringify(tags)}` : name;
    return this.counters.get(key) ?? 0;
  }

  getSystemMetrics(): SystemMetrics {
    const avgLatency = this.snapshots.latencyCount > 0
      ? Math.round(this.snapshots.latencySum / this.snapshots.latencyCount)
      : 0;

    return {
      activeUsers: this.snapshots.activeUsers,
      apiRequestCount: this.snapshots.apiRequestCount,
      authSuccessCount: this.snapshots.authSuccessCount,
      authFailureCount: this.snapshots.authFailureCount,
      avgApiLatencyMs: avgLatency,
      lastUpdated: this.snapshots.lastUpdated,
    };
  }

  reset(): void {
    this.counters.clear();
    this.snapshots = {
      apiRequestCount: 0,
      authSuccessCount: 0,
      authFailureCount: 0,
      latencySum: 0,
      latencyCount: 0,
      activeUsers: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const metrics = new MetricsCollector();
