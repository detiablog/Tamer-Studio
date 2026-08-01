import { db } from "@/lib/db";
import { automationRule, automationExecution, automationEvent } from "@/lib/db/schema/automation";
import { eq, and, desc, sql, like, count } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export type TriggerType = "manual" | "project_created" | "workflow_finished" | "image_generated" | "video_generated" | "story_generated" | "publishing_completed" | "publishing_failed" | "campaign_completed" | "credits_low" | "storage_low" | "subscription_changed" | "specific_date" | "recurring_schedule" | "webhook";

export type ConditionOperator = "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "in" | "not_in" | "and" | "or" | "not";

export type ActionType = "create_project" | "generate_images" | "generate_videos" | "generate_story" | "generate_affiliate" | "generate_thumbnail" | "generate_captions" | "generate_hashtags" | "run_workflow" | "publish_content" | "schedule_publishing" | "analyze_performance" | "run_optimizer" | "archive_project" | "backup_project" | "send_notification" | "send_email" | "update_memory" | "wait" | "delay" | "stop";

export interface Condition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
  logicalOperator?: "AND" | "OR";
  group?: Condition[];
}

export interface Action {
  type: ActionType;
  config: Record<string, unknown>;
  order: number;
  skipOnError?: boolean;
}

export interface TriggerConfig {
  type: TriggerType;
  config: Record<string, unknown>;
}

