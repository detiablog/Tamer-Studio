import { db } from "@/lib/db";
import { obsDashboard } from "@/lib/db/schema/observability";
import { eq, desc } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ObsDashboardService {
  async create(data: { name: string; description?: string; layout?: Record<string, unknown>[]; isDefault?: boolean; metadata?: Record<string, unknown> }) {
    const id = generateId("obsd");
    return db.insert(obsDashboard).values({ ...data, id }).returning().then(r => r[0]);
  }

  async list() {
    return db.select().from(obsDashboard).orderBy(desc(obsDashboard.createdAt));
  }

  async getById(id: string) {
    return db.select().from(obsDashboard).where(eq(obsDashboard.id, id)).then(r => r[0] ?? null);
  }

  async update(id: string, data: { name?: string; description?: string; layout?: Record<string, unknown>[]; isDefault?: boolean; metadata?: Record<string, unknown> }) {
    return db.update(obsDashboard).set({ ...data, updatedAt: new Date() }).where(eq(obsDashboard.id, id)).returning().then(r => r[0]);
  }

  async delete(id: string) {
    return db.delete(obsDashboard).where(eq(obsDashboard.id, id));
  }
}

export const obsDashboardService = new ObsDashboardService();
