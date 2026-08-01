import { db } from "@/lib/db";
import { orchestratorPipeline, orchestratorPipelineStep, orchestratorTemplate, orchestratorExecution, orchestratorTask } from "@/lib/db/schema/orchestrator";
import { eq, and, desc, count } from "drizzle-orm";

export class PipelineBuilderService {
  async listPipelines(userId: string, options?: { page?: number; limit?: number; status?: string; type?: string }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(orchestratorPipeline.userId, userId)];
    if (options?.status) conditions.push(eq(orchestratorPipeline.status, options.status));
    if (options?.type) conditions.push(eq(orchestratorPipeline.type, options.type));

    const pipelines = await db
      .select()
      .from(orchestratorPipeline)
      .where(and(...conditions))
      .orderBy(desc(orchestratorPipeline.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ value: count() })
      .from(orchestratorPipeline)
      .where(and(...conditions));

    return { pipelines, total: totalResult[0]?.value || 0, page, limit };
  }

  async getPipeline(id: string) {
    const pipeline = await db
      .select()
      .from(orchestratorPipeline)
      .where(eq(orchestratorPipeline.id, id))
      .limit(1);
    return pipeline[0] || null;
  }

  async createPipeline(userId: string, data: {
    name: string;
    description?: string;
    type: string;
    triggerType?: string;
    triggerConfig?: Record<string, unknown>;
    config?: Record<string, unknown>;
    tags?: string[];
    isTemplate?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const id = `pipe_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const [created] = await db
      .insert(orchestratorPipeline)
      .values({ id, userId, ...data })
      .returning();
    return created;
  }

  async updatePipeline(id: string, data: {
    name?: string;
    description?: string;
    status?: string;
    triggerType?: string;
    triggerConfig?: Record<string, unknown>;
    config?: Record<string, unknown>;
    tags?: string[];
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const [updated] = await db
      .update(orchestratorPipeline)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orchestratorPipeline.id, id))
      .returning();
    return updated || null;
  }

  async deletePipeline(id: string) {
    await db.delete(orchestratorPipelineStep).where(eq(orchestratorPipelineStep.pipelineId, id));
    await db.delete(orchestratorPipeline).where(eq(orchestratorPipeline.id, id));
  }

  async listSteps(pipelineId: string) {
    return db
      .select()
      .from(orchestratorPipelineStep)
      .where(eq(orchestratorPipelineStep.pipelineId, pipelineId))
      .orderBy(orchestratorPipelineStep.order);
  }

  async addStep(pipelineId: string, data: {
    name: string;
    moduleType: string;
    action: string;
    order: number;
    config?: Record<string, unknown>;
    inputMapping?: Record<string, string>;
    outputKey?: string;
    conditions?: Record<string, unknown>;
    retryConfig?: Record<string, unknown>;
    timeoutMs?: number;
    metadata?: Record<string, unknown>;
  }) {
    const id = `step_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const [created] = await db
      .insert(orchestratorPipelineStep)
      .values({ id, pipelineId, ...data })
      .returning();
    return created;
  }

  async updateStep(stepId: string, data: {
    name?: string;
    moduleType?: string;
    action?: string;
    order?: number;
    config?: Record<string, unknown>;
    inputMapping?: Record<string, string>;
    outputKey?: string;
    conditions?: Record<string, unknown>;
    retryConfig?: Record<string, unknown>;
    timeoutMs?: number;
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const [updated] = await db
      .update(orchestratorPipelineStep)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orchestratorPipelineStep.id, stepId))
      .returning();
    return updated || null;
  }

  async deleteStep(stepId: string) {
    await db.delete(orchestratorPipelineStep).where(eq(orchestratorPipelineStep.id, stepId));
  }

  async createExecution(userId: string, pipelineId: string, data: {
    triggerType?: string;
    input?: Record<string, unknown>;
    estimatedCredits?: number;
    estimatedDurationMs?: number;
  }) {
    const steps = await this.listSteps(pipelineId);
    const id = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const [created] = await db
      .insert(orchestratorExecution)
      .values({
        id,
        userId,
        pipelineId,
        totalSteps: steps.length,
        triggerType: data.triggerType,
        input: data.input || {},
        estimatedCredits: data.estimatedCredits || 0,
        estimatedDurationMs: data.estimatedDurationMs || 0,
      })
      .returning();
    return created;
  }

  async listExecutions(userId: string, options?: { page?: number; limit?: number; status?: string; pipelineId?: string }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(orchestratorExecution.userId, userId)];
    if (options?.status) conditions.push(eq(orchestratorExecution.status, options.status));
    if (options?.pipelineId) conditions.push(eq(orchestratorExecution.pipelineId, options.pipelineId));

    const executions = await db
      .select()
      .from(orchestratorExecution)
      .where(and(...conditions))
      .orderBy(desc(orchestratorExecution.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ value: count() })
      .from(orchestratorExecution)
      .where(and(...conditions));

    return { executions, total: totalResult[0]?.value || 0, page, limit };
  }

  async getExecution(id: string) {
    const execution = await db
      .select()
      .from(orchestratorExecution)
      .where(eq(orchestratorExecution.id, id))
      .limit(1);
    if (!execution[0]) return null;

    const tasks = await db
      .select()
      .from(orchestratorTask)
      .where(eq(orchestratorTask.executionId, id))
      .orderBy(orchestratorTask.createdAt);

    return { ...execution[0], tasks };
  }

  async cancelExecution(id: string) {
    const [updated] = await db
      .update(orchestratorExecution)
      .set({ status: "cancelled", updatedAt: new Date(), completedAt: new Date() })
      .where(eq(orchestratorExecution.id, id))
      .returning();
    return updated || null;
  }

  async getStats() {
    const totalPipelines = await db.select({ value: count() }).from(orchestratorPipeline);
    const activePipelines = await db.select({ value: count() }).from(orchestratorPipeline).where(eq(orchestratorPipeline.status, "active"));
    const totalExecutions = await db.select({ value: count() }).from(orchestratorExecution);
    const runningExecutions = await db.select({ value: count() }).from(orchestratorExecution).where(eq(orchestratorExecution.status, "running"));
    const totalSteps = await db.select({ value: count() }).from(orchestratorPipelineStep);
    const templates = await db.select({ value: count() }).from(orchestratorTemplate);

    return {
      totalPipelines: totalPipelines[0]?.value || 0,
      activePipelines: activePipelines[0]?.value || 0,
      totalExecutions: totalExecutions[0]?.value || 0,
      runningExecutions: runningExecutions[0]?.value || 0,
      totalSteps: totalSteps[0]?.value || 0,
      templates: templates[0]?.value || 0,
    };
  }

  async listTemplates(category?: string) {
    const conditions = category ? [eq(orchestratorTemplate.category, category)] : [];
    return db
      .select()
      .from(orchestratorTemplate)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(orchestratorTemplate.usageCount));
  }

  async getTemplate(id: string) {
    const template = await db
      .select()
      .from(orchestratorTemplate)
      .where(eq(orchestratorTemplate.id, id))
      .limit(1);
    return template[0] || null;
  }

  async createTemplate(data: {
    name: string;
    description?: string;
    type: string;
    category?: string;
    icon?: string;
    pipelineConfig?: Record<string, unknown>;
    steps?: Record<string, unknown>[];
    estimatedCredits?: number;
    estimatedDurationMs?: number;
    tags?: string[];
    isSystem?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const id = `tmpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const [created] = await db
      .insert(orchestratorTemplate)
      .values({ id, ...data })
      .returning();
    return created;
  }

  async updateTemplate(id: string, data: {
    name?: string;
    description?: string;
    category?: string;
    icon?: string;
    pipelineConfig?: Record<string, unknown>;
    steps?: Record<string, unknown>[];
    estimatedCredits?: number;
    estimatedDurationMs?: number;
    tags?: string[];
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const [updated] = await db
      .update(orchestratorTemplate)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orchestratorTemplate.id, id))
      .returning();
    return updated || null;
  }

  async deleteTemplate(id: string) {
    await db.delete(orchestratorTemplate).where(eq(orchestratorTemplate.id, id));
  }

  async executeTemplate(templateId: string, userId: string, input?: Record<string, unknown>) {
    const template = await this.getTemplate(templateId);
    if (!template) return null;

    await db
      .update(orchestratorTemplate)
      .set({ usageCount: template.usageCount + 1, updatedAt: new Date() })
      .where(eq(orchestratorTemplate.id, templateId));

    const pipeline = await this.createPipeline(userId, {
      name: `${template.name} - ${new Date().toISOString()}`,
      description: template.description || undefined,
      type: template.type,
      config: template.pipelineConfig,
      tags: template.tags,
    });

    return this.createExecution(userId, pipeline.id, {
      triggerType: "template",
      input: input || {},
      estimatedCredits: template.estimatedCredits,
      estimatedDurationMs: template.estimatedDurationMs,
    });
  }
}

export const pipelineBuilderService = new PipelineBuilderService();