export class RuleEngineService {
  async listRules(userId: string, filters?: { status?: string; isEnabled?: boolean; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(automationRule.userId, userId)];
    if (filters?.status) conditions.push(eq(automationRule.status, filters.status));
    if (filters?.isEnabled !== undefined) conditions.push(eq(automationRule.isEnabled, filters.isEnabled));
    if (filters?.search) conditions.push(like(automationRule.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(automationRule).where(where).orderBy(desc(automationRule.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(automationRule).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createRule(userId: string, data: { name: string; description?: string; status?: string; priority?: string; triggerConfig: TriggerConfig; conditions?: Condition[]; actions?: Action[]; scheduleConfig?: Record<string, unknown>; retryConfig?: Record<string, unknown>; tags?: string[]; isEnabled?: boolean }) {
    const id = generateId("arule");
    const insertData = {
      id,
      userId,
      name: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority,
      triggerConfig: data.triggerConfig as unknown as Record<string, unknown>,
      conditions: (data.conditions || []) as unknown as Record<string, unknown>[],
      actions: (data.actions || []) as unknown as Record<string, unknown>[],
      scheduleConfig: data.scheduleConfig,
      retryConfig: data.retryConfig,
      tags: data.tags,
      isEnabled: data.isEnabled,
    };
    return db.insert(automationRule).values(insertData).returning().then(r => r[0]);
  }

  async getRule(id: string) {
    const [item] = await db.select().from(automationRule).where(eq(automationRule.id, id)).limit(1);
    return item || null;
  }

  async updateRule(id: string, data: Record<string, unknown>) {
    return db.update(automationRule).set(data).where(eq(automationRule.id, id)).returning().then(r => r[0]);
  }

  async deleteRule(id: string) {
    await db.delete(automationRule).where(eq(automationRule.id, id));
  }

  async toggleRule(id: string, isEnabled: boolean) {
    return db.update(automationRule).set({ isEnabled }).where(eq(automationRule.id, id)).returning().then(r => r[0]);
  }

  async evaluateConditions(conditions: Condition[], context: Record<string, unknown>): Promise<boolean> {
    if (!conditions || conditions.length === 0) return true;

    let result = true;
    let currentLogicalOp = "AND";

    for (const condition of conditions) {
      let conditionResult = false;

      if (condition.group && condition.group.length > 0) {
        conditionResult = await this.evaluateConditions(condition.group, context);
      } else {
        const fieldValue = this.getNestedValue(context, condition.field);
        conditionResult = this.evaluateSingleCondition(fieldValue, condition.operator, condition.value);
      }

      if (currentLogicalOp === "AND") {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }

      currentLogicalOp = condition.logicalOperator || "AND";
    }

    return result;
  }

  private evaluateSingleCondition(fieldValue: unknown, operator: ConditionOperator, value: unknown): boolean {
    switch (operator) {
      case "equals": return fieldValue === value;
      case "not_equals": return fieldValue !== value;
      case "contains": return String(fieldValue).includes(String(value));
      case "not_contains": return !String(fieldValue).includes(String(value));
      case "greater_than": return Number(fieldValue) > Number(value);
      case "less_than": return Number(fieldValue) < Number(value);
      case "in": return Array.isArray(value) && value.includes(fieldValue);
      case "not_in": return Array.isArray(value) && !value.includes(fieldValue);
      default: return true;
    }
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce((current: unknown, key: string) => {
      return current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined;
    }, obj);
  }

  async executeActions(actions: Action[], context: Record<string, unknown>): Promise<{ results: Record<string, unknown>[]; errors: string[] }> {
    const results: Record<string, unknown>[] = [];
    const errors: string[] = [];

    const sortedActions = [...actions].sort((a, b) => a.order - b.order);

    for (const action of sortedActions) {
      try {
        const result = await this.executeSingleAction(action, context);
        results.push({ action: action.type, result, success: true });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        errors.push(`${action.type}: ${errorMsg}`);
        if (!action.skipOnError) {
          break;
        }
      }
    }

    return { results, errors };
  }

  private async executeSingleAction(action: Action, context: Record<string, unknown>): Promise<Record<string, unknown>> {
    return { type: action.type, config: action.config, context, executed: true, timestamp: new Date().toISOString() };
  }

  async recordExecution(userId: string, data: { ruleId?: string; templateId?: string; status: string; triggerType?: string; triggerData?: Record<string, unknown>; conditionsResult?: Record<string, unknown>; actionsResult?: Record<string, unknown>; currentAction?: string; completedActions?: number; totalActions?: number; progress?: number; error?: string; creditsUsed?: number }) {
    const id = generateId("aexec");
    return db.insert(automationExecution).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async updateExecution(id: string, data: Record<string, unknown>) {
    return db.update(automationExecution).set(data).where(eq(automationExecution.id, id)).returning().then(r => r[0]);
  }

  async getExecution(id: string) {
    const [item] = await db.select().from(automationExecution).where(eq(automationExecution.id, id)).limit(1);
    return item || null;
  }

  async listExecutions(userId: string, filters?: { status?: string; ruleId?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(automationExecution.userId, userId)];
    if (filters?.status) conditions.push(eq(automationExecution.status, filters.status));
    if (filters?.ruleId) conditions.push(eq(automationExecution.ruleId, filters.ruleId));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(automationExecution).where(where).orderBy(desc(automationExecution.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(automationExecution).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getStats(userId: string) {
    const [totalRules] = await db.select({ count: sql<number>`count(*)` }).from(automationRule).where(eq(automationRule.userId, userId));
    const [activeRules] = await db.select({ count: sql<number>`count(*)` }).from(automationRule).where(and(eq(automationRule.userId, userId), eq(automationRule.isEnabled, true)));
    const [totalExecutions] = await db.select({ count: sql<number>`count(*)` }).from(automationExecution).where(eq(automationExecution.userId, userId));
    const [completedExecutions] = await db.select({ count: sql<number>`count(*)` }).from(automationExecution).where(and(eq(automationExecution.userId, userId), eq(automationExecution.status, "completed")));
    const [failedExecutions] = await db.select({ count: sql<number>`count(*)` }).from(automationExecution).where(and(eq(automationExecution.userId, userId), eq(automationExecution.status, "failed")));
    const [totalCredits] = await db.select({ total: sql<number>`coalesce(sum(${automationExecution.creditsUsed}), 0)` }).from(automationExecution).where(eq(automationExecution.userId, userId));
    const [totalEvents] = await db.select({ count: sql<number>`count(*)` }).from(automationEvent).where(eq(automationEvent.userId, userId));

    return {
      totalRules: Number(totalRules?.count ?? 0),
      activeRules: Number(activeRules?.count ?? 0),
      totalExecutions: Number(totalExecutions?.count ?? 0),
      completedExecutions: Number(completedExecutions?.count ?? 0),
      failedExecutions: Number(failedExecutions?.count ?? 0),
      totalCreditsUsed: Number(totalCredits?.total ?? 0),
      totalEvents: Number(totalEvents?.count ?? 0),
      successRate: Number(totalExecutions?.count ?? 0) > 0 ? Math.round((Number(completedExecutions?.count ?? 0) / Number(totalExecutions?.count ?? 1)) * 100) : 0,
    };
  }

  async recordEvent(userId: string, data: { eventType: string; source?: string; entityId?: string; entityType?: string; data?: Record<string, unknown> }) {
    const id = generateId("aevt");
    return db.insert(automationEvent).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async listEvents(userId: string, filters?: { eventType?: string; processed?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(automationEvent.userId, userId)];
    if (filters?.eventType) conditions.push(eq(automationEvent.eventType, filters.eventType));
    if (filters?.processed !== undefined) conditions.push(eq(automationEvent.processed, filters.processed));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(automationEvent).where(where).orderBy(desc(automationEvent.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(automationEvent).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }
}

export const ruleEngineService = new RuleEngineService();
