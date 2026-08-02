import { db } from "@/lib/db";
import { obsReport } from "@/lib/db/schema/observability";
import { eq, desc } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ObsReportService {
  async create(data: { reportType: string; title: string; period?: string; data?: Record<string, unknown>; summary?: Record<string, unknown>; metadata?: Record<string, unknown> }) {
    const id = generateId("obsr");
    return db.insert(obsReport).values({ ...data, id }).returning().then(r => r[0]);
  }

  async list(filters?: { reportType?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    return db.select().from(obsReport).orderBy(desc(obsReport.generatedAt)).limit(limit).offset(offset);
  }

  async getById(id: string) {
    return db.select().from(obsReport).where(eq(obsReport.id, id)).then(r => r[0] ?? null);
  }

  async delete(id: string) {
    return db.delete(obsReport).where(eq(obsReport.id, id));
  }
}

export const obsReportService = new ObsReportService();
