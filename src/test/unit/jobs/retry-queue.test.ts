import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRetryQueue } from '@/core/jobs/retry-queue';
import type { Job } from '@/core/jobs/job.types';

describe('InMemoryRetryQueue', () => {
  let queue: InMemoryRetryQueue;

  beforeEach(() => {
    queue = new InMemoryRetryQueue();
  });

  const makeJob = (id: string): Job => ({
    id,
    type: 'test',
    payload: { type: 'test', data: {} },
    status: 'queued',
    priority: 'normal',
    progress: 0,
    attempts: 1,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('enqueues and retrieves jobs', async () => {
    const job = makeJob('job-1');
    await queue.enqueueForRetry(job, 'fail');
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const result = await queue.getNext();
    expect(result).toBeDefined();
    expect(result?.id).toBe('job-1');
  });

  it('returns null when empty', async () => {
    const result = await queue.getNext();
    expect(result).toBeNull();
  });

  it('filters out jobs whose retry time has not arrived', async () => {
    await queue.enqueueForRetry(makeJob('job-1'), 'fail');
    const result = await queue.getNext();
    expect(result).toBeDefined();
    const second = await queue.getNext();
    expect(second).toBeNull();
  });
});