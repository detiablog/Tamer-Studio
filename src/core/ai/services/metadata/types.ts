export interface GenerationMetadata {
  readonly id: string;
  readonly provider: string;
  readonly model: string;
  readonly prompt: string;
  readonly negativePrompt?: string;
  readonly resolution?: string;
  readonly duration?: number;
  readonly seed?: number;
  readonly credits: number;
  readonly cost: number;
  readonly currency: string;
  readonly workspaceId: string;
  readonly projectId?: string;
  readonly generationId: string;
  readonly createdAt: string;
}
