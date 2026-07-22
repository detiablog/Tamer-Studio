import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultProviderBenchmarkService } from '@/core/ai/benchmark/provider-benchmark';

describe('DefaultProviderBenchmarkService', () => {
  let service: DefaultProviderBenchmarkService;

  beforeEach(() => {
    service = new DefaultProviderBenchmarkService();
  });

  it('records executions and computes benchmark', () => {
    service.recordExecution({ providerId: 'prov-1', latencyMs: 100, success: true, retryCount: 0, fallbackUsed: false, estimatedCost: 0.01, timestamp: Date.now() });
    service.recordExecution({ providerId: 'prov-1', latencyMs: 200, success: true, retryCount: 1, fallbackUsed: false, estimatedCost: 0.02, timestamp: Date.now() });
    service.recordExecution({ providerId: 'prov-1', latencyMs: 300, success: false, retryCount: 0, fallbackUsed: true, estimatedCost: 0.03, timestamp: Date.now() });

    const benchmark = service.getBenchmark('prov-1');
    expect(benchmark).toBeDefined();
    expect(benchmark!.providerId).toBe('prov-1');
    expect(benchmark!.latency.avg).toBeCloseTo(200, 0);
    expect(benchmark!.failureRate).toBeCloseTo(1 / 3, 1);
    expect(benchmark!.retryRate).toBeCloseTo(1 / 3, 1);
    expect(benchmark!.avgCost).toBeCloseTo(0.02, 2);
  });

  it('returns undefined for unknown provider', () => {
    expect(service.getBenchmark('unknown')).toBeUndefined();
  });

  it('getAllBenchmarks returns all recorded benchmarks', () => {
    service.recordExecution({ providerId: 'prov-a', latencyMs: 100, success: true, retryCount: 0, fallbackUsed: false, estimatedCost: 0.01, timestamp: Date.now() });
    service.recordExecution({ providerId: 'prov-b', latencyMs: 200, success: true, retryCount: 0, fallbackUsed: false, estimatedCost: 0.02, timestamp: Date.now() });

    const all = service.getAllBenchmarks();
    expect(all).toHaveLength(2);
  });

  it('getTopProviders returns limited results', () => {
    for (let i = 0; i < 5; i++) {
      service.recordExecution({ providerId: `prov-${i}`, latencyMs: 100 + i * 10, success: true, retryCount: 0, fallbackUsed: false, estimatedCost: 0.01, timestamp: Date.now() });
    }
    const top = service.getTopProviders(3);
    expect(top).toHaveLength(3);
  });

  it('reset clears data for a provider', () => {
    service.recordExecution({ providerId: 'prov-1', latencyMs: 100, success: true, retryCount: 0, fallbackUsed: false, estimatedCost: 0.01, timestamp: Date.now() });
    service.reset('prov-1');
    expect(service.getBenchmark('prov-1')).toBeUndefined();
  });

  it('reset clears all data when no provider specified', () => {
    service.recordExecution({ providerId: 'prov-1', latencyMs: 100, success: true, retryCount: 0, fallbackUsed: false, estimatedCost: 0.01, timestamp: Date.now() });
    service.reset();
    expect(service.getAllBenchmarks()).toHaveLength(0);
  });
});
