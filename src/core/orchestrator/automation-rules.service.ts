import { db } from "@/lib/db";
import { orchestratorRule } from "@/lib/db/schema/orchestrator";
import { eq, and, desc, count } from "drizzle-orm";

export class AutomationRulesService {
  async listRules(userId: string, options?: { page?: number; limit?: number; triggerType?: string; isEnabled?: boolean }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(orchestratorRule.userId, userId)];
    if (options?.triggerType) conditions.push(eq(orchestratorRule.triggerType, options.triggerType));
    if (options?.isEnabled !== undefined) conditions.push(eq(orchestratorRule.isEnabled, options.isEnabled));

    const rules = await db
      .select()
      .from(orchestratorRule)
      .where(and(...conditions))
      .orderBy(desc(orchestratorRule.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ value: count() })
      .from(orchestratorRule)
      .where(and(...conditions));

    return { rules, total: totalResult[0]?.value || 0, page, limit };
  }

  async getRule(id: string) {
    const rule = await db
      .select()
      .from(orchestratorRule)
      .where(eq(orchestratorRule.id, id))
      .limit(1);
    return rule[0] || null;
  }

  async createRule(userId: string, data: {
    name: string;
    description?: string;
    triggerType: string;
    triggerConfig?: Record<string, unknown>;
    conditions?: Record<string, unknown>[];
    actions?: Record<string, unknown>[];
    isEnabled?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const id = `rule_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const [created] = await db
      .insert(orchestratorRule)
      .values({ id, userId, ...data })
      .returning();
    return created;
  }

  async updateRule(id: string, data: {
    name?: string;
    description?: string;
    triggerType?: string;
    triggerConfig?: Record<string, unknown>;
    conditions?: Record<string, unknown>[];
    actions?: Record<string, unknown>[];
    isEnabled?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const [updated] = await db
      .update(orchestratorRule)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orchestratorRule.id, id))
      .returning();
    return updated || null;
  }

  async deleteRule(id: string) {
    await db.delete(orchestratorRule).where(eq(orchestratorRule.id, id));
  }

  async toggleRule(id: string) {
    const rule = await this.getRule(id);
    if (!rule) return null;

    const [updated] = await db
      .update(orchestratorRule)
      .set({ isEnabled: !rule.isEnabled, updatedAt: new Date() })
      .where(eq(orchestratorRule.id, id))
      .returning();
    return updated || null;
  }

  async getStats(userId: string) {
    const total = await db.select({ value: count() }).from(orchestratorRule).where(eq(orchestratorRule.userId, userId));
    const enabled = await db.select({ value: count() }).from(orchestratorRule).where(and(eq(orchestratorRule.userId, userId), eq(orchestratorRule.isEnabled, true)));

    return {
      total: total[0]?.value || 0,
      enabled: enabled[0]?.value || 0,
      disabled: (total[0]?.value || 0) - (enabled[0]?.value || 0),
    };
  }
}

export const automationRulesService = new AutomationRulesService();
