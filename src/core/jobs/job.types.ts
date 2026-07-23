export type JobId = string;
export type JobStatus = "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled";
export type JobPriority = "low" | "normal" | "high";

export interface JobPayload {
  type: string;
  data: Record<string, unknown>;
}

export interface Job {
  id: JobId;
  type: string;
  payload: JobPayload;
  status: JobStatus;
  priority: JobPriority;
  progress: number;
  attempts: number;
  maxAttempts: number;
  result?: unknown;
  error?: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  type: string;
  process(job: Job): Promise<void>;
  cancel?(jobId: JobId): Promise<void>;
}

export interface JobQueue {
  enqueue(job: Job): Promise<JobId>;
  dequeue(workerType: string): Promise<Job | null>;
  ack(jobId: JobId): Promise<void>;
  nack(jobId: JobId, error: string): Promise<void>;
  getStatus(jobId: JobId): Promise<JobStatus | null>;
  updateProgress(jobId: JobId, progress: number): Promise<void>;
  size(): number;
}

export interface RetryQueue {
  enqueueForRetry(job: Job, reason: string): Promise<void>;
  getNext(): Promise<Job | null>;
}

export interface DeadLetterQueue {
  add(job: Job, reason: string): Promise<void>;
  list(): Promise<Job[]>;
  retry(jobId: JobId): Promise<void>;
}

export interface ProgressEvent {
  jobId: JobId;
  progress: number;
  message?: string;
  data?: Record<string, unknown>;
}

export interface JobDispatcher {
  start(): Promise<void>;
  stop(): Promise<void>;
  registerWorker(worker: Worker): void;
  dispatch(job: Job): Promise<JobId>;
  onProgress(handler: (event: ProgressEvent) => void): () => void;
}