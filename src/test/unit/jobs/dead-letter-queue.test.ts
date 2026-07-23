import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryDeadLetterQueue } from '@/core/jobs/dead-letter-queue';
import type { Job } from '@/core/jobs/job.types';

describe('InMemoryDeadLetterQueue', () => {
  let dlq: InMemoryDeadLetterQueue;

  beforeEach(() => {
    dlq = new InMemoryDeadLetterQueue();
  });

  const makeJob = (id: string): Job => ({
    id,
    type: 'test',
    payload: { type: 'test', data: {} },
    status: 'failed',
    priority: 'normal',
    progress: 0,
    attempts: 3,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('adds and lists jobs', async () => {
    await dlq.add(makeJob('job-1'), 'fail');
    const list = await dlq.list();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('job-1');
  });

  it('retries a job', async () => {
    await dlq.add(makeJob('job-1'), 'fail');
    await dlq.retry('job-1');
    const list = await dlq.list();
    expect(list).toHaveLength(0);
  });
});