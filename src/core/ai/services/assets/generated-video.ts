import type { AssetMetadata, AssetSource, GeneratedVideoData } from "./types";

export class GeneratedVideo {
  readonly id: string;
  readonly url: string;
  readonly durationSeconds: number;
  readonly width: number;
  readonly height: number;
  readonly mimeType: string;
  readonly metadata: AssetMetadata;
  readonly source: AssetSource;

  constructor(data: GeneratedVideoData) {
    this.id = data.id;
    this.url = data.url;
    this.durationSeconds = data.durationSeconds;
    this.width = data.width;
    this.height = data.height;
    this.mimeType = data.mimeType;
    this.metadata = data.metadata;
    this.source = { type: "url", value: data.url };
  }
}
