import type { Asset, AssetId, AssetPreview } from "../types";

export interface PreviewService {
  generatePreview(asset: Asset): Promise<AssetPreview>;
  getPreview(assetId: AssetId): Promise<AssetPreview | undefined>;
}

export class InMemoryPreviewService implements PreviewService {
  private previews: Map<AssetId, AssetPreview> = new Map();

  async generatePreview(asset: Asset): Promise<AssetPreview> {
    const preview: AssetPreview = {
      thumbnailUrl: asset.storageRef.url ?? asset.preview.thumbnailUrl,
      previewUrl: asset.storageRef.url ?? asset.preview.previewUrl,
      embedUrl: asset.preview.embedUrl,
      width: asset.metadata.dimensions?.width ?? asset.preview.width,
      height: asset.metadata.dimensions?.height ?? asset.preview.height,
      durationMs: asset.metadata.durationMs ?? asset.preview.durationMs,
      format: asset.metadata.format ?? asset.preview.format,
    };
    this.previews.set(asset.assetId, preview);
    return preview;
  }

  async getPreview(assetId: AssetId): Promise<AssetPreview | undefined> {
    return this.previews.get(assetId);
  }
}
