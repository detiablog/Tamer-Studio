import type { Job, JobStatus } from "./job.types";

const JOB_STORE = new Map<string, Job>();
const QUEUE: Job[] = [];
const DEAD_LETTER: Job[] = [];
const PROGRESS: Map<string, number> = new Map();

export const jobStore = {
  add: (job: Job): void => {
    JOB_STORE.set(job.id, { ...job });
    if (job.status === "queued") {
      QUEUE.push({ ...job });
    }
  },

  get: (jobId: string): Job | undefined => {
    return JOB_STORE.get(jobId);
  },

  getAll: (): Job[] => {
    return Array.from(JOB_STORE.values());
  },

  getByStatus: (status: JobStatus): Job[] => {
    return Array.from(JOB_STORE.values()).filter((j) => j.status === status);
  },

  enqueue: (job: Job): string => {
    job.status = "queued";
    job.createdAt = new Date().toISOString();
    job.updatedAt = new Date().toISOString();
    job.attempts = 0;
    job.progress = 0;
    JOB_STORE.set(job.id, job);
    QUEUE.push(job);
    return job.id;
  },

  dequeue: (workerType: string): Job | null => {
    const index = QUEUE.findIndex((j) => j.type === workerType && j.status === "queued");
    if (index === -1) return null;
    const job = QUEUE.splice(index, 1)[0];
    if (job) {
      job.status = "processing";
      job.updatedAt = new Date().toISOString();
      JOB_STORE.set(job.id, job);
    }
    return job ?? null;
  },

  complete: (jobId: string, result?: unknown): void => {
    const job = JOB_STORE.get(jobId);
    if (!job) return;
    job.status = "completed";
    job.result = result;
    job.progress = 100;
    job.completedAt = new Date().toISOString();
    job.updatedAt = new Date().toISOString();
    JOB_STORE.set(jobId, job);
  },

  fail: (jobId: string, error: string): void => {
    const job = JOB_STORE.get(jobId);
    if (!job) return;
    job.status = "failed";
    job.error = error;
    job.updatedAt = new Date().toISOString();
    JOB_STORE.set(jobId, job);
  },

  cancel: (jobId: string): void => {
    const job = JOB_STORE.get(jobId);
    if (!job) return;
    job.status = "cancelled";
    job.updatedAt = new Date().toISOString();
    JOB_STORE.set(jobId, job);
  },

  retry: (jobId: string): void => {
    const job = JOB_STORE.get(jobId);
    if (!job) return;
    if (job.attempts >= job.maxAttempts) {
      job.status = "failed";
      job.error = "Max retries exceeded";
      DEAD_LETTER.push(job);
      return;
    }
    job.attempts += 1;
    job.status = "queued";
    job.progress = 0;
    job.error = undefined;
    job.updatedAt = new Date().toISOString();
    QUEUE.push(job);
  },

  updateProgress: (jobId: string, progress: number): void => {
    const job = JOB_STORE.get(jobId);
    if (!job) return;
    job.progress = Math.max(0, Math.min(100, progress));
    job.updatedAt = new Date().toISOString();
    PROGRESS.set(jobId, job.progress);
    JOB_STORE.set(jobId, job);
  },

  getQueue: (): Job[] => {
    return [...QUEUE];
  },

  getDeadLetter: (): Job[] => {
    return [...DEAD_LETTER];
  },

  clearDeadLetter: (jobId: string): void => {
    const index = DEAD_LETTER.findIndex((j) => j.id === jobId);
    if (index !== -1) {
      DEAD_LETTER.splice(index, 1);
    }
  },

  getStats: (): { total: number; queued: number; processing: number; completed: number; failed: number; cancelled: number; depth: number; failedCount: number } => {
    const jobs = Array.from(JOB_STORE.values());
    return {
      total: jobs.length,
      queued: jobs.filter((j) => j.status === "queued").length,
      processing: jobs.filter((j) => j.status === "processing").length,
      completed: jobs.filter((j) => j.status === "completed").length,
      failed: jobs.filter((j) => j.status === "failed").length,
      cancelled: jobs.filter((j) => j.status === "cancelled").length,
      depth: QUEUE.length,
      failedCount: DEAD_LETTER.length,
    };
  },

  clear: (): void => {
    JOB_STORE.clear();
    QUEUE.length = 0;
    DEAD_LETTER.length = 0;
    PROGRESS.clear();
  },
};