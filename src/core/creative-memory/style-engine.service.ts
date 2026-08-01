import { db } from "@/lib/db";
import {
  creativeVisualMemory,
  creativeThumbnailMemory,
  creativeCaptionMemory,
} from "@/lib/db/schema/creative-memory";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class StyleEngineService {
  async listVisualMemories(userId: string, filters?: { projectId?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(creativeVisualMemory.userId, userId)];
    if (filters?.projectId) conditions.push(eq(creativeVisualMemory.projectId, filters.projectId));
    if (filters?.search) conditions.push(like(creativeVisualMemory.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(creativeVisualMemory).where(where).orderBy(desc(creativeVisualMemory.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(creativeVisualMemory).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createVisualMemory(userId: string, data: { projectId?: string; name: string; colorPalette?: string[]; composition?: string; lighting?: string; cameraAngle?: string; lensStyle?: string; aspectRatio?: string; backgroundStyle?: string; characterPosition?: string; depthOfField?: string; mood?: string; contrast?: string; visualIdentity?: Record<string, unknown>; preferredModels?: string[]; preferredResolution?: string; isActive?: boolean; metadata?: Record<string, unknown> }) {
    const id = generateId("cvis");
    return db.insert(creativeVisualMemory).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getVisualMemory(id: string) {
    const [item] = await db.select().from(creativeVisualMemory).where(eq(creativeVisualMemory.id, id)).limit(1);
    return item || null;
  }

  async updateVisualMemory(id: string, data: Record<string, unknown>) {
    return db.update(creativeVisualMemory).set(data).where(eq(creativeVisualMemory.id, id)).returning().then(r => r[0]);
  }

  async deleteVisualMemory(id: string) {
    await db.delete(creativeVisualMemory).where(eq(creativeVisualMemory.id, id));
  }

  async listThumbnailMemories(userId: string, filters?: { projectId?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(creativeThumbnailMemory.userId, userId)];
    if (filters?.projectId) conditions.push(eq(creativeThumbnailMemory.projectId, filters.projectId));
    if (filters?.search) conditions.push(like(creativeThumbnailMemory.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(creativeThumbnailMemory).where(where).orderBy(desc(creativeThumbnailMemory.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(creativeThumbnailMemory).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createThumbnailMemory(userId: string, data: { projectId?: string; name: string; layout?: Record<string, unknown>; textPosition?: string; colorStyle?: string; subjectPlacement?: string; brandElements?: Record<string, unknown>; successfulVariants?: Record<string, unknown>[]; ctrHistory?: number[]; isActive?: boolean; metadata?: Record<string, unknown> }) {
    const id = generateId("cthm");
    return db.insert(creativeThumbnailMemory).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getThumbnailMemory(id: string) {
    const [item] = await db.select().from(creativeThumbnailMemory).where(eq(creativeThumbnailMemory.id, id)).limit(1);
    return item || null;
  }

  async updateThumbnailMemory(id: string, data: Record<string, unknown>) {
    return db.update(creativeThumbnailMemory).set(data).where(eq(creativeThumbnailMemory.id, id)).returning().then(r => r[0]);
  }

  async deleteThumbnailMemory(id: string) {
    await db.delete(creativeThumbnailMemory).where(eq(creativeThumbnailMemory.id, id));
  }

  async listCaptionMemories(userId: string, filters?: { projectId?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(creativeCaptionMemory.userId, userId)];
    if (filters?.projectId) conditions.push(eq(creativeCaptionMemory.projectId, filters.projectId));
    if (filters?.search) conditions.push(like(creativeCaptionMemory.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(creativeCaptionMemory).where(where).orderBy(desc(creativeCaptionMemory.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(creativeCaptionMemory).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createCaptionMemory(userId: string, data: { projectId?: string; name: string; writingStyle?: string; preferredLength?: string; emojiUsage?: string; ctaStyle?: string; hashtags?: string[]; platformVariations?: Record<string, unknown>; bestPerforming?: Record<string, unknown>[]; isActive?: boolean; metadata?: Record<string, unknown> }) {
    const id = generateId("ccap");
    return db.insert(creativeCaptionMemory).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getCaptionMemory(id: string) {
    const [item] = await db.select().from(creativeCaptionMemory).where(eq(creativeCaptionMemory.id, id)).limit(1);
    return item || null;
  }

  async updateCaptionMemory(id: string, data: Record<string, unknown>) {
    return db.update(creativeCaptionMemory).set(data).where(eq(creativeCaptionMemory.id, id)).returning().then(r => r[0]);
  }

  async deleteCaptionMemory(id: string) {
    await db.delete(creativeCaptionMemory).where(eq(creativeCaptionMemory.id, id));
  }

  async getStyleStats(userId: string) {
    const visualConditions = [eq(creativeVisualMemory.userId, userId)];
    const thumbConditions = [eq(creativeThumbnailMemory.userId, userId)];
    const captionConditions = [eq(creativeCaptionMemory.userId, userId)];

    const [totalVisualMemories] = await db.select({ count: sql<number>`count(*)` }).from(creativeVisualMemory).where(and(...visualConditions));
    const [activeVisualMemories] = await db.select({ count: sql<number>`count(*)` }).from(creativeVisualMemory).where(and(...visualConditions, eq(creativeVisualMemory.isActive, true)));
    const [totalThumbnailMemories] = await db.select({ count: sql<number>`count(*)` }).from(creativeThumbnailMemory).where(and(...thumbConditions));
    const [activeThumbnailMemories] = await db.select({ count: sql<number>`count(*)` }).from(creativeThumbnailMemory).where(and(...thumbConditions, eq(creativeThumbnailMemory.isActive, true)));
    const [totalCaptionMemories] = await db.select({ count: sql<number>`count(*)` }).from(creativeCaptionMemory).where(and(...captionConditions));
    const [activeCaptionMemories] = await db.select({ count: sql<number>`count(*)` }).from(creativeCaptionMemory).where(and(...captionConditions, eq(creativeCaptionMemory.isActive, true)));

    const moodCounts = await db.select({
      mood: creativeVisualMemory.mood,
      count: sql<number>`count(*)`,
    }).from(creativeVisualMemory).where(and(...visualConditions)).groupBy(creativeVisualMemory.mood);

    const compositionCounts = await db.select({
      composition: creativeVisualMemory.composition,
      count: sql<number>`count(*)`,
    }).from(creativeVisualMemory).where(and(...visualConditions)).groupBy(creativeVisualMemory.composition);

    return {
      totalVisualMemories: Number(totalVisualMemories?.count ?? 0),
      activeVisualMemories: Number(activeVisualMemories?.count ?? 0),
      totalThumbnailMemories: Number(totalThumbnailMemories?.count ?? 0),
      activeThumbnailMemories: Number(activeThumbnailMemories?.count ?? 0),
      totalCaptionMemories: Number(totalCaptionMemories?.count ?? 0),
      activeCaptionMemories: Number(activeCaptionMemories?.count ?? 0),
      moodCounts,
      compositionCounts,
    };
  }

  async getActiveVisualStyle(userId: string, projectId?: string) {
    const conditions = [eq(creativeVisualMemory.userId, userId), eq(creativeVisualMemory.isActive, true)];
    if (projectId) conditions.push(eq(creativeVisualMemory.projectId, projectId));
    const [item] = await db.select().from(creativeVisualMemory).where(and(...conditions)).orderBy(desc(creativeVisualMemory.updatedAt)).limit(1);
    return item || null;
  }
}

export const styleEngineService = new StyleEngineService();
