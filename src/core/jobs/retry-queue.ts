import type { Job, RetryQueue } from "./job.types";
import { logger } from "@/core/logger/logger";

export class InMemoryRetryQueue implements RetryQueue {
  private queue: Array<{ job: Job; retryAt: number; reason: string }> = [];

  async enqueueForRetry(job: Job, reason: string): Promise<void> {
    const maxDelay = 30000;
    const baseDelay = 1000;
    const backoff = baseDelay * Math.pow(2, job.attempts - 1);
    const retryAt = Date.now() + Math.min(backoff, maxDelay);

    this.queue.push({ job: { ...job, status: "queued" }, retryAt, reason });
    logger.info("Job enqueued for retry", { jobId: job.id, reason, retryAt });
  }

  async getNext(): Promise<Job | null> {
    const now = Date.now();
    const readyIndex = this.queue.findIndex((entry) => entry.retryAt <= now);
    if (readyIndex === -1) return null;
    const [entry] = this.queue.splice(readyIndex, 1);
    return entry.job;
  }

  size(): number {
    return this.queue.length;
  }
}