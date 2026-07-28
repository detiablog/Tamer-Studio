import { db } from "@/lib/db";
import { cmsBlock } from "@/lib/db/schema/cms";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { CMSBlockRepository } from "./block.repository";
import type { CMSBlock } from "../cms.types";

export class DefaultCMSBlockRepository implements CMSBlockRepository {
  async createBlock(block: CMSBlock): Promise<CMSBlock> {
    const now = new Date().toISOString();
    const id = block.id ?? randomUUID();
    const [created] = await db.insert(cmsBlock).values({
      id,
      sectionId: block.sectionId,
      type: block.type,
      properties: block.properties ?? {},
      order: block.order,
      visible: block.visible ?? true,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return this.mapRow(created);
  }

  async getBlock(id: string): Promise<CMSBlock | undefined> {
    const [block] = await db.select().from(cmsBlock).where(eq(cmsBlock.id, id)).limit(1);
    return block ? this.mapRow(block) : undefined;
  }

  async getBlocksBySectionId(sectionId: string): Promise<CMSBlock[]> {
    const blocks = await db
      .select()
      .from(cmsBlock)
      .where(eq(cmsBlock.sectionId, sectionId))
      .orderBy(cmsBlock.order);
    return blocks.map(this.mapRow);
  }

  async updateBlock(id: string, updates: Partial<CMSBlock>): Promise<CMSBlock | undefined> {
    const existing = await this.getBlock(id);
    if (!existing) return undefined;

    const set: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (updates.type !== undefined) set.type = updates.type;
    if (updates.properties !== undefined) set.properties = updates.properties;
    if (updates.order !== undefined) set.order = updates.order;
    if (updates.visible !== undefined) set.visible = updates.visible;

    const [updated] = await db.update(cmsBlock).set(set).where(eq(cmsBlock.id, id)).returning();
    return updated ? this.mapRow(updated) : undefined;
  }

  async deleteBlock(id: string): Promise<void> {
    await db.delete(cmsBlock).where(eq(cmsBlock.id, id));
  }

  private mapRow(row: typeof cmsBlock.$inferSelect): CMSBlock {
    return {
      id: row.id,
      sectionId: row.sectionId,
      type: row.type,
      properties: row.properties ?? {},
      order: row.order,
      visible: row.visible,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}