import { describe, it, expect, vi } from 'vitest';
import { DefaultCircuitBreaker } from '@/core/ai/breaker/circuit-breaker';

describe('DefaultCircuitBreaker', () => {
  it('allows request when closed', () => {
    const breaker = new DefaultCircuitBreaker();
    expect(breaker.allowRequest('prov-1')).toBe(true);
  });

  it('blocks request when open after failures', () => {
    const breaker = new DefaultCircuitBreaker();
    for (let i = 0; i < 5; i++) {
      breaker.recordFailure('prov-1');
    }
    expect(breaker.allowRequest('prov-1')).toBe(false);
    expect(breaker.getState('prov-1')).toBe('open');
  });

  it('allows request when half-open and succeeds', async () => {
    vi.useFakeTimers();

    try {
      const breaker = new DefaultCircuitBreaker();

      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('prov-1');
      }
      expect(breaker.getState('prov-1')).toBe('open');

      await vi.advanceTimersByTimeAsync(30000);

      expect(breaker.allowRequest('prov-1')).toBe(true);
      expect(breaker.getState('prov-1')).toBe('half-open');

      breaker.recordSuccess('prov-1');
      breaker.recordSuccess('prov-1');
      expect(breaker.getState('prov-1')).toBe('closed');
    } finally {
      vi.useRealTimers();
    }
  });
});
