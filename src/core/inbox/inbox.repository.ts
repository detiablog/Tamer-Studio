import { db } from "@/lib/db";
import { notification } from "@/lib/db/schema/notification";
import { eq, and, desc, sql, count } from "drizzle-orm";
import type { InboxNotification, InboxFilter, InboxStats } from "./inbox.types";

export class InboxRepository {
  async getById(id: string): Promise<InboxNotification | undefined> {
    const rows = await db.select().from(notification).where(eq(notification.id, id)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapNotification(rows[0]);
  }

  async getByUser(userId: string, filter?: InboxFilter): Promise<InboxNotification[]> {
    const conditions = [
      eq(notification.userId, userId),
      sql`${notification.deletedAt} IS NULL`
    ];

    if (filter?.status) {
      conditions.push(eq(notification.status, filter.status));
    }
    if (filter?.category) {
      conditions.push(eq(notification.category, filter.category));
    }
    if (filter?.channel) {
      conditions.push(eq(notification.channel, filter.channel));
    }
    if (filter?.unreadOnly) {
      conditions.push(sql`${notification.readAt} IS NULL`);
      conditions.push(sql`${notification.archivedAt} IS NULL`);
    }
    if (filter?.archived === true) {
      conditions.push(sql`${notification.archivedAt} IS NOT NULL`);
    } else if (filter?.archived === false) {
      conditions.push(sql`${notification.archivedAt} IS NULL`);
    }

    const limit = filter?.limit ?? 50;
    const offset = filter?.offset ?? 0;

    const rows = await db
      .select()
      .from(notification)
      .where(and(...conditions))
      .orderBy(desc(notification.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map(this.mapNotification);
  }

  async getStats(userId: string): Promise<InboxStats> {
    const unreadCondition = sql`${notification.readAt} IS NULL AND ${notification.archivedAt} IS NULL AND ${notification.deletedAt} IS NULL`;
    
    const totalResult = await db.select({ count: count() }).from(notification).where(and(eq(notification.userId, userId), sql`${notification.deletedAt} IS NULL`));
    const unreadResult = await db.select({ count: count() }).from(notification).where(and(eq(notification.userId, userId), unreadCondition));

    const categoryRows = await db.select({ category: notification.category, count: count() }).from(notification).where(and(eq(notification.userId, userId), sql`${notification.deletedAt} IS NULL`)).groupBy(notification.category);
    const channelRows = await db.select({ channel: notification.channel, count: count() }).from(notification).where(and(eq(notification.userId, userId), sql`${notification.deletedAt} IS NULL`)).groupBy(notification.channel);

    const byCategory = categoryRows.reduce((acc, row) => { acc[row.category] = Number(row.count); return acc; }, {} as Record<string, number>);
    const byChannel = channelRows.reduce((acc, row) => { acc[row.channel] = Number(row.count); return acc; }, {} as Record<string, number>);

    return {
      total: Number(totalResult[0]?.count ?? 0),
      unread: Number(unreadResult[0]?.count ?? 0),
      byCategory: byCategory as InboxStats["byCategory"],
      byChannel: byChannel as InboxStats["byChannel"],
    };
  }

  async markAsRead(id: string, userId: string): Promise<InboxNotification | undefined> {
    const now = new Date();
    const rows = await db.update(notification).set({ readAt: now, updatedAt: now, status: "read" }).where(and(eq(notification.id, id), eq(notification.userId, userId))).returning();
    if (rows.length === 0) return undefined;
    return this.mapNotification(rows[0]);
  }

  async markAsUnread(id: string, userId: string): Promise<InboxNotification | undefined> {
    const now = new Date();
    const rows = await db.update(notification).set({ readAt: null, updatedAt: now, status: "delivered" }).where(and(eq(notification.id, id), eq(notification.userId, userId))).returning();
    if (rows.length === 0) return undefined;
    return this.mapNotification(rows[0]);
  }

  async archive(id: string, userId: string): Promise<InboxNotification | undefined> {
    const now = new Date();
    const rows = await db.update(notification).set({ archivedAt: now, updatedAt: now, status: "archived" }).where(and(eq(notification.id, id), eq(notification.userId, userId))).returning();
    if (rows.length === 0) return undefined;
    return this.mapNotification(rows[0]);
  }

  async unarchive(id: string, userId: string): Promise<InboxNotification | undefined> {
    const now = new Date();
    const rows = await db.update(notification).set({ archivedAt: null, updatedAt: now }).where(and(eq(notification.id, id), eq(notification.userId, userId))).returning();
    if (rows.length === 0) return undefined;
    return this.mapNotification(rows[0]);
  }

  async softDelete(id: string, userId: string): Promise<InboxNotification | undefined> {
    const now = new Date();
    const rows = await db.update(notification).set({ deletedAt: now, updatedAt: now, status: "deleted" }).where(and(eq(notification.id, id), eq(notification.userId, userId))).returning();
    if (rows.length === 0) return undefined;
    return this.mapNotification(rows[0]);
  }

  private mapNotification(row: typeof notification.$inferSelect): InboxNotification {
    return {
      id: row.id,
      userId: row.userId,
      type: row.type as InboxNotification["type"],
      category: row.category as InboxNotification["category"],
      channel: row.channel as InboxNotification["channel"],
      title: row.title,
      message: row.message,
      data: row.data as Record<string, unknown>,
      priority: row.priority as InboxNotification["priority"],
      status: row.status as InboxNotification["status"],
      scheduledAt: row.scheduledAt ?? undefined,
      sentAt: row.sentAt ?? undefined,
      deliveredAt: row.deliveredAt ?? undefined,
      readAt: row.readAt ?? undefined,
      archivedAt: row.archivedAt ?? undefined,
      deletedAt: row.deletedAt ?? undefined,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
