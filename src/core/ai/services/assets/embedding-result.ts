import type { AssetMetadata, EmbeddingData } from "./types";

export class EmbeddingResult {
  readonly vector: number[];
  readonly dimensions: number;
  readonly model: string;
  readonly metadata: AssetMetadata;

  constructor(data: EmbeddingData, metadata: AssetMetadata) {
    this.vector = data.vector;
    this.dimensions = data.dimensions;
    this.model = data.model;
    this.metadata = metadata;
  }
}
