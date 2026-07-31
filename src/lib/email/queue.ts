import { db } from "@/lib/db";
import { emailQueue } from "@/lib/db/schema/email";
import { eq, and, sql, desc } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export interface QueueItemInput {
  type: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  metadata?: Record<string, unknown>;
  priority?: number;
}

export async function createQueueItem(data: QueueItemInput): Promise<string> {
  const id = generateId("queue");
  await db.insert(emailQueue).values({
    id,
    type: data.type,
    to: data.to,
    subject: data.subject,
    html: data.html || null,
    text: data.text || null,
    from: data.from || null,
    replyTo: data.replyTo || null,
    metadata: data.metadata || {},
    status: "queued",
    priority: data.priority ?? 0,
    attempts: 0,
    maxAttempts: 3,
  });
  return id;
}

export async function processQueueItem(id: string): Promise<{ success: boolean; error?: string }> {
  const [item] = await db
    .select()
    .from(emailQueue)
    .where(eq(emailQueue.id, id))
    .limit(1);

  if (!item) return { success: false, error: "Queue item not found" };
  if (item.status !== "queued") return { success: false, error: `Item status is ${item.status}` };

  await db
    .update(emailQueue)
    .set({ status: "processing", startedAt: new Date(), updatedAt: new Date() })
    .where(eq(emailQueue.id, id));

  return { success: true };
}

export async function retryFailedItem(id: string): Promise<boolean> {
  const [result] = await db
    .update(emailQueue)
    .set({
      status: "queued",
      attempts: 0,
      failedAt: null,
      error: null,
      scheduledAt: null,
      updatedAt: new Date(),
    })
    .where(and(eq(emailQueue.id, id), eq(emailQueue.status, "failed")))
    .returning({ id: emailQueue.id });

  return !!result;
}

export async function getQueueStats(): Promise<{
  total: number;
  queued: number;
  processing: number;
  sent: number;
  failed: number;
}> {
  const results = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(emailQueue),
    db.select({ count: sql<number>`count(*)` }).from(emailQueue).where(eq(emailQueue.status, "queued")),
    db.select({ count: sql<number>`count(*)` }).from(emailQueue).where(eq(emailQueue.status, "processing")),
    db.select({ count: sql<number>`count(*)` }).from(emailQueue).where(eq(emailQueue.status, "sent")),
    db.select({ count: sql<number>`count(*)` }).from(emailQueue).where(eq(emailQueue.status, "failed")),
  ]);

  return {
    total: Number(results[0][0]?.count ?? 0),
    queued: Number(results[1][0]?.count ?? 0),
    processing: Number(results[2][0]?.count ?? 0),
    sent: Number(results[3][0]?.count ?? 0),
    failed: Number(results[4][0]?.count ?? 0),
  };
}
