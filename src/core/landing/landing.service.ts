import { landingRepository } from "./landing.repository";
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

function mapMediaRow(m: { id: string; sectionKey: string; url: string; alt: string | null; type: string; order: number; createdAt: Date }): LandingMedia {
  return {
    id: m.id,
    sectionKey: m.sectionKey,
    url: m.url,
    alt: m.alt || undefined,
    type: m.type,
    order: m.order,
    createdAt: m.createdAt,
  };
}

function mapSectionWithMedia(section: any, mediaRows: any[]): LandingSection {
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
    media: mediaRows.map(mapMediaRow),
    createdAt: section.createdAt,
    updatedAt: section.updatedAt,
  };
}

export class LandingService {
  async listSections(filters?: {
    search?: string;
    type?: string;
    visible?: boolean;
    locked?: boolean;
    limit?: number;
  }): Promise<LandingSection[]> {
    const sections = await landingRepository.findSections({
      type: filters?.type,
      visible: filters?.visible,
      locked: filters?.locked,
      limit: filters?.limit,
    });

    const sectionKeys = sections.map((s) => s.sectionKey);
    const mediaRows = await landingRepository.findMediaBySectionKeys(sectionKeys);

    const mediaBySection = mediaRows.reduce<Record<string, LandingMedia[]>>((acc, m) => {
      if (!acc[m.sectionKey]) acc[m.sectionKey] = [];
      acc[m.sectionKey].push(mapMediaRow(m));
      return acc;
    }, {});

    return sections.map((section) => mapSectionWithMedia(section, mediaBySection[section.sectionKey] || []));
  }

  async getSectionByKey(sectionKey: string): Promise<LandingSection | undefined> {
    const section = await landingRepository.findSectionByKey(sectionKey);
    if (!section) return undefined;

    const mediaRows = await landingRepository.findMediaBySectionKey(sectionKey);
    return mapSectionWithMedia(section, mediaRows);
  }

  async createSection(input: CreateSectionInput): Promise<LandingSection> {
    const id = randomUUID();
    const now = new Date();
    const maxOrder = await landingRepository.getMaxOrder();
    const sectionOrder = typeof input.order === "number" ? input.order : maxOrder + 1;

    const result = await landingRepository.runTransaction(async (tx) => {
      const created = await landingRepository.createSection({
        id,
        sectionKey: input.sectionKey,
        title: input.title,
        description: input.description,
        component: input.component,
        type: input.type,
        visible: input.visible,
        locked: input.locked,
        order: sectionOrder,
        config: input.config,
        styles: input.styles,
        createdAt: now,
        updatedAt: now,
      });

      if (input.media && input.media.length > 0) {
        await landingRepository.createMedia(
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
      ...result,
      description: result.description || undefined,
      component: result.component || undefined,
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
    };
  }

  async updateSection(sectionKey: string, input: UpdateSectionInput): Promise<LandingSection> {
    const existing = await landingRepository.findSectionByKey(sectionKey);
    if (!existing) throw new Error("Section not found");

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

    const updated = await landingRepository.updateSection(sectionKey, updates);
    if (!updated) throw new Error("Section not found");

    const mediaRows = await landingRepository.findMediaBySectionKey(sectionKey);
    return mapSectionWithMedia(updated, mediaRows);
  }

  async deleteSection(sectionKey: string): Promise<boolean> {
    const existing = await landingRepository.findSectionByKey(sectionKey);
    if (!existing) return false;

    const deletedOrder = existing.order;

    await landingRepository.runTransaction(async (tx) => {
      await landingRepository.deleteMediaBySectionKey(sectionKey);
      await landingRepository.deleteSection(sectionKey);

      const remaining = await landingRepository.findSectionsWithOrderGreaterThan(deletedOrder);
      for (const s of remaining) {
        await landingRepository.updateSectionOrder(s.sectionKey, s.order - 1);
      }
    });

    return true;
  }

  async duplicateSection(sectionKey: string, newSectionKey: string): Promise<LandingSection> {
    const existing = await landingRepository.findSectionByKey(sectionKey);
    if (!existing) throw new Error("Section not found");

    const maxOrder = await landingRepository.getMaxOrder();
    const now = new Date();
    const newId = randomUUID();

    const mediaRows = await landingRepository.findMediaBySectionKey(sectionKey);

    const result = await landingRepository.runTransaction(async (tx) => {
      const created = await landingRepository.createSection({
        id: newId,
        sectionKey: newSectionKey,
        title: `${existing.title} (Copy)`,
        description: existing.description,
        component: existing.component ?? undefined,
        type: existing.type,
        visible: existing.visible,
        locked: false,
        order: maxOrder + 1,
        config: (existing.config as Record<string, unknown>) || {},
        styles: (existing.styles as Record<string, unknown>) || {},
        createdAt: now,
        updatedAt: now,
      });

      if (mediaRows.length > 0) {
        await landingRepository.createMedia(
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

    return mapSectionWithMedia(result, []);
  }

  async reorderSections(orders: Array<{ sectionKey: string; order: number }>): Promise<void> {
    const sectionKeys = orders.map((o) => o.sectionKey);
    const existing = await landingRepository.findSectionsByKeys(sectionKeys);
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

    await landingRepository.runTransaction(async (tx) => {
      for (const item of orders) {
        await landingRepository.updateSectionOrder(item.sectionKey, item.order);
      }
    });
  }
}
