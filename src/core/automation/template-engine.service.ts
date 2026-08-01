import { db } from "@/lib/db";
import { automationTemplate, automationRule } from "@/lib/db/schema/automation";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class TemplateEngineService {
  async listTemplates(filters?: { type?: string; category?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(automationTemplate.isActive, true)];
    if (filters?.type) conditions.push(eq(automationTemplate.type, filters.type));
    if (filters?.category) conditions.push(eq(automationTemplate.category, filters.category));
    if (filters?.search) conditions.push(like(automationTemplate.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(automationTemplate).where(where).orderBy(desc(automationTemplate.usageCount)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(automationTemplate).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getTemplate(id: string) {
    const [item] = await db.select().from(automationTemplate).where(eq(automationTemplate.id, id)).limit(1);
    return item || null;
  }

  async createTemplate(data: { name: string; description?: string; category?: string; type: string; icon?: string; triggerConfig?: Record<string, unknown>; conditions?: Record<string, unknown>[]; actions?: Record<string, unknown>[]; scheduleConfig?: Record<string, unknown>; retryConfig?: Record<string, unknown>; estimatedCredits?: number; estimatedDurationMs?: number; tags?: string[]; isSystem?: boolean }) {
    const id = generateId("atmpl");
    return db.insert(automationTemplate).values({ ...data, id }).returning().then(r => r[0]);
  }

  async updateTemplate(id: string, data: Record<string, unknown>) {
    return db.update(automationTemplate).set(data).where(eq(automationTemplate.id, id)).returning().then(r => r[0]);
  }

  async deleteTemplate(id: string) {
    await db.delete(automationTemplate).where(eq(automationTemplate.id, id));
  }

  async createRuleFromTemplate(userId: string, templateId: string, overrides?: { name?: string; description?: string }) {
    const template = await this.getTemplate(templateId);
    if (!template) throw new Error("Template not found");

    await db.update(automationTemplate).set({ usageCount: sql`${automationTemplate.usageCount} + 1` }).where(eq(automationTemplate.id, templateId));

    const id = generateId("arule");
    return db.insert(automationRule).values({
      id,
      userId,
      name: overrides?.name || template.name,
      description: overrides?.description || template.description,
      triggerConfig: template.triggerConfig as Record<string, unknown>,
      conditions: template.conditions as Record<string, unknown>[],
      actions: template.actions as Record<string, unknown>[],
      scheduleConfig: template.scheduleConfig as Record<string, unknown>,
      retryConfig: template.retryConfig as Record<string, unknown>,
      tags: template.tags as string[],
      metadata: { fromTemplate: templateId },
    }).returning().then(r => r[0]);
  }

  async getStats() {
    const [totalTemplates] = await db.select({ count: sql<number>`count(*)` }).from(automationTemplate).where(eq(automationTemplate.isActive, true));
    const [systemTemplates] = await db.select({ count: sql<number>`count(*)` }).from(automationTemplate).where(and(eq(automationTemplate.isActive, true), eq(automationTemplate.isSystem, true)));

    return {
      totalTemplates: Number(totalTemplates?.count ?? 0),
      systemTemplates: Number(systemTemplates?.count ?? 0),
    };
  }
}

export const templateEngineService = new TemplateEngineService();
