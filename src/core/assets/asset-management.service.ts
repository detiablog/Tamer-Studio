import { db } from "@/lib/db";
import { asset, assetVersion, assetTag, assetCollection, assetCollectionItem, assetFavorite, assetDownload, assetLifecycleEvent, assetCleanupJob } from "@/lib/db/schema/asset";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export interface AssetFilters {
  userId?: string;
  kind?: string;
  status?: string;
  search?: string;
  tags?: string[];
  collectionId?: string;
  isFavorite?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateAssetInput {
  kind: string;
  metadata?: Record<string, unknown>;
  storageRef?: Record<string, unknown>;
  preview?: Record<string, unknown>;
  sourceExecutionId?: string;
  sourceWorkflowId?: string;
  sourcePromptId?: string;
  tags?: string[];
  createdBy: string;
}

export class AssetManagementService {
  async list(filters: AssetFilters = {}) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters.userId) conditions.push(eq(asset.createdBy, filters.userId));
    if (filters.kind) conditions.push(eq(asset.kind, filters.kind));
    if (filters.status) conditions.push(eq(asset.status, filters.status));
    if (filters.search) conditions.push(sql`${asset.metadata}::text ILIKE ${"%" + filters.search + "%"}`);
    if (filters.isFavorite) conditions.push(eq(asset.status, "active"));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select().from(asset).where(where).orderBy(desc(asset.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(asset).where(where),
    ]);
    return { data, total: Number(totalResult[0]?.count ?? 0), page, limit, totalPages: Math.ceil(Number(totalResult[0]?.count ?? 0) / limit) };
  }

  async getById(id: string) {
    const [item] = await db.select().from(asset).where(eq(asset.assetId, id)).limit(1);
    return item;
  }

  async create(input: CreateAssetInput) {
    const id = generateId("ast");
    const [item] = await db.insert(asset).values({
      assetId: id, kind: input.kind, status: "active",
      metadata: input.metadata || {}, storageRef: input.storageRef || {}, preview: input.preview || {},
      sourceExecutionId: input.sourceExecutionId || null, sourceWorkflowId: input.sourceWorkflowId || null,
      sourcePromptId: input.sourcePromptId || null, createdBy: input.createdBy,
    }).returning();
    if (input.tags?.length) {
      await db.insert(assetTag).values(input.tags.map(tag => ({ id: generateId("tag"), assetId: id, tag })));
    }
    await this.logLifecycle(id, "created", "active", "create");
    return item;
  }

  async update(id: string, data: Record<string, unknown>) {
    const [item] = await db.update(asset).set({ ...data, updatedAt: new Date() }).where(eq(asset.assetId, id)).returning();
    return item;
  }

  async delete(id: string) {
    const [item] = await db.select().from(asset).where(eq(asset.assetId, id)).limit(1);
    if (item) {
      await this.logLifecycle(id, item.status, "deleted", "delete");
      await db.update(asset).set({ status: "deleted", updatedAt: new Date() }).where(eq(asset.assetId, id));
    }
  }

  async archive(id: string) {
    const [item] = await db.select().from(asset).where(eq(asset.assetId, id)).limit(1);
    if (item) {
      await this.logLifecycle(id, item.status, "archived", "archive");
      await db.update(asset).set({ status: "archived", updatedAt: new Date() }).where(eq(asset.assetId, id));
    }
  }

  async restore(id: string) {
    const [item] = await db.select().from(asset).where(eq(asset.assetId, id)).limit(1);
    if (item) {
      const fromStatus = item.status === "deleted" ? "deleted" : "archived";
      await this.logLifecycle(id, fromStatus, "active", "restore");
      await db.update(asset).set({ status: "active", updatedAt: new Date() }).where(eq(asset.assetId, id));
    }
  }

  async addTags(id: string, tags: string[]) {
    if (tags.length === 0) return;
    await db.insert(assetTag).values(tags.map(tag => ({ id: generateId("tag"), assetId: id, tag })));
  }

  async removeTag(assetId: string, tag: string) {
    await db.delete(assetTag).where(and(eq(assetTag.assetId, assetId), eq(assetTag.tag, tag)));
  }

  async getTags(assetId: string) {
    return db.select().from(assetTag).where(eq(assetTag.assetId, assetId));
  }

  async toggleFavorite(assetId: string, userId: string) {
    const [existing] = await db.select().from(assetFavorite).where(and(eq(assetFavorite.assetId, assetId), eq(assetFavorite.userId, userId))).limit(1);
    if (existing) {
      await db.delete(assetFavorite).where(eq(assetFavorite.id, existing.id));
      return false;
    } else {
      await db.insert(assetFavorite).values({ id: generateId("fav"), assetId, userId });
      return true;
    }
  }

  async isFavorited(assetId: string, userId: string): Promise<boolean> {
    const [existing] = await db.select().from(assetFavorite).where(and(eq(assetFavorite.assetId, assetId), eq(assetFavorite.userId, userId))).limit(1);
    return !!existing;
  }

  async getFavorites(userId: string) {
    return db.select({ assetId: assetFavorite.assetId, createdAt: assetFavorite.createdAt }).from(assetFavorite).where(eq(assetFavorite.userId, userId)).orderBy(desc(assetFavorite.createdAt));
  }

  async logDownload(assetId: string, userId: string, format?: string, fileSize?: number) {
    return db.insert(assetDownload).values({ id: generateId("dl"), assetId, userId, format: format || "original", fileSize: fileSize || null });
  }

  async getDownloadCount(assetId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(assetDownload).where(eq(assetDownload.assetId, assetId));
    return Number(result?.count ?? 0);
  }

  async createVersion(assetId: string, version: string, metadata: Record<string, unknown>, storageRef: Record<string, unknown>, createdBy: string, changelog?: string) {
    const id = generateId("aver");
    const [item] = await db.insert(assetVersion).values({ id, assetId, version, metadata, storageRef, changelog: changelog || null, createdBy }).returning();
    await db.update(asset).set({ currentVersion: version, updatedAt: new Date() }).where(eq(asset.assetId, assetId));
    return item;
  }

  async getVersions(assetId: string) {
    return db.select().from(assetVersion).where(eq(assetVersion.assetId, assetId)).orderBy(desc(assetVersion.createdAt));
  }

  async getCollections(userId: string) {
    return db.select().from(assetCollection).where(eq(assetCollection.createdBy, userId)).orderBy(desc(assetCollection.updatedAt));
  }

  async createCollection(name: string, userId: string, description?: string) {
    const id = generateId("col");
    return db.insert(assetCollection).values({ id, name, createdBy: userId, description: description || null }).returning().then(r => r[0]);
  }

  async addToCollection(collectionId: string, assetId: string) {
    const id = generateId("coli");
    return db.insert(assetCollectionItem).values({ id, collectionId, assetId }).returning().then(r => r[0]);
  }

  async removeFromCollection(collectionId: string, assetId: string) {
    await db.delete(assetCollectionItem).where(and(eq(assetCollectionItem.collectionId, collectionId), eq(assetCollectionItem.assetId, assetId)));
  }

  async getCollectionAssets(collectionId: string) {
    return db.select({ assetId: assetCollectionItem.assetId }).from(assetCollectionItem).where(eq(assetCollectionItem.collectionId, collectionId));
  }

  async scheduleCleanup(assetId: string, reason: string) {
    const id = generateId("clean");
    return db.insert(assetCleanupJob).values({ id, assetId, reason }).returning().then(r => r[0]);
  }

  async getStats(userId?: string) {
    const baseCond = userId ? eq(asset.createdBy, userId) : undefined;
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(asset).where(baseCond);
    const [active] = await db.select({ count: sql<number>`count(*)` }).from(asset).where(baseCond ? and(baseCond, eq(asset.status, "active")) : eq(asset.status, "active"));
    const [images] = await db.select({ count: sql<number>`count(*)` }).from(asset).where(baseCond ? and(baseCond, eq(asset.kind, "image")) : eq(asset.kind, "image"));
    const [videos] = await db.select({ count: sql<number>`count(*)` }).from(asset).where(baseCond ? and(baseCond, eq(asset.kind, "video")) : eq(asset.kind, "video"));
    return {
      total: Number(total?.count ?? 0), active: Number(active?.count ?? 0),
      images: Number(images?.count ?? 0), videos: Number(videos?.count ?? 0),
    };
  }

  private async logLifecycle(assetId: string, fromStatus: string, toStatus: string, trigger: string) {
    await db.insert(assetLifecycleEvent).values({
      id: generateId("lc"),
      assetId,
      fromStatus,
      toStatus,
      trigger,
    });
  }
}

export const assetManagementService = new AssetManagementService();
