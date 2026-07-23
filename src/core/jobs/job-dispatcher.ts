import type { Event } from "@/core/events/event";
import { eventBus } from "@/core/events/event-bus";
import { logger } from "@/core/logger/logger";
import type { DeadLetterQueue, Job, JobDispatcher, JobQueue, ProgressEvent, RetryQueue, Worker } from "./job.types";

const PROGRESS_EVENT_TYPE = "job.progress" as const;

type ProgressHandler = (event: ProgressEvent) => void;

export class InMemoryJobDispatcher implements JobDispatcher {
  private workers: Map<string, Worker> = new Map();
  private jobQueue: JobQueue;
  private retryQueue: RetryQueue;
  private deadLetterQueue: DeadLetterQueue;
  private progressHandlers: Set<ProgressHandler> = new Set();
  private running = false;
  private processing = false;
  private pollInterval?: ReturnType<typeof setInterval>;

  constructor(
    jobQueue: JobQueue,
    retryQueue: RetryQueue,
    deadLetterQueue: DeadLetterQueue
  ) {
    this.jobQueue = jobQueue;
    this.retryQueue = retryQueue;
    this.deadLetterQueue = deadLetterQueue;
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.pollInterval = setInterval(() => this.process().catch((err) => logger.error("Dispatcher error", err as Error)), 500);
    logger.info("Job dispatcher started");
  }

  async stop(): Promise<void> {
    this.running = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
    logger.info("Job dispatcher stopped");
  }

  registerWorker(worker: Worker): void {
    this.workers.set(worker.type, worker);
    logger.info("Worker registered", { workerType: worker.type });
  }

  async dispatch(job: Job): Promise<string> {
    const jobId = await this.jobQueue.enqueue(job);
    logger.info("Job dispatched", { jobId, type: job.type });
    return jobId;
  }

  onProgress(handler: (event: ProgressEvent) => void): () => void {
    this.progressHandlers.add(handler);
    return () => {
      this.progressHandlers.delete(handler);
    };
  }

  private async process(): Promise<void> {
    if (this.processing || !this.running) return;
    this.processing = true;

    try {
      const allWorkers = Array.from(this.workers.keys());
      for (const workerType of allWorkers) {
        const job = await this.jobQueue.dequeue(workerType);
        if (!job) continue;

        await this.jobQueue.ack(job.id);
        await this.executeJob(job, workerType);
      }

      const retryJob = await this.retryQueue.getNext();
      if (retryJob) {
        const workerType = retryJob.type;
        if (this.workers.has(workerType)) {
          await this.executeJob(retryJob, workerType);
        }
      }
    } finally {
      this.processing = false;
    }
  }

  private async executeJob(job: Job, workerType: string): Promise<void> {
    const worker = this.workers.get(workerType);
    if (!worker) {
      await this.jobQueue.nack(job.id, "No worker available");
      return;
    }

    job.status = "processing";
    job.startedAt = new Date().toISOString();
    job.updatedAt = new Date().toISOString();
    await this.jobQueue.updateProgress(job.id, 0);

    try {
      await worker.process(job);
      job.status = "completed";
      job.progress = 100;
      job.completedAt = new Date().toISOString();
      job.updatedAt = new Date().toISOString();
      await this.jobQueue.updateProgress(job.id, 100);
      logger.info("Job completed", { jobId: job.id, type: job.type });
    } catch (error) {
      job.attempts += 1;
      job.updatedAt = new Date().toISOString();

      if (job.attempts < job.maxAttempts) {
        job.status = "queued";
        await this.retryQueue.enqueueForRetry(job, error instanceof Error ? error.message : "Unknown error");
        logger.warn("Job failed, retrying", { jobId: job.id, attempt: job.attempts });
      } else {
        job.status = "failed";
        job.error = error instanceof Error ? error.message : "Unknown error";
        job.completedAt = new Date().toISOString();
        await this.deadLetterQueue.add(job, job.error);
        logger.error("Job failed permanently", undefined, { jobId: job.id, error: job.error });
      }
    }
  }

  private emitProgress(event: ProgressEvent): void {
    this.progressHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (err) {
        logger.error("Progress handler failed", err as Error);
      }
    });

    const evt: Event = {
      id: crypto.randomUUID(),
      type: PROGRESS_EVENT_TYPE as Event["type"],
      source: "jobs",
      payload: event as unknown as Record<string, unknown>,
      timestamp: new Date(),
    };
    eventBus.emit(evt);
  }
}