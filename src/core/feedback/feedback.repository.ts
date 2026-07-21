import { db } from "@/lib/db";
import { supportFeedback } from "@/lib/db/schema/support";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { SupportFeedback, CreateFeedbackInput, FeedbackFilter, FeedbackType } from "./types";

export class FeedbackRepository {
  async create(input: CreateFeedbackInput): Promise<SupportFeedback> {
    const id = `feedback_${randomUUID()}`;
    const now = new Date();

    const [row] = await db.insert(supportFeedback).values({
      id,
      userId: input.userId,
      ticketId: input.ticketId ?? null,
      type: input.type,
      rating: input.rating ?? null,
      comment: input.comment ?? null,
      metadata: input.metadata ?? {},
      createdAt: now,
    }).returning();

    return this.mapFeedback(row);
  }

  async getById(id: string): Promise<SupportFeedback | undefined> {
    const rows = await db.select().from(supportFeedback).where(eq(supportFeedback.id, id)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapFeedback(rows[0]);
  }

  async list(filter?: FeedbackFilter): Promise<SupportFeedback[]> {
    const conditions = [];

    if (filter?.userId) conditions.push(eq(supportFeedback.userId, filter.userId));
    if (filter?.ticketId) conditions.push(eq(supportFeedback.ticketId, filter.ticketId));
    if (filter?.type) conditions.push(eq(supportFeedback.type, filter.type));

    const limit = filter?.limit ?? 50;
    const offset = filter?.offset ?? 0;

    const rows = await db.select().from(supportFeedback).where(and(...conditions)).orderBy(desc(supportFeedback.createdAt)).limit(limit).offset(offset);

    return rows.map(this.mapFeedback);
  }

  async getStats(filter?: { userId?: string; ticketId?: string }): Promise<{
    total: number;
    byType: Record<FeedbackType, number>;
    averageRating: number | null;
  }> {
    const feedbacks = await this.list(filter);

    const byType = feedbacks.reduce<Record<string, number>>((acc, f) => { acc[f.type] = (acc[f.type] || 0) + 1; return acc; }, {});

    const ratings = feedbacks.filter((f) => f.rating !== undefined).map((f) => f.rating as number);
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

    return {
      total: feedbacks.length,
      byType: byType as Record<FeedbackType, number>,
      averageRating,
    };
  }

  private mapFeedback(row: typeof supportFeedback.$inferSelect): SupportFeedback {
    return {
      id: row.id,
      userId: row.userId,
      ticketId: row.ticketId ?? undefined,
      type: row.type as FeedbackType,
      rating: row.rating ?? undefined,
      comment: row.comment ?? undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.createdAt,
    };
  }
}
