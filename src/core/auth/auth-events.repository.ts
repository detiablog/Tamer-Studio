import { db } from "@/lib/db";
import { failedLoginAttempt } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export class AuthEventsRepository {
  async recordFailedLogin(data: {
    id: string;
    email: string;
    identifier: string;
    reason: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }): Promise<void> {
    await db.insert(failedLoginAttempt).values({
      id: data.id,
      email: data.email,
      identifier: data.identifier,
      reason: data.reason,
      userAgent: data.userAgent ?? null,
      ipAddress: data.ipAddress ?? null,
    });
  }

  async getFailedLoginCountForIdentifier(identifier: string, windowMs: number): Promise<number> {
    const cutoff = new Date(Date.now() - windowMs);
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(failedLoginAttempt)
      .where(
        sql`${failedLoginAttempt.identifier} = ${identifier} AND ${failedLoginAttempt.createdAt} > ${cutoff}`
      );

    return result[0]?.count ? Number(result[0].count) : 0;
  }

  async getFailedLoginCountForEmail(email: string, windowMs: number): Promise<number> {
    const cutoff = new Date(Date.now() - windowMs);
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(failedLoginAttempt)
      .where(
        sql`${failedLoginAttempt.email} = ${email} AND ${failedLoginAttempt.createdAt} > ${cutoff}`
      );

    return result[0]?.count ? Number(result[0].count) : 0;
  }
}

export const authEventsRepository = new AuthEventsRepository();
