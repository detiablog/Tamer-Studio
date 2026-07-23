import type { GenerationJob, JobQueue, JobStatus } from "./types";
import { AIGenerationJobError } from "../errors";

export class InMemoryJobQueue implements JobQueue {
  private queue: GenerationJob[] = [];
  private jobMap = new Map<string, GenerationJob>();

  async enqueue(job: GenerationJob): Promise<void> {
    this.queue.push(job);
    this.jobMap.set(job.id, job);
  }

  async dequeue(capability?: string): Promise<GenerationJob | null> {
    const index = this.queue.findIndex((job) => !capability || job.capability === capability);
    if (index === -1) return null;
    const job = this.queue.splice(index, 1)[0];
    if (job) job.status = "processing";
    return job ?? null;
  }

  async complete(jobId: string, result: unknown): Promise<void> {
    const job = this.jobMap.get(jobId);
    if (!job) throw new AIGenerationJobError("Job not found", jobId);
    job.status = "completed";
    job.result = result;
    job.progress = 100;
    job.updatedAt = new Date().toISOString();
  }

  async fail(jobId: string, error: string): Promise<void> {
    const job = this.jobMap.get(jobId);
    if (!job) throw new AIGenerationJobError("Job not found", jobId);
    job.status = "failed";
    job.error = error;
    job.updatedAt = new Date().toISOString();
  }

  async cancel(jobId: string): Promise<void> {
    const job = this.jobMap.get(jobId);
    if (!job) throw new AIGenerationJobError("Job not found", jobId);
    job.status = "cancelled";
    job.updatedAt = new Date().toISOString();
  }

  async getStatus(jobId: string): Promise<JobStatus | null> {
    return this.jobMap.get(jobId)?.status ?? null;
  }

  async retry(jobId: string): Promise<void> {
    const job = this.jobMap.get(jobId);
    if (!job) throw new AIGenerationJobError("Job not found", jobId);
    if (job.retryCount >= job.maxRetries) {
      job.status = "failed";
      job.error = "Max retries exceeded";
      job.updatedAt = new Date().toISOString();
      return;
    }
    job.retryCount++;
    job.status = "queued";
    job.progress = 0;
    job.error = undefined;
    job.updatedAt = new Date().toISOString();
    this.queue.push(job);
  }

  async updateProgress(jobId: string, progress: number): Promise<void> {
    const job = this.jobMap.get(jobId);
    if (!job) throw new AIGenerationJobError("Job not found", jobId);
    job.progress = Math.max(0, Math.min(100, progress));
    job.updatedAt = new Date().toISOString();
  }
}
