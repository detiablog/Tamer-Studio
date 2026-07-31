import { db } from "@/lib/db";
import { emailLog } from "@/lib/db/schema/email";
import { eq, and, desc, sql, gte, lt } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export interface LogEntryInput {
  queueId?: string;
  type: string;
  to: string;
  subject: string;
  from?: string;
  replyTo?: string;
  providerId?: string;
  providerName?: string;
  status: string;
  attempts?: number;
  latencyMs?: number;
  responseCode?: number;
  responseMessage?: string;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export async function createEmailLog(data: LogEntryInput): Promise<string> {
  const id = generateId("log");
  await db.insert(emailLog).values({
    id,
    queueId: data.queueId || null,
    type: data.type,
    to: data.to,
    subject: data.subject,
    from: data.from || null,
    replyTo: data.replyTo || null,
    providerId: data.providerId || null,
    providerName: data.providerName || null,
    status: data.status,
    attempts: data.attempts ?? 0,
    latencyMs: data.latencyMs || null,
    responseCode: data.responseCode || null,
    responseMessage: data.responseMessage || null,
    errorCode: data.errorCode || null,
    errorMessage: data.errorMessage || null,
    metadata: data.metadata || {},
  });
  return id;
}

export async function updateEmailLog(
  id: string,
  data: {
    status?: string;
    latencyMs?: number;
    responseCode?: number;
    responseMessage?: string;
    errorCode?: string;
    errorMessage?: string;
  }
): Promise<void> {
  const updateData: Record<string, unknown> = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.latencyMs !== undefined) updateData.latencyMs = data.latencyMs;
  if (data.responseCode !== undefined) updateData.responseCode = data.responseCode;
  if (data.responseMessage !== undefined) updateData.responseMessage = data.responseMessage;
  if (data.errorCode !== undefined) updateData.errorCode = data.errorCode;
  if (data.errorMessage !== undefined) updateData.errorMessage = data.errorMessage;

  if (Object.keys(updateData).length > 0) {
    await db.update(emailLog).set(updateData).where(eq(emailLog.id, id));
  }
}

export interface LogFilters {
  status?: string;
  type?: string;
  providerId?: string;
  to?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getEmailLogs(filters: LogFilters = {}) {
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);
  const offset = (page - 1) * limit;

  const conditions = [];
  if (filters.status) conditions.push(eq(emailLog.status, filters.status));
  if (filters.type) conditions.push(eq(emailLog.type, filters.type));
  if (filters.providerId) conditions.push(eq(emailLog.providerId, filters.providerId));
  if (filters.to) conditions.push(eq(emailLog.to, filters.to));
  if (filters.dateFrom) conditions.push(gte(emailLog.createdAt, filters.dateFrom));
  if (filters.dateTo) conditions.push(lt(emailLog.createdAt, filters.dateTo));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(emailLog)
      .where(whereClause)
      .orderBy(desc(emailLog.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(emailLog)
      .where(whereClause),
  ]);

  return {
    data,
    page,
    limit,
    total: Number(countResult[0]?.count ?? 0),
    totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
  };
}
