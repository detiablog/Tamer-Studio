export interface PerformanceMetric {
  name: string;
  value: number;
  unit: "ms" | "bytes" | "count" | "percent";
  timestamp: string;
  tags: Record<string, string>;
}

export class PerformanceCollector {
  private metrics: PerformanceMetric[] = [];

  recordLatency(name: string, durationMs: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value: durationMs,
      unit: "ms",
      timestamp: new Date().toISOString(),
      tags: tags ?? {},
    });
  }

  recordThroughput(name: string, count: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value: count,
      unit: "count",
      timestamp: new Date().toISOString(),
      tags: tags ?? {},
    });
  }

  recordError(name: string, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value: 1,
      unit: "count",
      timestamp: new Date().toISOString(),
      tags: { ...tags, error: "true" },
    });
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clear(): void {
    this.metrics = [];
  }
}

export const performance = new PerformanceCollector();
