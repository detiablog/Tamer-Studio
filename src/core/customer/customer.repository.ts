import { db } from "@/lib/db";
import { supportCustomerTimeline } from "@/lib/db/schema/support";
import { eq, desc } from "drizzle-orm";
import type { CustomerTimelineEvent, TimelineEventType } from "./types";
import { randomUUID } from "crypto";

export class CustomerRepository {
  async addTimelineEvent(userId: string, type: TimelineEventType, title: string, description?: string, metadata?: Record<string, unknown>): Promise<CustomerTimelineEvent> {
    const id = `timeline_${randomUUID()}`;
    const now = new Date();

    const [row] = await db.insert(supportCustomerTimeline).values({
      id,
      userId,
      type,
      title,
      description: description ?? null,
      metadata: metadata ?? {},
      createdAt: now,
    }).returning();

    return this.mapEvent(row);
  }

  async getTimeline(userId: string, limit = 50, offset = 0): Promise<{ events: CustomerTimelineEvent[]; total: number }> {
    const supportEvents = await db.select().from(supportCustomerTimeline).where(eq(supportCustomerTimeline.userId, userId)).orderBy(desc(supportCustomerTimeline.createdAt)).limit(limit).offset(offset);

    const events: CustomerTimelineEvent[] = supportEvents.map(this.mapEvent);

    return {
      events,
      total: events.length,
    };
  }

  private mapEvent(row: typeof supportCustomerTimeline.$inferSelect): CustomerTimelineEvent {
    return {
      id: row.id,
      userId: row.userId,
      type: row.type as CustomerTimelineEvent["type"],
      title: row.title,
      description: row.description ?? undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.createdAt,
    };
  }
}
