import { db } from "@/lib/db";
import { opsDeployment } from "@/lib/db/schema/operations";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class DeploymentService {
  async createDeployment(data: { version: string; commitHash?: string; environment?: string; deployedBy?: string; notes?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("odep");
    return db.insert(opsDeployment).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listDeployments(filters?: { status?: string; environment?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.status) conditions.push(eq(opsDeployment.status, filters.status));
    if (filters?.environment) conditions.push(eq(opsDeployment.environment, filters.environment));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(opsDeployment).where(where).orderBy(desc(opsDeployment.startedAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(opsDeployment).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getDeployment(id: string) {
    const [item] = await db.select().from(opsDeployment).where(eq(opsDeployment.id, id)).limit(1);
    return item || null;
  }

  async updateDeployment(id: string, data: Record<string, unknown>) {
    return db.update(opsDeployment).set(data).where(eq(opsDeployment.id, id)).returning().then(r => r[0]);
  }

  async completeDeployment(id: string) {
    return db.update(opsDeployment).set({ status: "completed", completedAt: new Date() }).where(eq(opsDeployment.id, id)).returning().then(r => r[0]);
  }

  async failDeployment(id: string, error?: string) {
    return db.update(opsDeployment).set({ status: "failed", metadata: { error }, completedAt: new Date() }).where(eq(opsDeployment.id, id)).returning().then(r => r[0]);
  }

  async getLatestDeployment() {
    const [item] = await db.select().from(opsDeployment).orderBy(desc(opsDeployment.startedAt)).limit(1);
    return item || null;
  }
}

export const deploymentService = new DeploymentService();
