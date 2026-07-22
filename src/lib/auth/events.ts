import { db } from "@/lib/db";
import { failedLoginAttempt } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { logger } from "@/core/logger";

export interface FailedLoginRecordInput {
  email: string;
  identifier: string;
  reason: string;
  userAgent?: string;
  ipAddress?: string;
}

export async function recordFailedLogin(input: FailedLoginRecordInput): Promise<void> {
  try {
    await db.insert(failedLoginAttempt).values({
      id: crypto.randomUUID(),
      email: input.email,
      identifier: input.identifier,
      reason: input.reason,
      userAgent: input.userAgent ?? null,
      ipAddress: input.ipAddress ?? null,
    });
  } catch (error) {
    logger.error("Failed to persist failed login attempt", error instanceof Error ? error : undefined, {
      email: input.email,
      identifier: input.identifier,
    });
  }
}

export async function getFailedLoginCountForIdentifier(identifier: string, windowMs = 15 * 60 * 1000): Promise<number> {
  const cutoff = new Date(Date.now() - windowMs);
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(failedLoginAttempt)
    .where(
      sql`${failedLoginAttempt.identifier} = ${identifier} AND ${failedLoginAttempt.createdAt} > ${cutoff}`
    );

  return result[0]?.count ? Number(result[0].count) : 0;
}

export async function getFailedLoginCountForEmail(email: string, windowMs = 60 * 60 * 1000): Promise<number> {
  const cutoff = new Date(Date.now() - windowMs);
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(failedLoginAttempt)
    .where(
      sql`${failedLoginAttempt.email} = ${email} AND ${failedLoginAttempt.createdAt} > ${cutoff}`
    );

  return result[0]?.count ? Number(result[0].count) : 0;
}
