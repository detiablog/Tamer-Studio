export interface VideoGenerationOptions {
  durationSeconds?: number;
  width?: number;
  height?: number;
  fps?: number;
  seed?: number;
  motionStrength?: number;
  model?: string;
}

export interface ImageToVideoOptions {
  durationSeconds?: number;
  motionStrength?: number;
  seed?: number;
}

export interface TextToVideoOptions {
  durationSeconds?: number;
  width?: number;
  height?: number;
  fps?: number;
  seed?: number;
}

export interface VideoProgressResponse {
  executionId: string;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  estimatedRemainingMs?: number;
  result?: {
    url: string;
    durationSeconds: number;
    width: number;
    height: number;
    mimeType: string;
  };
  error?: string;
}

export interface VideoMetadataResponse {
  provider: string;
  model: string;
  prompt: string;
  durationSeconds: number;
  resolution: string;
  seed?: number;
  credits: number;
  cost: number;
  currency: string;
  createdAt: string;
}

export interface VideoUsageRequest {
  workspaceId: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

export interface VideoUsageResponse {
  totalVideos: number;
  totalSeconds: number;
  totalCredits: number;
  totalCost: number;
  byProvider: Record<string, { videos: number; seconds: number; credits: number }>;
  byModel: Record<string, { videos: number; seconds: number; credits: number }>;
}
