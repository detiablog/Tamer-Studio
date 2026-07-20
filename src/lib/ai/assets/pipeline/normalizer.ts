import type { AssetKind, NormalizedAsset } from "../types";

export class DefaultAssetNormalizer {
  normalize(input: unknown, kind: AssetKind): NormalizedAsset {
    const assetId = `asset_${crypto.randomUUID().replace(/-/g, "")}`;
    return {
      assetId,
      kind,
      data: input,
      metadata: this.extractMetadata(input, kind),
      preview: this.extractPreview(input, kind),
    };
  }

  private extractMetadata(input: unknown, kind: AssetKind): NormalizedAsset["metadata"] {
    const metadata: NormalizedAsset["metadata"] = { tags: [] };

    if (typeof input === "string") {
      metadata.mimeType = "text/plain";
      metadata.sizeBytes = new Blob([input]).size;
      if (kind === "prompt" || kind === "script" || kind === "caption" || kind === "translation") {
        metadata.tags = [kind];
      }
    } else if (typeof input === "object" && input !== null) {
      const record = input as Record<string, unknown>;
      if (typeof record.url === "string") metadata.mimeType = record.mimeType as string | undefined;
      if (typeof record.sizeBytes === "number") metadata.sizeBytes = record.sizeBytes as number;
      if (typeof record.width === "number" && typeof record.height === "number") {
        metadata.dimensions = { width: record.width as number, height: record.height as number };
      }
      if (typeof record.durationMs === "number") metadata.durationMs = record.durationMs as number;
      if (typeof record.format === "string") metadata.format = record.format as string;
      if (typeof record.language === "string") metadata.language = record.language as string;
      if (typeof record.title === "string") metadata.title = record.title as string;
      if (typeof record.description === "string") metadata.description = record.description as string;
      if (Array.isArray(record.tags)) metadata.tags = record.tags as string[];
    }

    return metadata;
  }

  private extractPreview(input: unknown, _kind: AssetKind): NormalizedAsset["preview"] {
    if (typeof input === "object" && input !== null) {
      const record = input as Record<string, unknown>;
      const preview: NormalizedAsset["preview"] = {};
      if (typeof record.thumbnailUrl === "string") preview.thumbnailUrl = record.thumbnailUrl as string;
      if (typeof record.previewUrl === "string") preview.previewUrl = record.previewUrl as string;
      if (typeof record.embedUrl === "string") preview.embedUrl = record.embedUrl as string;
      if (typeof record.width === "number") preview.width = record.width as number;
      if (typeof record.height === "number") preview.height = record.height as number;
      if (typeof record.durationMs === "number") preview.durationMs = record.durationMs as number;
      if (typeof record.format === "string") preview.format = record.format as string;
      return preview;
    }
    return {};
  }
}
