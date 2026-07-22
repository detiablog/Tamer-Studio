export interface JobStatus {
  jobId: string;
  type: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  priority: number;
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  retryCount: number;
  maxRetries: number;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueueStatus {
  queueName: string;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  workers: number;
  isHealthy: boolean;
}

export interface FailedJob {
  jobId: string;
  type: string;
  error: string;
  retryCount: number;
  maxRetries: number;
  failedAt: Date;
  canRetry: boolean;
}

export interface RetryResult {
  jobId: string;
  success: boolean;
  newJobId?: string;
  error?: string;
}

export interface ManualMaintenanceTask {
  id: string;
  name: string;
  description: string;
  type: "cleanup" | "reindex" | "backup" | "migration" | "custom";
  status: "pending" | "running" | "completed" | "failed";
  scheduledBy?: string;
  startedAt?: Date;
  completedAt?: Date;
  result?: Record<string, unknown>;
  error?: string;
  createdAt: Date;
}
