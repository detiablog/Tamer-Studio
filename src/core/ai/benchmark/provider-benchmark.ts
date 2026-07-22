export interface ExecutionMetrics {
  providerId: string;
  latencyMs: number;
  success: boolean;
  retryCount: number;
  fallbackUsed: boolean;
  estimatedCost: number;
  timestamp: number;
}

export interface ProviderBenchmark {
  providerId: string;
  latency: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  availability: number;
  failureRate: number;
  retryRate: number;
  avgCost: number;
  health: "healthy" | "degraded" | "unhealthy";
  lastChecked: number;
}

export interface ProviderBenchmarkService {
  recordExecution(metrics: ExecutionMetrics): void;
  getBenchmark(providerId: string): ProviderBenchmark | undefined;
  getAllBenchmarks(): ProviderBenchmark[];
  getTopProviders(limit?: number): ProviderBenchmark[];
  reset(providerId?: string): void;
}

const MAX_SAMPLES = 1000;
const DEFAULT_LIMIT = 10;

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

export class DefaultProviderBenchmarkService implements ProviderBenchmarkService {
  private readonly samples = new Map<string, ExecutionMetrics[]>();
  private readonly healthStatus = new Map<string, "healthy" | "degraded" | "unhealthy">();

  recordExecution(metrics: ExecutionMetrics): void {
    const existing = this.samples.get(metrics.providerId) ?? [];
    existing.push(metrics);
    if (existing.length > MAX_SAMPLES) existing.splice(0, existing.length - MAX_SAMPLES);
    this.samples.set(metrics.providerId, existing);
    this.healthStatus.set(metrics.providerId, metrics.success ? "healthy" : "unhealthy");
  }

  getBenchmark(providerId: string): ProviderBenchmark | undefined {
    const samples = this.samples.get(providerId);
    if (!samples || samples.length === 0) return undefined;

    const latencies = samples.map((s) => s.latencyMs).sort((a, b) => a - b);
    const successes = samples.filter((s) => s.success).length;
    const retries = samples.filter((s) => s.retryCount > 0).length;
    const totalCost = samples.reduce((sum, s) => sum + s.estimatedCost, 0);

    return {
      providerId,
      latency: {
        avg: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        p50: percentile(latencies, 50),
        p95: percentile(latencies, 95),
        p99: percentile(latencies, 99),
      },
      availability: successes / samples.length,
      failureRate: 1 - successes / samples.length,
      retryRate: retries / samples.length,
      avgCost: totalCost / samples.length,
      health: this.healthStatus.get(providerId) ?? "healthy",
      lastChecked: Date.now(),
    };
  }

  getAllBenchmarks(): ProviderBenchmark[] {
    const benchmarks: ProviderBenchmark[] = [];
    for (const providerId of this.samples.keys()) {
      const benchmark = this.getBenchmark(providerId);
      if (benchmark) benchmarks.push(benchmark);
    }
    return benchmarks;
  }

  getTopProviders(limit = DEFAULT_LIMIT): ProviderBenchmark[] {
    return this.getAllBenchmarks()
      .sort((a, b) => a.latency.avg - b.latency.avg)
      .slice(0, limit);
  }

  reset(providerId?: string): void {
    if (providerId) {
      this.samples.delete(providerId);
      this.healthStatus.delete(providerId);
    } else {
      this.samples.clear();
      this.healthStatus.clear();
    }
  }
}
