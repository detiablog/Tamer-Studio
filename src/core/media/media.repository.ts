import { db } from "@/lib/db";
import { userMedia } from "@/lib/db/schema/media";
import { eq, and, desc } from "drizzle-orm";
import type { UserMedia, CreateMediaInput, UpdateMediaInput } from "./media.types";
import { randomUUID } from "crypto";

export class MediaRepository {
  async create(input: CreateMediaInput): Promise<UserMedia> {
    const id = `media_${randomUUID()}`;
    const now = new Date();

    const [row] = await db
      .insert(userMedia)
      .values({
        id,
        userId: input.userId,
        filename: input.filename,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        kind: input.kind,
        storageKey: input.storageKey,
        status: "active",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return this.mapMedia(row);
  }

  async findById(id: string): Promise<UserMedia | undefined> {
    const rows = await db
      .select()
      .from(userMedia)
      .where(eq(userMedia.id, id))
      .limit(1);
    if (rows.length === 0) return undefined;
    return this.mapMedia(rows[0]);
  }

  async findByUserId(userId: string): Promise<UserMedia[]> {
    const rows = await db
      .select()
      .from(userMedia)
      .where(and(eq(userMedia.userId, userId), eq(userMedia.status, "active")))
      .orderBy(desc(userMedia.createdAt));
    return rows.map(this.mapMedia);
  }

  async update(id: string, updates: UpdateMediaInput): Promise<UserMedia | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;

    const setValues: Record<string, unknown> = { updatedAt: new Date() };
    if (updates.filename !== undefined) setValues.filename = updates.filename;
    if (updates.status !== undefined) setValues.status = updates.status;

    const [row] = await db
      .update(userMedia)
      .set(setValues)
      .where(eq(userMedia.id, id))
      .returning();

    return this.mapMedia(row);
  }

  async delete(id: string): Promise<boolean> {
    const [row] = await db
      .delete(userMedia)
      .where(eq(userMedia.id, id))
      .returning({ id: userMedia.id });
    return !!row;
  }

  private mapMedia(row: typeof userMedia.$inferSelect): UserMedia {
    return {
      id: row.id,
      userId: row.userId,
      filename: row.filename,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      kind: row.kind as UserMedia["kind"],
      storageKey: row.storageKey,
      status: row.status as UserMedia["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
