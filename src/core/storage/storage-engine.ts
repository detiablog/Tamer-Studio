import { db } from "@/lib/db";
import { storageFile, storageQuota, storageFolder, storageProviderHealth } from "@/lib/db/schema/storage";
import { eq, and, sql, desc } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import { AssetService } from "@/core/assets/asset.service";
import { LocalStorage } from "@/core/assets/local-storage";

let defaultStorageInstance: LocalStorage | null = null;
let assetServiceInstance: AssetService | null = null;

function getDefaultStorage(): LocalStorage {
  if (!defaultStorageInstance) {
    defaultStorageInstance = new LocalStorage();
  }
  return defaultStorageInstance;
}

function getAssetService(): AssetService {
  if (!assetServiceInstance) {
    assetServiceInstance = new AssetService(getDefaultStorage());
  }
  return assetServiceInstance;
}

export interface UploadInput {
  userId: string;
  buffer: Buffer;
  filename: string;
  mimeType: string;
  kind: string;
  folderId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
}

export interface StorageQuotaCheck {
  allowed: boolean;
  usedBytes: number;
  totalBytes: number;
  remainingBytes: number;
  usagePercent: number;
}

export class StorageEngine {
  async upload(input: UploadInput): Promise<{ id: string; storageKey: string; sizeBytes: number }> {
    await this.checkQuota(input.userId, input.buffer.length);

    const id = generateId("file");
    const key = `files/${input.userId}/${id}/${input.filename}`;

    await getAssetService().store({
      id,
      kind: input.kind as any,
      data: input.buffer,
      metadata: { filename: input.filename, mimeType: input.mimeType, sizeBytes: input.buffer.length },
      lifetime: "permanent",
    });

    await db.insert(storageFile).values({
      id, userId: input.userId, storageKey: key, originalName: input.filename,
      mimeType: input.mimeType, sizeBytes: input.buffer.length, provider: "local",
      status: "ready", kind: input.kind, metadata: input.metadata || {},
      tags: input.tags || [], folderId: input.folderId || null, expiresAt: input.expiresAt || null,
    });

    await this.updateQuota(input.userId, input.buffer.length, input.kind);

    return { id, storageKey: key, sizeBytes: input.buffer.length };
  }

  async download(fileId: string): Promise<Buffer | null> {
    const file = await this.getFile(fileId);
    if (!file) return null;
    return getAssetService().retrieve(file.storageKey);
  }

  async getUrl(fileId: string): Promise<string | null> {
    const file = await this.getFile(fileId);
    if (!file) return null;
    return getAssetService().getDownloadUrl(file.storageKey);
  }

  async delete(fileId: string): Promise<boolean> {
    const file = await this.getFile(fileId);
    if (!file) return false;

    await getAssetService().delete(file.storageKey);
    await db.delete(storageFile).where(eq(storageFile.id, fileId));
    await this.updateQuota(file.userId, -file.sizeBytes, file.kind);
    return true;
  }

