export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
}

export interface EmbeddingResponse {
  vector: number[];
  dimensions: number;
  model: string;
}

export interface BatchEmbeddingRequest {
  inputs: string[];
  model?: string;
  dimensions?: number;
}

export interface BatchEmbeddingResponse {
  embeddings: EmbeddingResponse[];
  model: string;
}
