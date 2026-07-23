export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
  negativePrompt?: string;
  style?: string;
  model?: string;
}

export interface ImageVariationOptions {
  count?: number;
  strength?: number;
  seed?: number;
}

export interface ImageEditOptions {
  mask?: string;
  steps?: number;
  seed?: number;
}

export interface ImageUpscaleOptions {
  scale?: number;
  model?: string;
}

export interface ImageValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImageUsageRequest {
  workspaceId: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ImageUsageResponse {
  totalImages: number;
  totalCredits: number;
  totalCost: number;
  byProvider: Record<string, { images: number; credits: number }>;
  byModel: Record<string, { images: number; credits: number }>;
}
