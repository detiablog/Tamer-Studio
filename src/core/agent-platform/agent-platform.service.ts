import { db } from "@/lib/db";
import { agent, agentTask, agentRun, agentMemory, agentKnowledge } from "@/lib/db/schema/agent-platform";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class AgentPlatformService {
  async listAgents(userId: string, filters?: { type?: string; status?: string; search?: string; isTemplate?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(agent.userId, userId)];
    if (filters?.type) conditions.push(eq(agent.type, filters.type));
    if (filters?.status) conditions.push(eq(agent.status, filters.status));
    if (filters?.isTemplate !== undefined) conditions.push(eq(agent.isTemplate, filters.isTemplate));
    if (filters?.search) conditions.push(like(agent.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(agent).where(where).orderBy(desc(agent.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(agent).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createAgent(userId: string, data: { name: string; description?: string; avatar?: string; type?: string; role?: string; mission?: string; goals?: string[]; instructions?: string; behavior?: Record<string, unknown>; allowedTools?: string[]; allowedModels?: string[]; maxCredits?: number; maxRuntimeMs?: number; temperature?: string; creativity?: string; reasoningLevel?: string; language?: string; isTemplate?: boolean; metadata?: Record<string, unknown> }) {
    const id = generateId("agnt");
    return db.insert(agent).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getAgent(id: string) {
    const [item] = await db.select().from(agent).where(eq(agent.id, id)).limit(1);
    return item || null;
  }

  async updateAgent(id: string, data: Record<string, unknown>) {
    return db.update(agent).set(data).where(eq(agent.id, id)).returning().then(r => r[0]);
  }

  async deleteAgent(id: string) {
    await db.delete(agent).where(eq(agent.id, id));
  }

  async listTemplates(filters?: { type?: string; search?: string }) {
    const conditions = [eq(agent.isTemplate, true)];
    if (filters?.type) conditions.push(eq(agent.type, filters.type));
    if (filters?.search) conditions.push(like(agent.name, `%${filters.search}%`));
    const where = and(...conditions);
    return db.select().from(agent).where(where).orderBy(agent.name);
  }

  async listTasks(userId: string, filters?: { agentId?: string; status?: string; priority?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(agentTask.userId, userId)];
    if (filters?.agentId) conditions.push(eq(agentTask.agentId, filters.agentId));
    if (filters?.status) conditions.push(eq(agentTask.status, filters.status));
    if (filters?.priority) conditions.push(eq(agentTask.priority, filters.priority));
    if (filters?.search) conditions.push(like(agentTask.title, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(agentTask).where(where).orderBy(desc(agentTask.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(agentTask).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async listTasksByAgent(agentId: string, userId: string, filters?: { status?: string; priority?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(agentTask.agentId, agentId), eq(agentTask.userId, userId)];
    if (filters?.status) conditions.push(eq(agentTask.status, filters.status));
    if (filters?.priority) conditions.push(eq(agentTask.priority, filters.priority));
    if (filters?.search) conditions.push(like(agentTask.title, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(agentTask).where(where).orderBy(desc(agentTask.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(agentTask).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createTask(userId: string, data: { agentId: string; title: string; description?: string; priority?: string; input?: Record<string, unknown> }) {
    const id = generateId("atask");
    return db.insert(agentTask).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getTask(id: string) {
    const [item] = await db.select().from(agentTask).where(eq(agentTask.id, id)).limit(1);
    return item || null;
  }

  async updateTask(id: string, data: Record<string, unknown>) {
    return db.update(agentTask).set(data).where(eq(agentTask.id, id)).returning().then(r => r[0]);
  }

  async listRuns(userId: string, filters?: { agentId?: string; taskId?: string; status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.agentId) conditions.push(eq(agentRun.agentId, filters.agentId));
    if (filters?.taskId) conditions.push(eq(agentRun.taskId, filters.taskId));
    if (filters?.status) conditions.push(eq(agentRun.status, filters.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(agentRun).where(where).orderBy(desc(agentRun.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(agentRun).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async listRunsByAgent(agentId: string, filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(agentRun.agentId, agentId)];
    if (filters?.status) conditions.push(eq(agentRun.status, filters.status));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(agentRun).where(where).orderBy(desc(agentRun.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(agentRun).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getRun(id: string) {
    const [item] = await db.select().from(agentRun).where(eq(agentRun.id, id)).limit(1);
    return item || null;
  }

  async listMemory(agentId: string, filters?: { type?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(agentMemory.agentId, agentId)];
    if (filters?.type) conditions.push(eq(agentMemory.type, filters.type));
    if (filters?.search) conditions.push(like(agentMemory.key, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(agentMemory).where(where).orderBy(desc(agentMemory.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(agentMemory).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createMemory(data: { agentId: string; type?: string; key: string; content: string; metadata?: Record<string, unknown>; isPinned?: boolean; expiresAt?: Date }) {
    const id = generateId("amem");
    return db.insert(agentMemory).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getMemory(id: string) {
    const [item] = await db.select().from(agentMemory).where(eq(agentMemory.id, id)).limit(1);
    return item || null;
  }

  async deleteMemory(id: string) {
    await db.delete(agentMemory).where(eq(agentMemory.id, id));
  }

  async listKnowledge(agentId: string, filters?: { sourceType?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(agentKnowledge.agentId, agentId)];
    if (filters?.sourceType) conditions.push(eq(agentKnowledge.sourceType, filters.sourceType));
    if (filters?.search) conditions.push(like(agentKnowledge.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(agentKnowledge).where(where).orderBy(desc(agentKnowledge.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(agentKnowledge).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createKnowledge(data: { agentId: string; name: string; sourceType: string; sourceId?: string; content?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("aknw");
    return db.insert(agentKnowledge).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getKnowledge(id: string) {
    const [item] = await db.select().from(agentKnowledge).where(eq(agentKnowledge.id, id)).limit(1);
    return item || null;
  }

  async deleteKnowledge(id: string) {
    await db.delete(agentKnowledge).where(eq(agentKnowledge.id, id));
  }

  async getStats(userId: string) {
    const conditions = [eq(agent.userId, userId)];
    const [agents] = await db.select({ count: sql<number>`count(*)` }).from(agent).where(and(...conditions));
    const [totalTasks] = await db.select({ count: sql<number>`count(*)` }).from(agentTask).where(eq(agentTask.userId, userId));
    const [completedTasks] = await db.select({ count: sql<number>`count(*)` }).from(agentTask).where(and(eq(agentTask.userId, userId), eq(agentTask.status, "completed")));
    const [runningTasks] = await db.select({ count: sql<number>`count(*)` }).from(agentTask).where(and(eq(agentTask.userId, userId), eq(agentTask.status, "running")));
    const [totalRuns] = await db.select({ count: sql<number>`count(*)` }).from(agentRun).innerJoin(agent, eq(agentRun.agentId, agent.id)).where(and(...conditions));
    const [totalMemory] = await db.select({ count: sql<number>`count(*)` }).from(agentMemory).innerJoin(agent, eq(agentMemory.agentId, agent.id)).where(and(...conditions));
    const [totalKnowledge] = await db.select({ count: sql<number>`count(*)` }).from(agentKnowledge).innerJoin(agent, eq(agentKnowledge.agentId, agent.id)).where(and(...conditions));
    const [totalCredits] = await db.select({ sum: sql<number>`coalesce(sum(${agentTask.creditsUsed}), 0)` }).from(agentTask).where(eq(agentTask.userId, userId));
    const [totalTokens] = await db.select({ sum: sql<number>`coalesce(sum(${agentRun.tokensUsed}), 0)` }).from(agentRun).innerJoin(agent, eq(agentRun.agentId, agent.id)).where(and(...conditions));
    return {
      totalAgents: Number(agents?.count ?? 0),
      totalTasks: Number(totalTasks?.count ?? 0),
      completedTasks: Number(completedTasks?.count ?? 0),
      runningTasks: Number(runningTasks?.count ?? 0),
      totalRuns: Number(totalRuns?.count ?? 0),
      totalMemoryEntries: Number(totalMemory?.count ?? 0),
      totalKnowledgeEntries: Number(totalKnowledge?.count ?? 0),
      totalCreditsUsed: Number(totalCredits?.sum ?? 0),
      totalTokensUsed: Number(totalTokens?.sum ?? 0),
    };
  }
}

export const agentPlatformService = new AgentPlatformService();
