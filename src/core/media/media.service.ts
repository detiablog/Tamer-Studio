import type { UserMedia } from "./media.types";
import { mimeToMediaKind } from "./media.types";
import { MediaRepository } from "./media.repository";
import { AssetService } from "@/core/assets/asset.service";
import { LocalStorage } from "@/core/assets/local-storage";
import { logAction } from "@/core/audit";
import { logger } from "@/core/logger";

function createAssetService(): AssetService {
  const storage = new LocalStorage();
  return new AssetService(storage);
}

export class MediaService {
  private repository = new MediaRepository();
  private assetService = createAssetService();

  async upload(
    userId: string,
    file: File
  ): Promise<UserMedia> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const assetId = `media_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const stored = await this.assetService.store({
      id: assetId,
      kind: "image",
      data: buffer,
      metadata: {
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      },
      lifetime: "permanent",
      status: "active",
    });

    const media = await this.repository.create({
      userId,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      kind: mimeToMediaKind(file.type),
      storageKey: stored.id,
    });

    logAction("media.uploaded", undefined, undefined, {
      userId,
      mediaId: media.id,
      filename: file.name,
    });
    logger.info("Media uploaded", { userId, mediaId: media.id, filename: file.name });

    return media;
  }

  async list(userId: string): Promise<UserMedia[]> {
    return this.repository.findByUserId(userId);
  }

  async getById(mediaId: string): Promise<UserMedia | undefined> {
    return this.repository.findById(mediaId);
  }

  async delete(userId: string, mediaId: string): Promise<void> {
    const media = await this.repository.findById(mediaId);
    if (!media) throw new Error("Media not found");
    if (media.userId !== userId) throw new Error("Unauthorized");

    await this.assetService.delete(media.storageKey).catch(() => {});
    await this.repository.delete(mediaId);

    logAction("media.deleted", undefined, undefined, {
      userId,
      mediaId,
    });
    logger.info("Media deleted", { userId, mediaId });
  }

  async updateMetadata(
    mediaId: string,
    userId: string,
    updates: { filename?: string }
  ): Promise<UserMedia | undefined> {
    const media = await this.repository.findById(mediaId);
    if (!media) throw new Error("Media not found");
    if (media.userId !== userId) throw new Error("Unauthorized");

    const updated = await this.repository.update(mediaId, updates);
    if (updated) {
      logAction("media.updated", undefined, undefined, {
        userId,
        mediaId,
        changes: updates,
      });
    }
    return updated;
  }

  async getUrl(mediaId: string): Promise<string> {
    const media = await this.repository.findById(mediaId);
    if (!media) throw new Error("Media not found");
    return this.assetService.getDownloadUrl(media.storageKey, 3600);
  }
}
