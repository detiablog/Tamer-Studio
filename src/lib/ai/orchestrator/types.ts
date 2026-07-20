export type PromptCategory =
  | "affiliate"
  | "drama"
  | "image"
  | "video"
  | "storyboard"
  | "caption"
  | "translation"
  | "voice"
  | "blog"
  | "thumbnail"
  | "custom";

export interface PromptTemplate {
  id: string;
  name: string;
  category: PromptCategory;
  description: string;
  content: string;
  variables: string[];
  tags: string[];
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplateVersion {
  id: string;
  templateId: string;
  version: string;
  content: string;
  variables: string[];
  changelog?: string;
  createdAt: string;
}

export interface PromptVariable {
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required?: boolean;
}

export interface PromptContext {
  workspaceId?: string;
  projectId?: string;
  brandTone?: string;
  workflow?: string;
  selectedAssets?: string[];
  userPreferences?: Record<string, unknown>;
  language?: string;
  platform?: string;
  targetAudience?: string;
  metadata?: Record<string, unknown>;
}

export interface PromptOptimizationProfile {
  id: string;
  name: string;
  description: string;
  rules: OptimizationRule[];
}

export interface OptimizationRule {
  type: "trim" | "expand" | "rephrase" | "structure" | "custom";
  params?: Record<string, unknown>;
}

export interface PromptPreview {
  templateId: string;
  version: string;
  compiledPrompt: string;
  variables: PromptVariable[];
  context: PromptContext;
  estimatedTokens?: number;
}

export interface OrchestrationResult {
  executionId: string;
  compiledPrompt: string;
  templateId: string;
  templateVersion: string;
  variables: PromptVariable[];
  context: PromptContext;
  preview?: PromptPreview;
  warnings: string[];
}
