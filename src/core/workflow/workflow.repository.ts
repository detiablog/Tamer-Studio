import { db } from "@/lib/db";
import {
  workflow, workflowNode, workflowConnection, workflowVariable,
  workflowRun, workflowRunLog, workflowTemplate, workflowSchedule,
} from "@/lib/db/schema/workflows";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class WorkflowRepository {
  async listWorkflows(userId: string, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const rows = await db.select().from(workflow).orderBy(desc(workflow.createdAt)).limit(pageSize).offset(offset);
    const [total] = await db.select({ count: count() }).from(workflow);
    return { workflows: rows, total: total.count, page, pageSize };
  }

  async getWorkflow(id: string) {
    const rows = await db.select().from(workflow).where(eq(workflow.id, id)).limit(1);
    return rows[0] || null;
  }

  async createWorkflow(data: { name: string; description?: string; userId: string }) {
    const id = generateId("wf");
    await db.insert(workflow).values({
      id,
      name: data.name,
      description: data.description,
      steps: [],
      variables: [],
      tags: [],
      status: "draft",
    });
    return this.getWorkflow(id);
  }

  async updateWorkflow(id: string, data: Partial<typeof workflow.$inferInsert>) {
    await db.update(workflow).set({ ...data, updatedAt: new Date() }).where(eq(workflow.id, id));
    return this.getWorkflow(id);
  }

  async deleteWorkflow(id: string) {
    await db.delete(workflow).where(eq(workflow.id, id));
  }

  async listNodes(workflowId: string) {
    return db.select().from(workflowNode).where(eq(workflowNode.workflowId, workflowId));
  }

  async getNode(id: string) {
    const rows = await db.select().from(workflowNode).where(eq(workflowNode.id, id)).limit(1);
    return rows[0] || null;
  }

  async createNode(data: { workflowId: string; type: string; label: string; positionX?: string; positionY?: string; config?: Record<string, unknown>; metadata?: Record<string, unknown> }) {
    const id = generateId("node");
    await db.insert(workflowNode).values({ ...data, id });
    const rows = await db.select().from(workflowNode).where(eq(workflowNode.id, id)).limit(1);
    return rows[0];
  }

  async updateNode(id: string, data: Partial<typeof workflowNode.$inferInsert>) {
    await db.update(workflowNode).set(data).where(eq(workflowNode.id, id));
    const rows = await db.select().from(workflowNode).where(eq(workflowNode.id, id)).limit(1);
    return rows[0] || null;
  }

  async deleteNode(id: string) {
    await db.delete(workflowNode).where(eq(workflowNode.id, id));
  }

  async listConnections(workflowId: string) {
    return db.select().from(workflowConnection).where(eq(workflowConnection.workflowId, workflowId));
  }

  async getConnection(id: string) {
    const rows = await db.select().from(workflowConnection).where(eq(workflowConnection.id, id)).limit(1);
    return rows[0] || null;
  }

  async createConnection(data: { workflowId: string; sourceNodeId: string; targetNodeId: string; sourceHandle?: string; targetHandle?: string; label?: string; condition?: Record<string, unknown>; metadata?: Record<string, unknown> }) {
    const id = generateId("conn");
    await db.insert(workflowConnection).values({ ...data, id });
    const rows = await db.select().from(workflowConnection).where(eq(workflowConnection.id, id)).limit(1);
    return rows[0];
  }

  async deleteConnection(id: string) {
    await db.delete(workflowConnection).where(eq(workflowConnection.id, id));
  }

  async listVariables(workflowId: string) {
    return db.select().from(workflowVariable).where(eq(workflowVariable.workflowId, workflowId));
  }

  async createVariable(data: { workflowId: string; name: string; type?: string; defaultValue?: string; value?: string; isRequired?: boolean; description?: string }) {
    const id = generateId("wvar");
    await db.insert(workflowVariable).values({ ...data, id });
    const rows = await db.select().from(workflowVariable).where(eq(workflowVariable.id, id)).limit(1);
    return rows[0];
  }

  async deleteVariable(id: string) {
    await db.delete(workflowVariable).where(eq(workflowVariable.id, id));
  }

  async createRun(data: { workflowId: string; userId: string; variables?: Record<string, unknown> }) {
    const id = generateId("wrun");
    await db.insert(workflowRun).values({
      id,
      workflowId: data.workflowId,
      userId: data.userId,
      status: "queued",
      variables: data.variables || {},
    });
    const rows = await db.select().from(workflowRun).where(eq(workflowRun.id, id)).limit(1);
    return rows[0];
  }

  async getRun(id: string) {
    const rows = await db.select().from(workflowRun).where(eq(workflowRun.id, id)).limit(1);
    return rows[0] || null;
  }

  async listRuns(workflowId: string, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const rows = await db.select().from(workflowRun).where(eq(workflowRun.workflowId, workflowId)).orderBy(desc(workflowRun.createdAt)).limit(pageSize).offset(offset);
    const [total] = await db.select({ count: count() }).from(workflowRun).where(eq(workflowRun.workflowId, workflowId));
    return { runs: rows, total: total.count, page, pageSize };
  }

  async listRunLogs(runId: string) {
    return db.select().from(workflowRunLog).where(eq(workflowRunLog.runId, runId)).orderBy(desc(workflowRunLog.createdAt));
  }

  async listTemplates(category?: string) {
    if (category) {
      return db.select().from(workflowTemplate).where(eq(workflowTemplate.category, category)).orderBy(desc(workflowTemplate.usageCount));
    }
    return db.select().from(workflowTemplate).orderBy(desc(workflowTemplate.usageCount));
  }

  async getTemplate(id: string) {
    const rows = await db.select().from(workflowTemplate).where(eq(workflowTemplate.id, id)).limit(1);
    return rows[0] || null;
  }

  async createTemplate(data: { name: string; description?: string; category?: string; nodes?: Record<string, unknown>[]; connections?: Record<string, unknown>[]; variables?: Record<string, unknown>[]; thumbnail?: string; isActive?: boolean }) {
    const id = generateId("tmpl");
    await db.insert(workflowTemplate).values({ ...data, id });
    const rows = await db.select().from(workflowTemplate).where(eq(workflowTemplate.id, id)).limit(1);
    return rows[0];
  }

  async incrementTemplateUsage(id: string) {
    await db.update(workflowTemplate).set({ usageCount: sql`${workflowTemplate.usageCount} + 1` }).where(eq(workflowTemplate.id, id));
  }

  async createSchedule(data: { workflowId: string; userId: string; scheduleType: string; cronExpression?: string; timezone?: string; isActive?: boolean }) {
    const id = generateId("wsch");
    await db.insert(workflowSchedule).values({ ...data, id });
    const rows = await db.select().from(workflowSchedule).where(eq(workflowSchedule.id, id)).limit(1);
    return rows[0];
  }

  async listSchedules(workflowId: string) {
    return db.select().from(workflowSchedule).where(eq(workflowSchedule.workflowId, workflowId));
  }

  async deleteSchedule(id: string) {
    await db.delete(workflowSchedule).where(eq(workflowSchedule.id, id));
  }

  async getStats() {
    const [workflowCount] = await db.select({ count: count() }).from(workflow);
    const [runCount] = await db.select({ count: count() }).from(workflowRun);
    const [completedRuns] = await db.select({ count: count() }).from(workflowRun).where(eq(workflowRun.status, "completed"));
    const [failedRuns] = await db.select({ count: count() }).from(workflowRun).where(eq(workflowRun.status, "failed"));
    const [templateCount] = await db.select({ count: count() }).from(workflowTemplate);
    return {
      totalWorkflows: workflowCount.count,
      totalRuns: runCount.count,
      completedRuns: completedRuns.count,
      failedRuns: failedRuns.count,
      totalTemplates: templateCount.count,
    };
  }

  async listWorkflowVersions(workflowId: string) {
    const rows = await db.select().from(workflow).where(eq(workflow.id, workflowId)).limit(1);
    if (rows.length === 0) return [];
    return [{ version: rows[0].version, updatedAt: rows[0].updatedAt, status: rows[0].status }];
  }
}
