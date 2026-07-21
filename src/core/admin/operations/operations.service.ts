import type { JobStatus, QueueStatus, FailedJob, RetryResult, ManualMaintenanceTask } from "./operations.types";
import { logAdminAction } from "@/core/audit";
import { logger } from "@/core/logger";

const jobStore: Map<string, JobStatus> = new Map();
const taskStore: Map<string, ManualMaintenanceTask> = new Map();

export class OperationsService {
  async getJob(jobId: string): Promise<JobStatus | undefined> {
    return jobStore.get(jobId);
  }

  async listJobs(filter?: { status?: JobStatus["status"]; type?: string }): Promise<JobStatus[]> {
    let jobs = Array.from(jobStore.values());
    if (filter?.status) {
      jobs = jobs.filter((j) => j.status === filter.status);
    }
    if (filter?.type) {
      jobs = jobs.filter((j) => j.type === filter.type);
    }
    return jobs;
  }

  async getQueueStatus(queueName: string): Promise<QueueStatus> {
    const allJobs = Array.from(jobStore.values());
    const queueJobs = allJobs.filter((j) => j.type === queueName || queueName === "default");
    const pending = queueJobs.filter((j) => j.status === "queued").length;
    const running = queueJobs.filter((j) => j.status === "running").length;
    const completed = queueJobs.filter((j) => j.status === "completed").length;
    const failed = queueJobs.filter((j) => j.status === "failed").length;

    return {
      queueName,
      pending,
      running,
      completed,
      failed,
      workers: 1,
      isHealthy: failed === 0 || pending < 100,
    };
  }

  async getFailedJobs(): Promise<FailedJob[]> {
    const allJobs = Array.from(jobStore.values());
    return allJobs
      .filter((j) => j.status === "failed")
      .map((j) => ({
        jobId: j.jobId,
        type: j.type,
        error: j.error || "Unknown error",
        retryCount: j.retryCount,
        maxRetries: j.maxRetries,
        failedAt: j.updatedAt,
        canRetry: j.retryCount < j.maxRetries,
      }));
  }

  async retryJob(jobId: string, adminId: string): Promise<RetryResult> {
    const job = jobStore.get(jobId);
    if (!job) {
      return { jobId, success: false, error: "Job not found" };
    }
    if (job.retryCount >= job.maxRetries) {
      return { jobId, success: false, error: "Max retries exceeded" };
    }

    job.status = "queued";
    job.retryCount += 1;
    job.error = undefined;
    job.updatedAt = new Date();
    jobStore.set(jobId, job);

    logAdminAction("job.retried", adminId, { jobId, retryCount: job.retryCount });
    logger.info("Job retried by admin", { jobId, adminId });
    return { jobId, success: true, newJobId: jobId };
  }

  async cancelJob(jobId: string, adminId: string): Promise<boolean> {
    const job = jobStore.get(jobId);
    if (!job) return false;
    job.status = "cancelled";
    job.updatedAt = new Date();
    jobStore.set(jobId, job);
    logAdminAction("job.cancelled", adminId, { jobId });
    return true;
  }

  async runMaintenanceTask(name: string, description: string, type: ManualMaintenanceTask["type"], adminId?: string): Promise<ManualMaintenanceTask> {
    const now = new Date();
    const task: ManualMaintenanceTask = {
      id: `task_${Date.now()}`,
      name,
      description,
      type,
      status: "running",
      scheduledBy: adminId,
      startedAt: now,
      createdAt: now,
    };

    taskStore.set(task.id, task);

    setTimeout(async () => {
      task.status = "completed";
      task.completedAt = new Date();
      task.result = { message: "Task completed successfully" };
      taskStore.set(task.id, task);
      if (adminId) {
        logAdminAction("maintenance.task.completed", adminId, { taskId: task.id, name });
      }
    }, 1000);

    if (adminId) {
      logAdminAction("maintenance.task.started", adminId, { taskId: task.id, name, type });
    }
    return task;
  }

  async getMaintenanceTasks(): Promise<ManualMaintenanceTask[]> {
    return Array.from(taskStore.values());
  }

  async getMaintenanceTask(taskId: string): Promise<ManualMaintenanceTask | undefined> {
    return taskStore.get(taskId);
  }
}
