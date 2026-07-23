export type JobStatus = "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled";

export interface GenerationJob {
  id: string;
  status: JobStatus;
  capability: string;
  payload: Record<string, unknown>;
  context: Record<string, unknown>;
  retryCount: number;
  maxRetries: number;
  priority: "low" | "normal" | "high";
  progress: number;
  result?: unknown;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobQueue {
  enqueue(job: GenerationJob): Promise<void>;
  dequeue(capability?: string): Promise<GenerationJob | null>;
  complete(jobId: string, result: unknown): Promise<void>;
  fail(jobId: string, error: string): Promise<void>;
  cancel(jobId: string): Promise<void>;
  getStatus(jobId: string): Promise<JobStatus | null>;
  retry(jobId: string): Promise<void>;
  updateProgress(jobId: string, progress: number): Promise<void>;
}
