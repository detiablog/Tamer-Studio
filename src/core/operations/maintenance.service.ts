import { db } from "@/lib/db";
import { opsMaintenance } from "@/lib/db/schema/operations";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class MaintenanceService {
  async createMaintenance(data: { title: string; description?: string; scheduledAt?: Date; message?: string; whitelistedUsers?: string[] }) {
    const id = generateId("omnt");
    return db.insert(opsMaintenance).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listMaintenance(filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.status) conditions.push(eq(opsMaintenance.status, filters.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(opsMaintenance).where(where).orderBy(desc(opsMaintenance.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(opsMaintenance).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getMaintenance(id: string) {
    const [item] = await db.select().from(opsMaintenance).where(eq(opsMaintenance.id, id)).limit(1);
    return item || null;
  }

  async updateMaintenance(id: string, data: Record<string, unknown>) {
    return db.update(opsMaintenance).set(data).where(eq(opsMaintenance.id, id)).returning().then(r => r[0]);
  }

  async startMaintenance(id: string) {
    return db.update(opsMaintenance).set({ status: "active", startedAt: new Date() }).where(eq(opsMaintenance.id, id)).returning().then(r => r[0]);
  }

  async completeMaintenance(id: string) {
    return db.update(opsMaintenance).set({ status: "completed", completedAt: new Date() }).where(eq(opsMaintenance.id, id)).returning().then(r => r[0]);
  }

  async deleteMaintenance(id: string) {
    await db.delete(opsMaintenance).where(eq(opsMaintenance.id, id));
  }

  async getActiveMaintenance() {
    const [item] = await db.select().from(opsMaintenance).where(eq(opsMaintenance.status, "active")).limit(1);
    return item || null;
  }
}

export const maintenanceService = new MaintenanceService();
