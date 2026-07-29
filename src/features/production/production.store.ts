import { logger } from "@/core/logger";

export type ProductionStatus =
  | "Draft"
  | "Queued"
  | "Preparing"
  | "Running"
  | "Waiting"
  | "Completed"
  | "Failed"
  | "Cancelled";

export type WorkflowType =
  | "Image Generation"
  | "Video Generation"
  | "Audio Generation"
  | "Script Generation"
  | "Media Processing"
  | "Rendering"
  | "Publishing Preparation"
  | "Custom Workflow";

export type ProductionPriority = "Low" | "Medium" | "High" | "Critical";

export type ProductionJob = {
  id: string;
  name: string;
  workflowName: string;
  workflowType: WorkflowType;
  status: ProductionStatus;
  priority: ProductionPriority;
  progress: number;
  currentStep: string;
  estimatedDuration: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
  owner: string;
  retryCount: number;
  workspace: string;
  project: string;
  mediaAsset?: string;
  tags?: string[];
  executionLog: string[];
  favorite?: boolean;
  pinned?: boolean;
  archived?: boolean;
};

const KEY = "tamer:productionJobs";

function readStore(): ProductionJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProductionJob[];
  } catch (err) {
    logger.error("Failed to read production jobs", err as Error);
    return [];
  }
}

function writeStore(list: ProductionJob[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (err) {
    logger.error("Failed to write production jobs", err as Error);
  }
}

export const productionStore = {
  getAll(): ProductionJob[] {
    return readStore();
  },

  get(id: string) {
    return readStore().find((job) => job.id === id) ?? null;
  },

  create(payload: Omit<ProductionJob, "id" | "createdAt" | "updatedAt">) {
    if (typeof window === "undefined") {
      throw new Error("productionStore.create cannot be called on the server");
    }
    const list = readStore();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const job: ProductionJob = {
      id,
      name: payload.name,
      workflowName: payload.workflowName,
      workflowType: payload.workflowType,
      status: payload.status ?? "Queued",
      priority: payload.priority ?? "Medium",
      progress: payload.progress ?? 0,
      currentStep: payload.currentStep ?? "Queued",
      estimatedDuration: payload.estimatedDuration ?? "30m",
      startedAt: payload.startedAt,
      finishedAt: payload.finishedAt,
      createdAt: now,
      updatedAt: now,
      owner: payload.owner,
      retryCount: payload.retryCount ?? 0,
      workspace: payload.workspace,
      project: payload.project,
      mediaAsset: payload.mediaAsset,
      tags: payload.tags ?? [],
      executionLog: payload.executionLog ?? ["Job created and queued"],
      favorite: payload.favorite ?? false,
      pinned: payload.pinned ?? false,
      archived: payload.archived ?? false,
    };
    list.unshift(job);
    writeStore(list);
    return job;
  },

  update(id: string, patch: Partial<ProductionJob>) {
    if (typeof window === "undefined") {
      throw new Error("productionStore.update cannot be called on the server");
    }
    const list = readStore();
    const index = list.findIndex((job) => job.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...patch, updatedAt: new Date().toISOString() };
    writeStore(list);
    return list[index];
  },

  delete(id: string) {
    if (typeof window === "undefined") {
      throw new Error("productionStore.delete cannot be called on the server");
    }
    const list = readStore().filter((job) => job.id !== id);
    writeStore(list);
    return true;
  },

  retry(id: string) {
    if (typeof window === "undefined") {
      throw new Error("productionStore.retry cannot be called on the server");
    }
    const job = this.get(id);
    if (!job) return null;
    return this.update(id, {
      status: "Queued",
      progress: 0,
      currentStep: "Queued",
      retryCount: job.retryCount + 1,
      executionLog: [...job.executionLog, "Retry requested"],
      startedAt: undefined,
      finishedAt: undefined,
    });
  },

  cancel(id: string) {
    if (typeof window === "undefined") {
      throw new Error("productionStore.cancel cannot be called on the server");
    }
    const job = this.get(id);
    if (!job) return null;
    return this.update(id, {
      status: "Cancelled",
      progress: job.progress > 0 ? job.progress : 0,
      currentStep: "Cancelled",
      finishedAt: new Date().toISOString(),
      executionLog: [...job.executionLog, "Job cancelled by user"],
    });
  },

  duplicate(id: string) {
    if (typeof window === "undefined") {
      throw new Error("productionStore.duplicate cannot be called on the server");
    }
    const job = this.get(id);
    if (!job) return null;
    const copy: ProductionJob = {
      ...job,
      id: crypto.randomUUID(),
      name: `${job.name} (Copy)`,
      status: "Queued",
      progress: 0,
      currentStep: "Queued",
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startedAt: undefined,
      finishedAt: undefined,
      executionLog: ["Duplicated job and queued"],
    };
    const list = readStore();
    list.unshift(copy);
    writeStore(list);
    return copy;
  },
};