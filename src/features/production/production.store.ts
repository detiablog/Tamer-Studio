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

const sampleJobs: ProductionJob[] = [
  {
    id: crypto.randomUUID(),
    name: "AI Campaign Render",
    workflowName: "Campaign Video Rendering",
    workflowType: "Rendering",
    status: "Running",
    priority: "High",
    progress: 64,
    currentStep: "Encoding frames",
    estimatedDuration: "1h 20m",
    startedAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    finishedAt: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    owner: "Mia Chen",
    retryCount: 0,
    workspace: "Acme Studio",
    project: "AI Campaign",
    mediaAsset: "Promo Video",
    tags: ["render", "video", "campaign"],
    executionLog: [
      "Queued job",
      "Preparing workflow resources",
      "Started rendering frames",
      "Encoding video stream",
    ],
  },
  {
    id: crypto.randomUUID(),
    name: "Podcast Mixdown",
    workflowName: "Audio Production",
    workflowType: "Audio Generation",
    status: "Waiting",
    priority: "Medium",
    progress: 28,
    currentStep: "Waiting for render nodes",
    estimatedDuration: "35m",
    startedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    finishedAt: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    owner: "Noah Patel",
    retryCount: 0,
    workspace: "Marketing Team",
    project: "Podcast Launch",
    mediaAsset: "Final Mix",
    tags: ["audio", "mixdown", "podcast"],
    executionLog: ["Job queued", "Allocating worker pool", "Waiting for worker availability"],
  },
  {
    id: crypto.randomUUID(),
    name: "Hero Image Batch",
    workflowName: "Image Generation",
    workflowType: "Image Generation",
    status: "Failed",
    priority: "High",
    progress: 0,
    currentStep: "Error validating prompt",
    estimatedDuration: "10m",
    startedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    finishedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    owner: "Ava Nguyen",
    retryCount: 1,
    workspace: "Personal",
    project: "Launch Campaign",
    mediaAsset: "Hero Image Set",
    tags: ["image", "ai", "hero"],
    executionLog: ["Started generation", "Unable to validate prompt schema", "Job failed"],
  },
  {
    id: crypto.randomUUID(),
    name: "Publish Newsletter",
    workflowName: "Publishing Preparation",
    workflowType: "Publishing Preparation",
    status: "Queued",
    priority: "Low",
    progress: 0,
    currentStep: "Queued",
    estimatedDuration: "15m",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    owner: "Elias Stone",
    retryCount: 0,
    workspace: "Acme Studio",
    project: "Newsletter",
    mediaAsset: "Email Draft",
    tags: ["publish", "communication"],
    executionLog: ["Job queued", "Waiting for approval"],
  },
  {
    id: crypto.randomUUID(),
    name: "Storyboard Export",
    workflowName: "Script Generation",
    workflowType: "Script Generation",
    status: "Completed",
    priority: "Medium",
    progress: 100,
    currentStep: "Completed",
    estimatedDuration: "18m",
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    finishedAt: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    owner: "Mia Chen",
    retryCount: 0,
    workspace: "Acme Studio",
    project: "AI Campaign",
    mediaAsset: "Storyboard Script",
    tags: ["script", "storyboard"],
    executionLog: ["Started generation", "Generated draft", "Saved result"],
  },
];

function readStore(): ProductionJob[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProductionJob[];
  } catch (err) {
    console.error("Failed to read production jobs", err);
    return [];
  }
}

function writeStore(list: ProductionJob[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to write production jobs", err);
  }
}

function seedJobs() {
  const list = readStore();
  if (list.length) return list;
  writeStore(sampleJobs);
  return sampleJobs;
}

export const productionStore = {
  getAll(): ProductionJob[] {
    return seedJobs();
  },

  get(id: string) {
    return readStore().find((job) => job.id === id) ?? null;
  },

  create(payload: Omit<ProductionJob, "id" | "createdAt" | "updatedAt">) {
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
    const list = readStore();
    const index = list.findIndex((job) => job.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...patch, updatedAt: new Date().toISOString() };
    writeStore(list);
    return list[index];
  },

  delete(id: string) {
    const list = readStore().filter((job) => job.id !== id);
    writeStore(list);
    return true;
  },

  retry(id: string) {
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