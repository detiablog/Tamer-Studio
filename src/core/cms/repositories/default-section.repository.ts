import { db } from "@/lib/db";
import { cmsSection } from "@/lib/db/schema/cms";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { CMSSectionRepository } from "./section.repository";
import type { CMSSection } from "../cms.types";

export class DefaultCMSSectionRepository implements CMSSectionRepository {
  async createSection(section: CMSSection): Promise<CMSSection> {
    const now = new Date();
    const id = section.id ?? randomUUID();
    const [created] = await db.insert(cmsSection).values({
      id,
      pageId: section.pageId,
      sectionKey: section.sectionKey,
      type: section.type,
      title: section.title,
      description: section.description ?? null,
      component: section.component ?? "",
      order: section.order,
      visible: section.visible ?? true,
      locked: section.locked ?? false,
      config: section.config ?? {},
      styles: section.styles ?? {},
      createdAt: now,
      updatedAt: now,
    }).returning();

    return this.mapRow(created);
  }

  async getSection(id: string): Promise<CMSSection | undefined> {
    const [section] = await db.select().from(cmsSection).where(eq(cmsSection.id, id)).limit(1);
    return section ? this.mapRow(section) : undefined;
  }

  async getSectionsByPageId(pageId: string): Promise<CMSSection[]> {
    const sections = await db
      .select()
      .from(cmsSection)
      .where(eq(cmsSection.pageId, pageId))
      .orderBy(cmsSection.order);
    return sections.map(this.mapRow);
  }

  async updateSection(id: string, updates: Partial<CMSSection>): Promise<CMSSection | undefined> {
    const existing = await this.getSection(id);
    if (!existing) return undefined;

    const set: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updates.type !== undefined) set.type = updates.type;
    if (updates.title !== undefined) set.title = updates.title;
    if (updates.description !== undefined) set.description = updates.description ?? null;
    if (updates.component !== undefined) set.component = updates.component ?? "";
    if (updates.order !== undefined) set.order = updates.order;
    if (updates.visible !== undefined) set.visible = updates.visible;
    if (updates.locked !== undefined) set.locked = updates.locked;
    if (updates.config !== undefined) set.config = updates.config;
    if (updates.styles !== undefined) set.styles = updates.styles;

    const [updated] = await db.update(cmsSection).set(set).where(eq(cmsSection.id, id)).returning();
    return updated ? this.mapRow(updated) : undefined;
  }

  async deleteSection(id: string): Promise<void> {
    await db.delete(cmsSection).where(eq(cmsSection.id, id));
  }

  async reorderSections(pageId: string, sectionOrders: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of sectionOrders) {
      await db.update(cmsSection).set({ order, updatedAt: new Date().toISOString() }).where(and(eq(cmsSection.id, id), eq(cmsSection.pageId, pageId)));
    }
  }

  private mapRow(row: typeof cmsSection.$inferSelect): CMSSection {
    return {
      id: row.id,
      pageId: row.pageId,
      sectionKey: row.sectionKey,
      type: row.type,
      title: row.title,
      description: row.description ?? undefined,
      component: row.component ?? undefined,
      order: row.order,
      visible: row.visible,
      locked: row.locked,
      config: row.config ?? {},
      styles: row.styles ?? {},
      media: [],
      createdAt: typeof row.createdAt === 'string' ? row.createdAt : row.createdAt.toISOString(),
      updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : row.updatedAt.toISOString(),
    };
  }
}