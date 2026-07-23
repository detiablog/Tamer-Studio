import type { Job, JobPayload, JobPriority } from "./job.types";
import { logger } from "@/core/logger/logger";

export class SimpleJobScheduler {
  schedule(type: string, payload: JobPayload, priority: JobPriority = "normal", delayMs: number = 0): Job {
    const job: Job = {
      id: crypto.randomUUID(),
      type,
      payload,
      status: "pending",
      priority,
      progress: 0,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scheduledAt: delayMs > 0 ? new Date(Date.now() + delayMs).toISOString() : undefined,
    };

    logger.info("Job scheduled", { jobId: job.id, type, delayMs });
    return job;
  }

  isReady(job: Job): boolean {
    if (!job.scheduledAt) return true;
    return Date.now() >= new Date(job.scheduledAt).getTime();
  }
}