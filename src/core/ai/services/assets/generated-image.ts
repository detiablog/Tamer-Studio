import type { AssetMetadata, AssetSource, GeneratedImageData } from "./types";

export class GeneratedImage {
  readonly id: string;
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly mimeType: string;
  readonly metadata: AssetMetadata;
  readonly source: AssetSource;

  constructor(data: GeneratedImageData) {
    this.id = data.id;
    this.url = data.url;
    this.width = data.width;
    this.height = data.height;
    this.mimeType = data.mimeType;
    this.metadata = data.metadata;
    this.source = { type: "url", value: data.url };
  }
}
