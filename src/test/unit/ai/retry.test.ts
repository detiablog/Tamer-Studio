import { describe, it, expect } from 'vitest';
import { DefaultRetryManager } from '@/core/ai/retry/retry-manager';

describe('DefaultRetryManager', () => {
  it('succeeds on first attempt', async () => {
    const manager = new DefaultRetryManager();
    let attempts = 0;

    const result = await manager.execute(
      async () => {
        attempts++;
        return 'success';
      },
      { maxAttempts: 3, backoffMs: 1, maxBackoffMs: 1 }
    );

    expect(result).toBe('success');
    expect(attempts).toBe(1);
  });

  it('retries on failure then succeeds', async () => {
    const manager = new DefaultRetryManager();
    let attempts = 0;

    const result = await manager.execute(
      async () => {
        attempts++;
        if (attempts === 1) {
          const error = new Error('rate_limit') as any;
          error.code = 'rate_limit';
          throw error;
        }
        return 'success';
      },
      { maxAttempts: 3, backoffMs: 1, maxBackoffMs: 1, retryableErrors: ['rate_limit'] }
    );

    expect(result).toBe('success');
    expect(attempts).toBe(2);
  });

  it('throws after max attempts', async () => {
    const manager = new DefaultRetryManager();

    await expect(
      manager.execute(
        async () => {
          const error = new Error('rate_limit') as any;
          error.code = 'rate_limit';
          throw error;
        },
        { maxAttempts: 2, backoffMs: 1, maxBackoffMs: 1, retryableErrors: ['rate_limit'] }
      )
    ).rejects.toThrow('rate_limit');
  });
});
