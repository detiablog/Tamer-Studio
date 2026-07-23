import type { DeadLetterQueue, Job } from "./job.types";
import { logger } from "@/core/logger/logger";

export class InMemoryDeadLetterQueue implements DeadLetterQueue {
  private jobs: Array<{ job: Job; reason: string }> = [];

  async add(job: Job, reason: string): Promise<void> {
    this.jobs.push({ job: { ...job }, reason });
    logger.warn("Job moved to dead letter queue", { jobId: job.id, reason });
  }

  async list(): Promise<Job[]> {
    return this.jobs.map((entry) => entry.job);
  }

  async retry(jobId: string): Promise<void> {
    const index = this.jobs.findIndex((entry) => entry.job.id === jobId);
    if (index === -1) {
      logger.warn("Job not found in dead letter queue", { jobId });
      return;
    }

    const entry = this.jobs[index];
    this.jobs.splice(index, 1);
    const job = entry.job;
    job.status = "queued";
    job.attempts = 0;
    job.updatedAt = new Date().toISOString();
    logger.info("Job retried from dead letter queue", { jobId });
  }
}