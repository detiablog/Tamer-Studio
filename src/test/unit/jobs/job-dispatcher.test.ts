import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryJobDispatcher } from '@/core/jobs/job-dispatcher';
import { InMemoryRetryQueue } from '@/core/jobs/retry-queue';
import { InMemoryDeadLetterQueue } from '@/core/jobs/dead-letter-queue';
import type { Job, JobQueue, JobStatus } from '@/core/jobs/job.types';

class SimpleJobQueue implements JobQueue {
  private items: Array<{ job: Job; workerType: string }> = [];

  async enqueue(job: Job): Promise<string> {
    this.items.push({ job: { ...job }, workerType: job.type });
    return job.id;
  }

  async dequeue(workerType: string): Promise<Job | null> {
    const idx = this.items.findIndex((item) => item.workerType === workerType && item.job.status === 'queued');
    if (idx === -1) return null;
    const entry = this.items[idx];
    entry.job.status = 'processing';
    return entry.job;
  }

  async ack(_jobId: string): Promise<void> {}
  async nack(_jobId: string, _error: string): Promise<void> {}
  async getStatus(_jobId: string): Promise<JobStatus | null> {
    const entry = this.items.find((item) => item.job.id === _jobId);
    return entry ? entry.job.status : null;
  }
  async updateProgress(_jobId: string, _progress: number): Promise<void> {
    const entry = this.items.find((item) => item.job.id === _jobId);
    if (entry) entry.job.progress = _progress;
  }
  size(): number {
    return this.items.length;
  }
}

describe('InMemoryJobDispatcher', () => {
  let dispatcher: InMemoryJobDispatcher;
  let queue: SimpleJobQueue;
  let retryQueue: InMemoryRetryQueue;
  let dlq: InMemoryDeadLetterQueue;

  beforeEach(() => {
    queue = new SimpleJobQueue();
    retryQueue = new InMemoryRetryQueue();
    dlq = new InMemoryDeadLetterQueue();
    dispatcher = new InMemoryJobDispatcher(queue, retryQueue, dlq);
  });

  const makeJob = (id: string, type: string, maxAttempts = 3): Job => ({
    id,
    type,
    payload: { type, data: {} },
    status: 'queued',
    priority: 'normal',
    progress: 0,
    attempts: 0,
    maxAttempts,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('dispatches a job to a worker', async () => {
    const processed: string[] = [];
    dispatcher.registerWorker({
      type: 'test',
      process: async (job: Job) => { processed.push(job.id); },
    });

    const job = makeJob('job-1', 'test');
    await dispatcher.dispatch(job);
    await dispatcher.start();
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await dispatcher.stop();

    expect(processed).toContain('job-1');
  });

  it('retries failed jobs once before succeeding', async () => {
    let attempts = 0;
    dispatcher.registerWorker({
      type: 'flaky',
      process: async () => {
        attempts += 1;
        if (attempts < 2) throw new Error('fail');
      },
    });

    const job = makeJob('job-1', 'flaky');
    await dispatcher.dispatch(job);
    await dispatcher.start();
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await dispatcher.stop();

    expect(attempts).toBe(2);
  });

  it('moves job to dead letter queue after max attempts', async () => {
    dispatcher.registerWorker({
      type: 'hard-fail',
      process: async () => { throw new Error('always'); },
    });

    const job = makeJob('job-1', 'hard-fail', 2);
    await dispatcher.dispatch(job);
    await dispatcher.start();
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await dispatcher.stop();

    const dead = await dlq.list();
    expect(dead.some((j) => j.id === 'job-1')).toBe(true);
  });
});