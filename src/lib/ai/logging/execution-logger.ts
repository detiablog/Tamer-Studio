import type { ExecutionId, ExecutionHistoryEntry } from "../types/execution";
import type { ExecutionLifecycleEvent, ExecutionLifecycleListener } from "../execution/types";
import { logger } from "@/core/logger";

export interface ExecutionLogger {
  log(entry: Omit<ExecutionHistoryEntry, "createdAt" | "updatedAt">): Promise<void>;
  getHistory(executionId: ExecutionId): Promise<ExecutionHistoryEntry | undefined>;
  listHistory(): Promise<ExecutionHistoryEntry[]>;
}

export class ConsoleExecutionLogger implements ExecutionLogger {
  private history: Map<ExecutionId, ExecutionHistoryEntry> = new Map();

  async log(entry: Omit<ExecutionHistoryEntry, "createdAt" | "updatedAt">): Promise<void> {
    const now = new Date().toISOString();
    const record: ExecutionHistoryEntry = {
      ...entry,
      createdAt: now,
      updatedAt: now,
    };
    this.history.set(entry.executionId, record);
  }

  async getHistory(executionId: ExecutionId): Promise<ExecutionHistoryEntry | undefined> {
    return this.history.get(executionId);
  }

  async listHistory(): Promise<ExecutionHistoryEntry[]> {
    return Array.from(this.history.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export class LifecycleLoggingListener implements ExecutionLifecycleListener {
  async onEvent(event: ExecutionLifecycleEvent, data: Record<string, unknown>): Promise<void> {
    logger.info(`[AI Execution] ${event}`, data);
  }
}
