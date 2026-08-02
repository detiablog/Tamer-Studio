import { db } from "@/lib/db";
import { secCompliance } from "@/lib/db/schema/security";
import { eq, and, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ComplianceService {
  async listControls(framework?: string) {
    const conditions = framework ? [eq(secCompliance.framework, framework)] : [];
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(secCompliance).where(where).orderBy(secCompliance.framework, secCompliance.control);
  }

  async upsertControl(data: { framework: string; control: string; description?: string; status?: string; notes?: string; evidence?: string[] }) {
    const existing = await db.select().from(secCompliance).where(and(eq(secCompliance.framework, data.framework), eq(secCompliance.control, data.control))).limit(1);
    if (existing.length > 0) {
      return db.update(secCompliance).set({ ...data, lastVerifiedAt: new Date() }).where(eq(secCompliance.id, existing[0].id)).returning().then(r => r[0]);
    }
    const id = generateId("scom");
    return db.insert(secCompliance).values({ ...data, id, lastVerifiedAt: new Date() }).returning().then(r => r[0]);
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(secCompliance);
    const [passed] = await db.select({ count: sql<number>`count(*)` }).from(secCompliance).where(eq(secCompliance.status, "passed"));
    const [failed] = await db.select({ count: sql<number>`count(*)` }).from(secCompliance).where(eq(secCompliance.status, "failed"));
    const [pending] = await db.select({ count: sql<number>`count(*)` }).from(secCompliance).where(eq(secCompliance.status, "pending"));
    return { total: Number(total?.count ?? 0), passed: Number(passed?.count ?? 0), failed: Number(failed?.count ?? 0), pending: Number(pending?.count ?? 0), score: Number(total?.count ?? 0) > 0 ? Math.round((Number(passed?.count ?? 0) / Number(total?.count ?? 1)) * 100) : 0 };
  }
}

export const complianceService = new ComplianceService();
