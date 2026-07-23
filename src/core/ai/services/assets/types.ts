export interface AssetMetadata {
  provider: string;
  model: string;
  prompt: string;
  negativePrompt?: string;
  resolution?: string;
  duration?: number;
  seed?: number;
  credits: number;
  cost: number;
  currency: string;
  workspaceId: string;
  projectId?: string;
  generationId: string;
  createdAt: string;
}

export interface AssetSource {
  type: "url" | "base64" | "binary";
  value: string;
  mimeType?: string;
  sizeBytes?: number;
}

export interface GeneratedImageData {
  id: string;
  url: string;
  width: number;
  height: number;
  mimeType: string;
  metadata: AssetMetadata;
}

export interface GeneratedVideoData {
  id: string;
  url: string;
  durationSeconds: number;
  width: number;
  height: number;
  mimeType: string;
  metadata: AssetMetadata;
}

export interface GeneratedAudioData {
  id: string;
  url: string;
  durationSeconds: number;
  mimeType: string;
  metadata: AssetMetadata;
}

export interface EmbeddingData {
  vector: number[];
  dimensions: number;
  model: string;
}

export interface ChatMessageData {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface PromptAssetData {
  id: string;
  template: string;
  variables: Record<string, unknown>;
  compiledPrompt: string;
  version: string;
  metadata: AssetMetadata;
}
