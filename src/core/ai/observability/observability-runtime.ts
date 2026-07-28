import type { TelemetryRecord } from "../runtime/types";
import { logger } from "@/core/logger";

export interface MetricPoint {
  timestamp: string;
  value: number;
  labels?: Record<string, string>;
}

export interface MetricSeries {
  name: string;
  points: MetricPoint[];
  unit?: string;
}

export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: string;
  durationMs: number;
  status: "ok" | "error";
  tags: Record<string, string>;
  logs: Array<{ timestamp: string; message: string; fields?: Record<string, unknown> }>;
}

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  traceId?: string;
  spanId?: string;
  providerId?: string;
  metadata?: Record<string, unknown>;
}

export interface ProviderLatencyMetrics {
  providerId: string;
  p50: number;
  p90: number;
  p99: number;
  avg: number;
  min: number;
  max: number;
  sampleCount: number;
}

export interface ObservabilityRuntime {
  recordTelemetry(telemetry: TelemetryRecord): void;
  recordSpan(span: TraceSpan): void;
  recordLog(entry: LogEntry): void;
  incrementCounter(name: string, value?: number, labels?: Record<string, string>): void;
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void;
  getMetrics(name: string, sinceMs?: number): MetricSeries;
  getProviderLatency(providerId: string): ProviderLatencyMetrics | undefined;
  getAllProviderLatencies(): ProviderLatencyMetrics[];
  getTraces(traceId: string): TraceSpan[];
  getLogs(filters?: { level?: string; providerId?: string; sinceMs?: number }): LogEntry[];
  getFailureRate(providerId: string, sinceMs?: number): number;
  getSuccessRate(providerId: string, sinceMs?: number): number;
  getTokenUsage(providerId?: string, sinceMs?: number): number;
  getCostAnalytics(sinceMs?: number): { totalCost: number; byProvider: Record<string, number>; byModel: Record<string, number> };
}

export class DefaultObservabilityRuntime implements ObservabilityRuntime {
  private metrics = new Map<string, MetricPoint[]>();
  private spans: TraceSpan[] = [];
  private logs: LogEntry[] = [];
  private telemetryRecords: TelemetryRecord[] = [];
  private counters = new Map<string, number>();
  private histograms = new Map<string, number[]>();

  private readonly maxEntries = 10000;

  recordTelemetry(telemetry: TelemetryRecord): void {
    this.telemetryRecords.push(telemetry);
    if (this.telemetryRecords.length > this.maxEntries) {
      this.telemetryRecords = this.telemetryRecords.slice(-this.maxEntries);
    }

    this.recordLatencyMetric(telemetry);
    this.recordTokenMetric(telemetry);
    this.recordCostMetric(telemetry);
  }

  recordSpan(span: TraceSpan): void {
    this.spans.push(span);
    if (this.spans.length > this.maxEntries) {
      this.spans = this.spans.slice(-this.maxEntries);
    }
  }

  recordLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxEntries) {
      this.logs = this.logs.slice(-this.maxEntries);
    }
  }

  incrementCounter(name: string, value = 1, labels?: Record<string, string>): void {
    const key = this.buildMetricKey(name, labels);
    const current = this.counters.get(key) ?? 0;
    this.counters.set(key, current + value);

    this.appendMetricPoint(name, current + value, labels);
  }

  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildMetricKey(name, labels);
    const values = this.histograms.get(key) ?? [];
    values.push(value);
    if (values.length > 1000) values.shift();
    this.histograms.set(key, values);

    this.appendMetricPoint(name, value, labels);
  }

  getMetrics(name: string, sinceMs?: number): MetricSeries {
    const points = this.metrics.get(name) ?? [];
    const filtered = sinceMs
      ? points.filter((p) => new Date(p.timestamp).getTime() >= sinceMs)
      : points;

    return { name, points: [...filtered] };
  }

  getProviderLatency(providerId: string): ProviderLatencyMetrics | undefined {
    const records = this.telemetryRecords.filter(
      (r) => r.providerId === providerId && r.status === "success"
    );
    if (records.length === 0) return undefined;

    const latencies = records.map((r) => r.durationMs).sort((a, b) => a - b);
    return {
      providerId,
      p50: this.percentile(latencies, 50),
      p90: this.percentile(latencies, 90),
      p99: this.percentile(latencies, 99),
      avg: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      min: latencies[0],
      max: latencies[latencies.length - 1],
      sampleCount: latencies.length,
    };
  }

  getAllProviderLatencies(): ProviderLatencyMetrics[] {
    const providerIds = new Set(this.telemetryRecords.map((r) => r.providerId).filter(Boolean));
    return Array.from(providerIds)
      .map((id) => this.getProviderLatency(id!))
      .filter((m): m is ProviderLatencyMetrics => m !== undefined);
  }

  getTraces(traceId: string): TraceSpan[] {
    return this.spans.filter((s) => s.traceId === traceId);
  }

  getLogs(filters?: { level?: string; providerId?: string; sinceMs?: number }): LogEntry[] {
    let filtered = [...this.logs];

    if (filters?.level) {
      filtered = filtered.filter((l) => l.level === filters.level);
    }
    if (filters?.providerId) {
      filtered = filtered.filter((l) => l.providerId === filters.providerId);
    }
    if (filters?.sinceMs) {
      filtered = filtered.filter(
        (l) => new Date(l.timestamp).getTime() >= filters.sinceMs!
      );
    }

    return filtered;
  }

  getFailureRate(providerId: string, sinceMs?: number): number {
    const records = this.getRecentRecords(providerId, sinceMs);
    if (records.length === 0) return 0;
    const failures = records.filter((r) => r.status === "failure").length;
    return failures / records.length;
  }

  getSuccessRate(providerId: string, sinceMs?: number): number {
    return 1 - this.getFailureRate(providerId, sinceMs);
  }

  getTokenUsage(providerId?: string, sinceMs?: number): number {
    const records = providerId
      ? this.getRecentRecords(providerId, sinceMs)
      : this.getRecentRecords(undefined, sinceMs);
    return records.reduce((sum, r) => sum + (r.tokensUsed ?? 0), 0);
  }

  getCostAnalytics(sinceMs?: number): {
    totalCost: number;
    byProvider: Record<string, number>;
    byModel: Record<string, number>;
  } {
    const records = this.getRecentRecords(undefined, sinceMs);
    let totalCost = 0;
    const byProvider: Record<string, number> = {};
    const byModel: Record<string, number> = {};

    for (const record of records) {
      const cost = record.cost ?? 0;
      totalCost += cost;
      if (record.providerId) {
        byProvider[record.providerId] = (byProvider[record.providerId] ?? 0) + cost;
      }
      if (record.model) {
        byModel[record.model] = (byModel[record.model] ?? 0) + cost;
      }
    }

    return { totalCost, byProvider, byModel };
  }

  private recordLatencyMetric(telemetry: TelemetryRecord): void {
    if (telemetry.providerId) {
      this.appendMetricPoint(
        "provider.latency",
        telemetry.durationMs,
        { provider: telemetry.providerId }
      );
    }
  }

  private recordTokenMetric(telemetry: TelemetryRecord): void {
    if (telemetry.tokensUsed) {
      this.appendMetricPoint(
        "tokens.used",
        telemetry.tokensUsed,
        telemetry.providerId ? { provider: telemetry.providerId } : undefined
      );
    }
  }

  private recordCostMetric(telemetry: TelemetryRecord): void {
    if (telemetry.cost) {
      this.appendMetricPoint(
        "cost.incurred",
        telemetry.cost,
        telemetry.providerId ? { provider: telemetry.providerId } : undefined
      );
    }
  }

  private appendMetricPoint(name: string, value: number, labels?: Record<string, string>): void {
    const points = this.metrics.get(name) ?? [];
    points.push({
      timestamp: new Date().toISOString(),
      value,
      labels,
    });
    if (points.length > this.maxEntries) {
      points.splice(0, points.length - this.maxEntries);
    }
    this.metrics.set(name, points);
  }

  private getRecentRecords(providerId?: string, sinceMs?: number): TelemetryRecord[] {
    let filtered = [...this.telemetryRecords];
    if (providerId) {
      filtered = filtered.filter((r) => r.providerId === providerId);
    }
    if (sinceMs) {
      filtered = filtered.filter(
        (r) => new Date(r.timestamp).getTime() >= sinceMs
      );
    }
    return filtered;
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private buildMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join(",");
    return `${name}{${labelStr}}`;
  }
}

export function createObservabilityRuntime(): ObservabilityRuntime {
  return new DefaultObservabilityRuntime();
}
