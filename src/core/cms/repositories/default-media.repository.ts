import { db } from "@/lib/db";
import { cmsMedia } from "@/lib/db/schema/cms";
import { eq, and, desc, type SQLWrapper } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { CMSMediaRepository } from "./media.repository";
import type { CMSMedia } from "../cms.types";

export class DefaultCMSMediaRepository implements CMSMediaRepository {
  async createMedia(media: CMSMedia): Promise<CMSMedia> {
    const now = new Date();
    const id = media.id ?? randomUUID();
    const [created] = await db.insert(cmsMedia).values({
      id,
      filename: media.filename,
      url: media.url,
      alt: media.alt,
      type: media.type,
      size: media.size,
      folder: media.folder,
      metadata: media.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    }).returning();

    return this.mapRow(created);
  }

  async getMedia(id: string): Promise<CMSMedia | undefined> {
    const [media] = await db.select().from(cmsMedia).where(eq(cmsMedia.id, id)).limit(1);
    return media ? this.mapRow(media) : undefined;
  }

  async listMedia(filters?: { folder?: string; type?: string }): Promise<CMSMedia[]> {
    const conditions: SQLWrapper[] = [];

    if (filters?.folder !== undefined) {
      conditions.push(eq(cmsMedia.folder, filters.folder));
    }
    if (filters?.type !== undefined) {
      conditions.push(eq(cmsMedia.type, filters.type));
    }

    const mediaList = conditions.length > 0
      ? await db.select().from(cmsMedia).where(and(...conditions)).orderBy(desc(cmsMedia.createdAt))
      : await db.select().from(cmsMedia).orderBy(desc(cmsMedia.createdAt));

    return mediaList.map(this.mapRow);
  }

  async updateMedia(id: string, updates: Partial<CMSMedia>): Promise<CMSMedia | undefined> {
    const existing = await this.getMedia(id);
    if (!existing) return undefined;

    const set: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updates.filename !== undefined) set.filename = updates.filename;
    if (updates.url !== undefined) set.url = updates.url;
    if (updates.alt !== undefined) set.alt = updates.alt;
    if (updates.type !== undefined) set.type = updates.type;
    if (updates.size !== undefined) set.size = updates.size;
    if (updates.folder !== undefined) set.folder = updates.folder;
    if (updates.metadata !== undefined) set.metadata = updates.metadata;

    const [updated] = await db.update(cmsMedia).set(set).where(eq(cmsMedia.id, id)).returning();
    return updated ? this.mapRow(updated) : undefined;
  }

  async deleteMedia(id: string): Promise<void> {
    await db.delete(cmsMedia).where(eq(cmsMedia.id, id));
  }

  private mapRow(row: typeof cmsMedia.$inferSelect): CMSMedia {
    return {
      id: row.id,
      filename: row.filename,
      url: row.url,
      alt: row.alt ?? undefined,
      type: row.type,
      size: row.size,
      folder: row.folder ?? undefined,
      metadata: row.metadata ?? {},
      createdAt: typeof row.createdAt === 'string' ? row.createdAt : row.createdAt.toISOString(),
      updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : row.updatedAt.toISOString(),
    };
  }
}