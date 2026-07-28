import { db } from "@/lib/db";
import { landingSection, landingMedia } from "@/lib/db/schema/landing";
import { eq, and, asc, desc, sql, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface LandingSectionRow {
  id: string;
  sectionKey: string;
  title: string;
  description: string | null;
  component: string | null;
  type: string;
  visible: boolean;
  locked: boolean;
  order: number;
  config: Record<string, unknown> | null;
  styles: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LandingMediaRow {
  id: string;
  sectionKey: string;
  url: string;
  alt: string | null;
  type: string;
  order: number;
  createdAt: Date;
}

export class LandingRepository {
  async findSections(filters?: {
    type?: string;
    visible?: boolean;
    locked?: boolean;
    limit?: number;
  }): Promise<LandingSectionRow[]> {
    const conditions: any[] = [];

    if (filters?.type) {
      conditions.push(eq(landingSection.type, filters.type));
    }
    if (filters?.visible !== undefined) {
      conditions.push(eq(landingSection.visible, filters.visible));
    }
    if (filters?.locked !== undefined) {
      conditions.push(eq(landingSection.locked, filters.locked));
    }

    let query = db.select().from(landingSection);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    return query
      .orderBy(asc(landingSection.order), desc(landingSection.createdAt))
      .limit(filters?.limit || 500);
  }

  async findSectionByKey(sectionKey: string): Promise<LandingSectionRow | undefined> {
    const sections = await db.select().from(landingSection).where(eq(landingSection.sectionKey, sectionKey)).limit(1);
    return sections[0];
  }

  async findMediaBySectionKeys(sectionKeys: string[]): Promise<LandingMediaRow[]> {
    if (sectionKeys.length === 0) return [];
    try {
      return await db
        .select()
        .from(landingMedia)
        .where(inArray(landingMedia.sectionKey, sectionKeys))
        .orderBy(asc(landingMedia.order));
    } catch {
      return [];
    }
  }

  async findMediaBySectionKey(sectionKey: string): Promise<LandingMediaRow[]> {
    try {
      return await db
        .select()
        .from(landingMedia)
        .where(eq(landingMedia.sectionKey, sectionKey))
        .orderBy(asc(landingMedia.order));
    } catch {
      return [];
    }
  }

  async getMaxOrder(): Promise<number> {
    const result = await db.select({ max: sql<number>`MAX(${landingSection.order})` }).from(landingSection);
    return result[0]?.max ?? -1;
  }

  async createSection(data: {
    id: string;
    sectionKey: string;
    title: string;
    description?: string | null;
    component?: string;
    type?: string;
    visible?: boolean;
    locked?: boolean;
    order: number;
    config?: Record<string, unknown>;
    styles?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<LandingSectionRow> {
    const [created] = await db.insert(landingSection).values({
      ...data,
      description: data.description ?? null,
      component: data.component ?? "",
      type: data.type || "hero",
      visible: data.visible ?? true,
      locked: data.locked ?? false,
      config: (data.config ?? {}) as Record<string, unknown>,
      styles: (data.styles ?? {}) as Record<string, unknown>,
    }).returning();
    return created;
  }

  async createMedia(mediaItems: Array<{
    id: string;
    sectionKey: string;
    url: string;
    alt?: string | null;
    type?: string;
    order?: number;
    createdAt: Date;
  }>): Promise<void> {
    if (mediaItems.length === 0) return;
    await db.insert(landingMedia).values(
      mediaItems.map((m) => ({
        id: m.id,
        sectionKey: m.sectionKey,
        url: m.url,
        alt: m.alt ?? "",
        type: m.type || "image",
        order: typeof m.order === "number" ? m.order : 0,
        createdAt: m.createdAt,
      }))
    );
  }

  async updateSection(sectionKey: string, updates: Record<string, unknown>): Promise<LandingSectionRow | undefined> {
    const [updated] = await db.update(landingSection).set(updates).where(eq(landingSection.sectionKey, sectionKey)).returning();
    return updated;
  }

  async deleteMediaBySectionKey(sectionKey: string): Promise<void> {
    await db.delete(landingMedia).where(eq(landingMedia.sectionKey, sectionKey));
  }

  async deleteSection(sectionKey: string): Promise<void> {
    await db.delete(landingSection).where(eq(landingSection.sectionKey, sectionKey));
  }

  async findSectionsWithOrderGreaterThan(order: number): Promise<LandingSectionRow[]> {
    return db.select().from(landingSection).where(sql`${landingSection.order} > ${order}`).orderBy(asc(landingSection.order));
  }

  async updateSectionOrder(sectionKey: string, order: number): Promise<void> {
    await db.update(landingSection).set({ order, updatedAt: new Date() }).where(eq(landingSection.sectionKey, sectionKey));
  }

  async findSectionsByKeys(sectionKeys: string[]): Promise<LandingSectionRow[]> {
    return db.select().from(landingSection).where(inArray(landingSection.sectionKey, sectionKeys));
  }

  async runTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return db.transaction(fn);
  }
}

export const landingRepository = new LandingRepository();
