import type { AssetMetadata, AssetSource, GeneratedAudioData } from "./types";

export class GeneratedAudio {
  readonly id: string;
  readonly url: string;
  readonly durationSeconds: number;
  readonly mimeType: string;
  readonly metadata: AssetMetadata;
  readonly source: AssetSource;

  constructor(data: GeneratedAudioData) {
    this.id = data.id;
    this.url = data.url;
    this.durationSeconds = data.durationSeconds;
    this.mimeType = data.mimeType;
    this.metadata = data.metadata;
    this.source = { type: "url", value: data.url };
  }
}
