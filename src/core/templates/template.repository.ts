import { db } from "@/lib/db";
import { notificationTemplate, notificationTemplateVersion } from "@/lib/db/schema/notification";
import { eq, desc, and } from "drizzle-orm";
import type { NotificationTemplate, TemplateVersion } from "./template.types";
import { randomUUID } from "crypto";

export class NotificationTemplateRepository {
  async create(input: Omit<NotificationTemplate, "id" | "createdAt" | "updatedAt">): Promise<NotificationTemplate> {
    const id = `tmpl_${randomUUID()}`;
    const now = new Date();

    await db.insert(notificationTemplate).values({
      id,
      name: input.name,
      category: input.category,
      channel: input.channel,
      subject: input.subject ?? null,
      body: input.body,
      variables: input.variables as unknown as Record<string, unknown>[],
      locale: input.locale,
      version: input.version,
      isActive: input.isActive,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(notificationTemplateVersion).values({
      id: `tmpl_ver_${randomUUID()}`,
      templateId: id,
      version: String(input.version),
      subject: input.subject ?? null,
      body: input.body,
      variables: input.variables as unknown as Record<string, unknown>,
      createdAt: now,
    });

    return this.getById(id) as Promise<NotificationTemplate>;
  }

  async getById(id: string): Promise<NotificationTemplate | undefined> {
    const rows = await db.select().from(notificationTemplate).where(eq(notificationTemplate.id, id)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapTemplate(rows[0]);
  }

  async getByName(name: string): Promise<NotificationTemplate | undefined> {
    const rows = await db.select().from(notificationTemplate).where(eq(notificationTemplate.name, name)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapTemplate(rows[0]);
  }

  async list(filters?: {
    category?: string;
    channel?: string;
    locale?: string;
    isActive?: boolean;
  }): Promise<NotificationTemplate[]> {
    const conditions = [];
    if (filters?.category) conditions.push(eq(notificationTemplate.category, filters.category));
    if (filters?.channel) conditions.push(eq(notificationTemplate.channel, filters.channel));
    if (filters?.locale) conditions.push(eq(notificationTemplate.locale, filters.locale));
    if (filters?.isActive !== undefined) conditions.push(eq(notificationTemplate.isActive, filters.isActive));

    const rows = await db
      .select()
      .from(notificationTemplate)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return rows.map(this.mapTemplate);
  }

  async update(id: string, input: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const existing = await this.getById(id);
    if (!existing) throw new Error("Template not found");

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    let newVersion = existing.version;

    if (input.name !== undefined) updates.name = input.name;
    if (input.category !== undefined) updates.category = input.category;
    if (input.channel !== undefined) updates.channel = input.channel;
    if (input.locale !== undefined) updates.locale = input.locale;
    if (input.isActive !== undefined) updates.isActive = input.isActive;
    if (input.subject !== undefined) updates.subject = input.subject;
    if (input.body !== undefined) {
      updates.body = input.body;
      if (input.body !== existing.body) {
        newVersion = existing.version + 1;
        updates.version = newVersion;
      }
    }
    if (input.variables !== undefined) {
      updates.variables = input.variables as unknown as Record<string, unknown>;
    }

    await db.update(notificationTemplate).set(updates).where(eq(notificationTemplate.id, id));

    if (input.body !== undefined && input.body !== existing.body) {
      const now = new Date();
      await db.insert(notificationTemplateVersion).values({
        id: `tmpl_ver_${randomUUID()}`,
        templateId: id,
        version: String(newVersion),
        subject: input.subject ?? existing.subject ?? null,
        body: input.body,
        variables: (input.variables ?? existing.variables) as unknown as Record<string, unknown>,
        createdAt: now,
      });
    }

    const updated = await this.getById(id);
    if (!updated) throw new Error("Template not found after update");
    return updated;
  }

  async activate(id: string): Promise<NotificationTemplate> {
    await db.update(notificationTemplate).set({ isActive: true, updatedAt: new Date() }).where(eq(notificationTemplate.id, id));
    const updated = await this.getById(id);
    if (!updated) throw new Error("Template not found");
    return updated;
  }

  async deactivate(id: string): Promise<NotificationTemplate> {
    await db.update(notificationTemplate).set({ isActive: false, updatedAt: new Date() }).where(eq(notificationTemplate.id, id));
    const updated = await this.getById(id);
    if (!updated) throw new Error("Template not found");
    return updated;
  }

  async addVersion(id: string, body: string, subject?: string): Promise<NotificationTemplate> {
    const existing = await this.getById(id);
    if (!existing) throw new Error("Template not found");

    const newVersion = existing.version + 1;
    const now = new Date();

    await db.insert(notificationTemplateVersion).values({
      id: `tmpl_ver_${randomUUID()}`,
      templateId: id,
      version: String(newVersion),
      subject: subject ?? null,
      body,
      variables: existing.variables as unknown as Record<string, unknown>,
      createdAt: now,
    });

    await db
      .update(notificationTemplate)
      .set({ body, version: newVersion, subject: subject ?? existing.subject, updatedAt: now })
      .where(eq(notificationTemplate.id, id));

    const updated = await this.getById(id);
    if (!updated) throw new Error("Template not found");
    return updated;
  }

  async getVersions(id: string): Promise<TemplateVersion[]> {
    const rows = await db
      .select()
      .from(notificationTemplateVersion)
      .where(eq(notificationTemplateVersion.templateId, id))
      .orderBy(desc(notificationTemplateVersion.version));

    return rows.map((row) => this.mapVersion(row));
  }

  private mapTemplate(row: typeof notificationTemplate.$inferSelect): NotificationTemplate {
    return {
      id: row.id,
      name: row.name,
      category: row.category as NotificationTemplate["category"],
      channel: row.channel as NotificationTemplate["channel"],
      subject: row.subject ?? undefined,
      body: row.body,
      variables: row.variables as unknown as NotificationTemplate["variables"],
      locale: row.locale,
      version: Number(row.version),
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapVersion(row: typeof notificationTemplateVersion.$inferSelect): TemplateVersion {
    return {
      version: Number(row.version),
      subject: row.subject ?? undefined,
      body: row.body,
      variables: row.variables as unknown as TemplateVersion["variables"],
      createdAt: row.createdAt,
    };
  }
}