  async softDelete(fileId: string): Promise<boolean> {
    const [result] = await db.update(storageFile)
      .set({ status: "deleted", deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(storageFile.id, fileId))
      .returning();
    return !!result;
  }

  async restore(fileId: string): Promise<boolean> {
    const [result] = await db.update(storageFile)
      .set({ status: "ready", deletedAt: null, updatedAt: new Date() })
      .where(eq(storageFile.id, fileId))
      .returning();
    return !!result;
  }

  async getFile(fileId: string) {
    const [file] = await db.select().from(storageFile).where(eq(storageFile.id, fileId)).limit(1);
    return file;
  }

  async listFiles(userId: string, filters?: { kind?: string; status?: string; folderId?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(storageFile.userId, userId)];
    if (filters?.kind) conditions.push(eq(storageFile.kind, filters.kind));
    if (filters?.status) conditions.push(eq(storageFile.status, filters.status));
    if (filters?.folderId) conditions.push(eq(storageFile.folderId, filters.folderId));
    const where = and(...conditions);
    const [data, totalResult] = await Promise.all([
      db.select().from(storageFile).where(where).orderBy(desc(storageFile.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(storageFile).where(where),
    ]);
    return { data, total: Number(totalResult[0]?.count ?? 0), page, limit };
  }

  async checkQuota(userId: string, additionalBytes: number): Promise<StorageQuotaCheck> {
    const [quota] = await db.select().from(storageQuota).where(eq(storageQuota.userId, userId)).limit(1);
    const totalBytes = quota ? parseInt(quota.totalBytes) : 1073741824;
    const usedBytes = quota ? parseInt(quota.usedBytes) : 0;
    const remainingBytes = totalBytes - usedBytes;
    const usagePercent = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
    return { allowed: remainingBytes >= additionalBytes, usedBytes, totalBytes, remainingBytes, usagePercent };
  }

  async updateQuota(userId: string, sizeDelta: number, kind: string) {
    const [quota] = await db.select().from(storageQuota).where(eq(storageQuota.userId, userId)).limit(1);
    if (quota) {
      const updateData: Record<string, unknown> = {
        usedBytes: String(Math.max(0, parseInt(quota.usedBytes) + sizeDelta)),
        fileCount: Math.max(0, quota.fileCount + (sizeDelta > 0 ? 1 : -1)),
      };
      if (kind === "image") updateData.imageBytes = String(Math.max(0, parseInt(quota.imageBytes) + sizeDelta));
      else if (kind === "video") updateData.videoBytes = String(Math.max(0, parseInt(quota.videoBytes) + sizeDelta));
      else updateData.documentBytes = String(Math.max(0, parseInt(quota.documentBytes) + sizeDelta));
      await db.update(storageQuota).set(updateData).where(eq(storageQuota.userId, userId));
    } else if (sizeDelta > 0) {
      const id = generateId("quota");
      const kindBytes: Record<string, string> = { image: "0", video: "0", document: "0" };
      kindBytes[kind] = String(sizeDelta);
      await db.insert(storageQuota).values({ id, userId, usedBytes: String(sizeDelta), fileCount: 1, imageBytes: kindBytes.image, videoBytes: kindBytes.video, documentBytes: kindBytes.document });
    }
  }

  async getQuota(userId: string) {
    const [quota] = await db.select().from(storageQuota).where(eq(storageQuota.userId, userId)).limit(1);
    if (!quota) return { totalBytes: 1073741824, usedBytes: 0, imageBytes: 0, videoBytes: 0, documentBytes: 0, fileCount: 0, usagePercent: 0 };
    const total = parseInt(quota.totalBytes);
    const used = parseInt(quota.usedBytes);
    return { totalBytes: total, usedBytes: used, imageBytes: parseInt(quota.imageBytes), videoBytes: parseInt(quota.videoBytes), documentBytes: parseInt(quota.documentBytes), fileCount: quota.fileCount, usagePercent: total > 0 ? (used / total) * 100 : 0 };
  }

  async getStorageStats(userId: string) {
    const quota = await this.getQuota(userId);
    const [totalFiles] = await db.select({ count: sql<number>`count(*)` }).from(storageFile).where(eq(storageFile.userId, userId));
    const [largest] = await db.select().from(storageFile).where(eq(storageFile.userId, userId)).orderBy(desc(storageFile.sizeBytes)).limit(5);
    return { ...quota, totalFiles: Number(totalFiles?.count ?? 0), largestFiles: largest || [] };
  }

  async createFolder(userId: string, name: string, parentId?: string) {
    const id = generateId("folder");
    const parentPath = parentId ? (await this.getFolder(parentId))?.path || "" : "";
    const path = `${parentPath}/${name}`.replace(/\/+/g, "/");
    return db.insert(storageFolder).values({ id, userId, name, parentId: parentId || null, path }).returning().then(r => r[0]);
  }

  async getFolder(id: string) {
    const [folder] = await db.select().from(storageFolder).where(eq(storageFolder.id, id)).limit(1);
    return folder;
  }

  async listFolders(userId: string) {
    return db.select().from(storageFolder).where(eq(storageFolder.userId, userId)).orderBy(storageFolder.name);
  }

  async deleteFolder(id: string) {
    await db.delete(storageFolder).where(eq(storageFolder.id, id));
  }

  async getProviderHealth() {
    return db.select().from(storageProviderHealth).orderBy(storageProviderHealth.provider);
  }

  async recordProviderHealth(provider: string, status: string, latencyMs?: number, error?: string) {
    const [existing] = await db.select().from(storageProviderHealth).where(eq(storageProviderHealth.provider, provider)).limit(1);
    if (existing) {
      await db.update(storageProviderHealth).set({ status, latencyMs: latencyMs ?? existing.latencyMs, lastCheckedAt: new Date(), lastError: error || existing.lastError, updatedAt: new Date() }).where(eq(storageProviderHealth.id, existing.id));
    } else {
      const id = generateId("sph");
      await db.insert(storageProviderHealth).values({ id, provider, status, latencyMs: latencyMs || null, lastCheckedAt: new Date(), lastError: error || null });
    }
  }
}

export const storageEngine = new StorageEngine();
