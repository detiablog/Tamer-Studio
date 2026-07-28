import { db } from "@/lib/db";
import { cmsComponent } from "@/lib/db/schema/cms";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { CMSComponentRepository } from "./component.repository";
import type { CMSComponent, CMSPermission } from "../cms.types";

export class DefaultCMSComponentRepository implements CMSComponentRepository {
  async createComponent(component: CMSComponent): Promise<CMSComponent> {
    const now = new Date();
    const id = component.id ?? randomUUID();
    const [created] = await db.insert(cmsComponent).values({
      id,
      name: component.name,
      type: component.type,
      schema: component.schema ?? {},
      preview: component.preview,
      localization: component.localization ?? true,
      permissions: component.permissions ?? [],
      createdAt: now,
      updatedAt: now,
    }).returning();

    return this.mapRow(created);
  }

  async getComponent(id: string): Promise<CMSComponent | undefined> {
    const [component] = await db.select().from(cmsComponent).where(eq(cmsComponent.id, id)).limit(1);
    return component ? this.mapRow(component) : undefined;
  }

  async getComponentByType(type: string): Promise<CMSComponent | undefined> {
    const [component] = await db.select().from(cmsComponent).where(eq(cmsComponent.type, type)).limit(1);
    return component ? this.mapRow(component) : undefined;
  }

  async listComponents(): Promise<CMSComponent[]> {
    const components = await db.select().from(cmsComponent).orderBy(desc(cmsComponent.createdAt));
    return components.map(this.mapRow);
  }

  async updateComponent(id: string, updates: Partial<CMSComponent>): Promise<CMSComponent | undefined> {
    const existing = await this.getComponent(id);
    if (!existing) return undefined;

    const set: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updates.name !== undefined) set.name = updates.name;
    if (updates.type !== undefined) set.type = updates.type;
    if (updates.schema !== undefined) set.schema = updates.schema;
    if (updates.preview !== undefined) set.preview = updates.preview;
    if (updates.localization !== undefined) set.localization = updates.localization;
    if (updates.permissions !== undefined) set.permissions = updates.permissions;

    const [updated] = await db.update(cmsComponent).set(set).where(eq(cmsComponent.id, id)).returning();
    return updated ? this.mapRow(updated) : undefined;
  }

  async deleteComponent(id: string): Promise<void> {
    await db.delete(cmsComponent).where(eq(cmsComponent.id, id));
  }

  private mapRow(row: typeof cmsComponent.$inferSelect): CMSComponent {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      schema: row.schema ?? {},
      preview: row.preview ?? undefined,
      localization: row.localization,
      permissions: (row.permissions ?? []) as CMSPermission[],
      createdAt: typeof row.createdAt === 'string' ? row.createdAt : row.createdAt.toISOString(),
      updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : row.updatedAt.toISOString(),
    };
  }
}