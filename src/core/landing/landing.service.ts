import { db } from "@/lib/db";
import { landingSection, landingMedia } from "@/lib/db/schema/landing";
import { eq, and, asc, desc, sql, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface LandingSection {
  id: string;
  sectionKey: string;
  title: string;
  description?: string;
  component?: string;
  type: string;
  visible: boolean;
  locked: boolean;
  order: number;
  config: Record<string, unknown>;
  styles: Record<string, unknown>;
  media: LandingMedia[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LandingMedia {
  id: string;
  sectionKey: string;
  url: string;
  alt?: string;
  type: string;
  order: number;
  createdAt: Date;
}

export interface CreateSectionInput {
  sectionKey: string;
  title: string;
  description?: string;
  component?: string;
  type?: string;
  visible?: boolean;
  locked?: boolean;
  order?: number;
  config?: Record<string, unknown>;
  styles?: Record<string, unknown>;
  media?: Array<{
    url: string;
    alt?: string;
    type?: string;
    order?: number;
  }>;
}

export interface UpdateSectionInput {
  title?: string;
  description?: string;
  component?: string;
  type?: string;
  visible?: boolean;
  locked?: boolean;
  order?: number;
  config?: Record<string, unknown>;
  styles?: Record<string, unknown>;
}

export class LandingService {
  async listSections(filters?: {
    search?: string;
    type?: string;
    visible?: boolean;
    locked?: boolean;
    limit?: number;
  }): Promise<LandingSection[]> {
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

    const sections = await query
      .orderBy(asc(landingSection.order), desc(landingSection.createdAt))
      .limit(filters?.limit || 500);

    const sectionKeys = sections.map((s) => s.sectionKey);
    let mediaRows: LandingMedia[] = [];

    if (sectionKeys.length > 0) {
      try {
        const media = await db
          .select()
          .from(landingMedia)
          .where(inArray(landingMedia.sectionKey, sectionKeys))
          .orderBy(asc(landingMedia.order));
        mediaRows = media.map((m) => ({
          id: m.id,
          sectionKey: m.sectionKey,
          url: m.url,
          alt: m.alt || undefined,
          type: m.type,
          order: m.order,
          createdAt: m.createdAt,
        }));
      } catch {
        // media table may not exist yet
      }
    }

    const mediaBySection = mediaRows.reduce<Record<string, LandingMedia[]>>((acc, m) => {
      if (!acc[m.sectionKey]) acc[m.sectionKey] = [];
      acc[m.sectionKey].push(m);
      return acc;
    }, {});

    return sections.map((section) => ({
      id: section.id,
      sectionKey: section.sectionKey,
      title: section.title,
      description: section.description || undefined,
      component: section.component || undefined,
      type: section.type,
      visible: section.visible,
      locked: section.locked,
      order: section.order,
      config: (section.config as Record<string, unknown>) || {},
      styles: (section.styles as Record<string, unknown>) || {},
      media: mediaBySection[section.sectionKey] || [],
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    }));
  }

  async getSectionByKey(sectionKey: string): Promise<LandingSection | undefined> {
    const sections = await db.select().from(landingSection).where(eq(landingSection.sectionKey, sectionKey)).limit(1);
    if (sections.length === 0) return undefined;

    const section = sections[0];
    let media: LandingMedia[] = [];
    try {
      const mediaRows = await db.select().from(landingMedia).where(eq(landingMedia.sectionKey, sectionKey)).orderBy(asc(landingMedia.order));
      media = mediaRows.map((m) => ({
        id: m.id,
        sectionKey: m.sectionKey,
        url: m.url,
        alt: m.alt || undefined,
        type: m.type,
        order: m.order,
        createdAt: m.createdAt,
      }));
    } catch {
      // media table may not exist yet
    }

    return {
      id: section.id,
      sectionKey: section.sectionKey,
      title: section.title,
      description: section.description || undefined,
      component: section.component || undefined,
      type: section.type,
      visible: section.visible,
      locked: section.locked,
      order: section.order,
      config: (section.config as Record<string, unknown>) || {},
      styles: (section.styles as Record<string, unknown>) || {},
      media,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    };
  }

  async createSection(input: CreateSectionInput): Promise<LandingSection> {
    const id = randomUUID();
    const now = new Date();
    const maxOrder = await db.select({ max: sql<number>`MAX(${landingSection.order})` }).from(landingSection).then((r) => r[0]?.max ?? -1);
    const sectionOrder = typeof input.order === "number" ? input.order : maxOrder + 1;

    const result = await db.transaction(async (tx) => {
      const [created] = await tx.insert(landingSection).values({
        id,
        sectionKey: input.sectionKey,
        title: input.title,
        description: input.description ?? null,
        component: input.component ?? "",
        type: input.type || "hero",
        visible: input.visible ?? true,
        locked: input.locked ?? false,
        order: sectionOrder,
        config: (input.config ?? {}) as Record<string, unknown>,
        styles: (input.styles ?? {}) as Record<string, unknown>,
        createdAt: now,
        updatedAt: now,
      }).returning();

      if (input.media && input.media.length > 0) {
        await tx.insert(landingMedia).values(
          input.media.map((m, idx) => ({
            id: randomUUID(),
            sectionKey: input.sectionKey,
            url: m.url,
            alt: m.alt ?? "",
            type: m.type || "image",
            order: typeof m.order === "number" ? m.order : idx,
            createdAt: now,
          }))
        );
      }

      return created;
    });

    return {
      id: result.id,
      sectionKey: result.sectionKey,
      title: result.title,
      description: result.description || undefined,
      component: result.component || undefined,
      type: result.type,
      visible: result.visible,
      locked: result.locked,
      order: result.order,
      config: (result.config as Record<string, unknown>) || {},
      styles: (result.styles as Record<string, unknown>) || {},
      media: input.media?.map((m, idx) => ({
        id: randomUUID(),
        sectionKey: input.sectionKey,
        url: m.url,
        alt: m.alt,
        type: m.type || "image",
        order: typeof m.order === "number" ? m.order : idx,
        createdAt: now,
      })) || [],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async updateSection(sectionKey: string, input: UpdateSectionInput): Promise<LandingSection> {
    const existing = await db.select().from(landingSection).where(eq(landingSection.sectionKey, sectionKey)).limit(1);
    if (existing.length === 0) throw new Error("Section not found");

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (input.title !== undefined) updates.title = input.title;
    if (input.description !== undefined) updates.description = input.description;
    if (input.component !== undefined) updates.component = input.component;
    if (input.type !== undefined) updates.type = input.type;
    if (input.visible !== undefined) updates.visible = input.visible;
    if (input.locked !== undefined) updates.locked = input.locked;
    if (input.order !== undefined) updates.order = input.order;
    if (input.config !== undefined) updates.config = input.config;
    if (input.styles !== undefined) updates.styles = input.styles;

    const [updated] = await db.update(landingSection).set(updates).where(eq(landingSection.sectionKey, sectionKey)).returning();

    const media: LandingMedia[] = [];
    try {
      const mediaRows = await db.select().from(landingMedia).where(eq(landingMedia.sectionKey, sectionKey)).orderBy(asc(landingMedia.order));
      media.push(...mediaRows.map((m) => ({
        id: m.id,
        sectionKey: m.sectionKey,
        url: m.url,
        alt: m.alt || undefined,
        type: m.type,
        order: m.order,
        createdAt: m.createdAt,
      })));
    } catch {
      // media table may not exist yet
    }

    return {
      id: updated.id,
      sectionKey: updated.sectionKey,
      title: updated.title,
      description: updated.description || undefined,
      component: updated.component || undefined,
      type: updated.type,
      visible: updated.visible,
      locked: updated.locked,
      order: updated.order,
      config: (updated.config as Record<string, unknown>) || {},
      styles: (updated.styles as Record<string, unknown>) || {},
      media,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteSection(sectionKey: string): Promise<boolean> {
    const existing = await db.select().from(landingSection).where(eq(landingSection.sectionKey, sectionKey)).limit(1);
    if (existing.length === 0) return false;

    const deletedOrder = existing[0].order;

    await db.transaction(async (tx) => {
      await tx.delete(landingMedia).where(eq(landingMedia.sectionKey, sectionKey));
      await tx.delete(landingSection).where(eq(landingSection.sectionKey, sectionKey));

      const remaining = await tx.select().from(landingSection).where(sql`${landingSection.order} > ${deletedOrder}`).orderBy(asc(landingSection.order));
      for (const s of remaining) {
        await tx.update(landingSection).set({ order: s.order - 1 }).where(eq(landingSection.sectionKey, s.sectionKey));
      }
    });

    return true;
  }

  async duplicateSection(sectionKey: string, newSectionKey: string): Promise<LandingSection> {
    const existing = await db.select().from(landingSection).where(eq(landingSection.sectionKey, sectionKey)).limit(1);
    if (existing.length === 0) throw new Error("Section not found");

    const source = existing[0];
    const maxOrder = await db.select({ max: sql<number>`MAX(${landingSection.order})` }).from(landingSection).then((r) => r[0]?.max ?? -1);
    const now = new Date();
    const newId = randomUUID();

    let mediaRows: LandingMedia[] = [];
    try {
      const rows = await db.select().from(landingMedia).where(eq(landingMedia.sectionKey, sectionKey)).orderBy(asc(landingMedia.order));
      mediaRows = rows.map((m) => ({
        id: m.id,
        sectionKey: m.sectionKey,
        url: m.url,
        alt: m.alt || undefined,
        type: m.type,
        order: m.order,
        createdAt: m.createdAt,
      }));
    } catch {
      // media table may not exist yet
    }

    const result = await db.transaction(async (tx) => {
      const [created] = await tx.insert(landingSection).values({
        id: newId,
        sectionKey: newSectionKey,
        title: `${source.title} (Copy)`,
        description: source.description,
        component: source.component,
        type: source.type,
        visible: source.visible,
        locked: false,
        order: maxOrder + 1,
        config: (source.config as Record<string, unknown>) || {},
        styles: (source.styles as Record<string, unknown>) || {},
        createdAt: now,
        updatedAt: now,
      }).returning();

      if (mediaRows.length > 0) {
        await tx.insert(landingMedia).values(
          mediaRows.map((m) => ({
            id: randomUUID(),
            sectionKey: newSectionKey,
            url: m.url,
            alt: m.alt ?? "",
            type: m.type,
            order: m.order,
            createdAt: now,
          }))
        );
      }

      return created;
    });

    return {
      id: result.id,
      sectionKey: result.sectionKey,
      title: result.title,
      description: result.description || undefined,
      component: result.component || undefined,
      type: result.type,
      visible: result.visible,
      locked: result.locked,
      order: result.order,
      config: (result.config as Record<string, unknown>) || {},
      styles: (result.styles as Record<string, unknown>) || {},
      media: [],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async reorderSections(orders: Array<{ sectionKey: string; order: number }>): Promise<void> {
    const sectionKeys = orders.map((o) => o.sectionKey);
    const existing = await db.select().from(landingSection).where(inArray(landingSection.sectionKey, sectionKeys));
    const existingKeys = new Set(existing.map((s) => s.sectionKey));
    const missing = sectionKeys.filter((k) => !existingKeys.has(k));
    if (missing.length > 0) {
      throw new Error(`Sections not found: ${missing.join(", ")}`);
    }

    const orderValues = orders.map((o) => o.order);
    const uniqueOrders = new Set(orderValues);
    if (uniqueOrders.size !== orderValues.length) {
      throw new Error("Duplicate orders detected");
    }

    await db.transaction(async (tx) => {
      for (const item of orders) {
        await tx.update(landingSection).set({ order: item.order, updatedAt: new Date() }).where(eq(landingSection.sectionKey, item.sectionKey));
      }
    });
  }
}
