import { db } from "@/lib/db";
import { launchCertification } from "@/lib/db/schema/launch";
import { eq, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export type CertStatus = "not_ready" | "release_candidate" | "ga_ready" | "certified_stable";

export class CertificationService {
  async createCertification(data: { name: string; version: string; checks?: Record<string, string> }) {
    const id = generateId("lcert");
    return db.insert(launchCertification).values({ ...data, id }).returning().then(r => r[0]);
  }

  async updateCertification(id: string, data: Record<string, unknown>) {
    return db.update(launchCertification).set(data).where(eq(launchCertification.id, id)).returning().then(r => r[0]);
  }

  async getLatestCertification() {
    const [item] = await db.select().from(launchCertification).orderBy(desc(launchCertification.createdAt)).limit(1);
    return item || null;
  }

  async getCertification(id: string) {
    const [item] = await db.select().from(launchCertification).where(eq(launchCertification.id, id)).limit(1);
    return item || null;
  }

  async listCertifications(limit = 10) {
    return db.select().from(launchCertification).orderBy(desc(launchCertification.createdAt)).limit(limit);
  }

  async certify(id: string, score: number, certifiedBy: string) {
    let status: CertStatus = "not_ready";
    if (score >= 90) status = "certified_stable";
    else if (score >= 75) status = "ga_ready";
    else if (score >= 50) status = "release_candidate";
    return db.update(launchCertification).set({ overallScore: score, status, certifiedBy, certifiedAt: new Date() }).where(eq(launchCertification.id, id)).returning().then(r => r[0]);
  }

  async deleteCertification(id: string) {
    await db.delete(launchCertification).where(eq(launchCertification.id, id));
  }
}

export const certificationService = new CertificationService();
