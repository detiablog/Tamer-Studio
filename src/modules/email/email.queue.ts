import { db } from "@/lib/db";
import { emailQueue, emailLog } from "@/lib/db/schema/email";
import { eq, and, sql, desc } from "drizzle-orm";
import type { EmailMessage, EmailQueueItem, EmailQueueManager, EmailStatus, EmailType } from "./email.interface";
import { emailLogger } from "./email.logger";
import { generateId } from "./email.encryption";

export class DatabaseEmailQueue implements EmailQueueManager {
  async enqueue(message: EmailMessage, type: EmailType, options?: { 
    priority?: number; 
    scheduledAt?: Date;
    templateId?: string;
    category?: string;
    scheduledTimezone?: string;
  }): Promise<string> {
    const id = generateId("queue");
    await db.insert(emailQueue).values({
      id,
      type,
      to: message.to,
      subject: message.subject,
      html: message.html || null,
      text: message.text || null,
      from: message.from || null,
      replyTo: message.replyTo || null,
      cc: message.cc || [],
      bcc: message.bcc || [],
      headers: message.headers || {},
      metadata: message.metadata || {},
      status: "queued",
      priority: options?.priority ?? 0,
      attempts: 0,
      maxAttempts: 3,
      scheduledAt: options?.scheduledAt || null,
      templateId: options?.templateId || null,
      category: options?.category || null,
      scheduledTimezone: options?.scheduledTimezone || null,
    });
    emailLogger.info("Email enqueued to database", { queueId: id, type, to: message.to, subject: message.subject });
    return id;
  }

  async dequeue(): Promise<EmailQueueItem | null> {
    const [item] = await db
      .select()
      .from(emailQueue)
      .where(
        and(
          eq(emailQueue.status, "queued"),
          sql`(${emailQueue.scheduledAt} IS NULL OR ${emailQueue.scheduledAt} <= NOW())`
        )
      )
      .orderBy(desc(emailQueue.priority), emailQueue.createdAt)
      .limit(1);

    if (!item) return null;

    await db
      .update(emailQueue)
      .set({ status: "processing", startedAt: new Date(), updatedAt: new Date() })
      .where(eq(emailQueue.id, item.id));

    return {
      id: item.id,
      type: item.type as EmailType,
      to: item.to,
      subject: item.subject,
      html: item.html || undefined,
      text: item.text || undefined,
      from: item.from || undefined,
      replyTo: item.replyTo || undefined,
      cc: (item.cc as string[]) || [],
      bcc: (item.bcc as string[]) || [],
      headers: (item.headers as Record<string, string>) || {},
      metadata: (item.metadata as Record<string, unknown>) || {},
      status: "processing" as EmailStatus,
      priority: item.priority,
      attempts: item.attempts,
      maxAttempts: item.maxAttempts,
      scheduledAt: item.scheduledAt || undefined,
      startedAt: item.startedAt || undefined,
      completedAt: item.completedAt || undefined,
      failedAt: item.failedAt || undefined,
      error: item.error || undefined,
      response: (item.response as Record<string, unknown>) || undefined,
      providerId: item.providerId || undefined,
      providerName: item.providerName || undefined,
      latencyMs: item.latencyMs || undefined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async ack(id: string): Promise<void> {
    await db
      .update(emailQueue)
      .set({ status: "sent", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(emailQueue.id, id));
    emailLogger.debug("Email queue item acked", { queueId: id });
  }

  async nack(id: string, error: string): Promise<void> {
    await db
      .update(emailQueue)
      .set({ status: "failed", failedAt: new Date(), error, updatedAt: new Date() })
      .where(eq(emailQueue.id, id));
    emailLogger.warn("Email queue item nacked", { queueId: id, error });
  }

  async getStatus(id: string): Promise<EmailStatus | null> {
    const [item] = await db
      .select({ status: emailQueue.status })
      .from(emailQueue)
      .where(eq(emailQueue.id, id))
      .limit(1);
    return (item?.status as EmailStatus) || null;
  }

  async updateProgress(id: string, progress: number): Promise<void> {
    await db
      .update(emailQueue)
      .set({ updatedAt: new Date() })
      .where(eq(emailQueue.id, id));
    emailLogger.debug("Queue progress updated", { queueId: id, progress });
  }

  async getQueueDepth(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailQueue)
      .where(eq(emailQueue.status, "queued"));
    return Number(result?.count ?? 0);
  }

  async getFailedItems(limit = 50): Promise<EmailQueueItem[]> {
    const items = await db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.status, "failed"))
      .orderBy(desc(emailQueue.failedAt))
      .limit(limit);

    return items.map((item) => ({
      id: item.id,
      type: item.type as EmailType,
      to: item.to,
      subject: item.subject,
      html: item.html || undefined,
      text: item.text || undefined,
      from: item.from || undefined,
      replyTo: item.replyTo || undefined,
      cc: (item.cc as string[]) || [],
      bcc: (item.bcc as string[]) || [],
      headers: (item.headers as Record<string, string>) || {},
      metadata: (item.metadata as Record<string, unknown>) || {},
      status: item.status as EmailStatus,
      priority: item.priority,
      attempts: item.attempts,
      maxAttempts: item.maxAttempts,
      scheduledAt: item.scheduledAt || undefined,
      startedAt: item.startedAt || undefined,
      completedAt: item.completedAt || undefined,
      failedAt: item.failedAt || undefined,
      error: item.error || undefined,
      response: (item.response as Record<string, unknown>) || undefined,
      providerId: item.providerId || undefined,
      providerName: item.providerName || undefined,
      latencyMs: item.latencyMs || undefined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  async retry(id: string): Promise<void> {
    await db
      .update(emailQueue)
      .set({
        status: "queued",
        attempts: 0,
        failedAt: null,
        error: null,
        scheduledAt: null,
        updatedAt: new Date(),
      })
      .where(and(eq(emailQueue.id, id), eq(emailQueue.status, "failed")));
    emailLogger.info("Email queue item retry requested", { queueId: id });
  }

  async createLog(data: {
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
  }): Promise<string> {
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

  async updateLog(id: string, data: {
    status?: string;
    latencyMs?: number;
    responseCode?: number;
    responseMessage?: string;
    errorCode?: string;
    errorMessage?: string;
  }): Promise<void> {
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

  async incrementAttempts(id: string): Promise<number> {
    const [item] = await db
      .select({ attempts: emailQueue.attempts })
      .from(emailQueue)
      .where(eq(emailQueue.id, id))
      .limit(1);
    const newAttempts = (item?.attempts ?? 0) + 1;
    await db
      .update(emailQueue)
      .set({ attempts: newAttempts, updatedAt: new Date() })
      .where(eq(emailQueue.id, id));
    return newAttempts;
  }
}

export const databaseEmailQueue = new DatabaseEmailQueue();
