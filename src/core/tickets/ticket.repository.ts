import { db } from "@/lib/db";
import { supportTicket, supportTicketComment } from "@/lib/db/schema/support";
import { eq, and, desc, count, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { SupportTicket, TicketFilter, TicketStatus } from "./types";

export class TicketRepository {
  async create(input: { id?: string } & Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "deletedAt">): Promise<SupportTicket> {
    const id = input.id ?? `ticket_${randomUUID()}`;
    const now = new Date();

    const [row] = await db.insert(supportTicket).values({
      id,
      userId: input.userId,
      workspaceId: input.workspaceId ?? null,
      category: input.category,
      priority: input.priority ?? "medium",
      status: input.status ?? "draft",
      subject: input.subject,
      description: input.description,
      assignedTo: input.assignedTo ?? null,
      resolvedAt: input.resolvedAt ?? null,
      closedAt: input.closedAt ?? null,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return this.mapTicket(row);
  }

  async getById(id: string): Promise<SupportTicket | undefined> {
    const rows = await db.select().from(supportTicket).where(and(eq(supportTicket.id, id), isNull(supportTicket.deletedAt))).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapTicket(rows[0]);
  }

  async list(filter?: TicketFilter): Promise<SupportTicket[]> {
    const conditions = [isNull(supportTicket.deletedAt)];

    if (filter?.userId) conditions.push(eq(supportTicket.userId, filter.userId));
    if (filter?.workspaceId) conditions.push(eq(supportTicket.workspaceId, filter.workspaceId));
    if (filter?.category) conditions.push(eq(supportTicket.category, filter.category));
    if (filter?.priority) conditions.push(eq(supportTicket.priority, filter.priority));
    if (filter?.status) conditions.push(eq(supportTicket.status, filter.status));
    if (filter?.assignedTo) conditions.push(eq(supportTicket.assignedTo, filter.assignedTo));

    const limit = filter?.limit ?? 50;
    const offset = filter?.offset ?? 0;

    const rows = await db.select().from(supportTicket).where(and(...conditions)).orderBy(desc(supportTicket.createdAt)).limit(limit).offset(offset);

    return rows.map(this.mapTicket);
  }

  async update(id: string, input: Partial<Omit<SupportTicket, "id" | "userId" | "createdAt">>): Promise<SupportTicket | undefined> {
    const now = new Date();
    const updates: Record<string, unknown> = { updatedAt: now };

    if (input.category !== undefined) updates.category = input.category;
    if (input.priority !== undefined) updates.priority = input.priority;
    if (input.status !== undefined) updates.status = input.status;
    if (input.subject !== undefined) updates.subject = input.subject;
    if (input.description !== undefined) updates.description = input.description;
    if (input.assignedTo !== undefined) updates.assignedTo = input.assignedTo;
    if (input.resolvedAt !== undefined) updates.resolvedAt = input.resolvedAt;
    if (input.closedAt !== undefined) updates.closedAt = input.closedAt;

    if (input.status === "closed" || input.status === "archived") {
      updates.closedAt = now;
    }
    if (input.status === "resolved") {
      updates.resolvedAt = now;
    }

    const rows = await db.update(supportTicket).set(updates).where(and(eq(supportTicket.id, id), isNull(supportTicket.deletedAt))).returning();
    if (rows.length === 0) return undefined;
    return this.mapTicket(rows[0]);
  }

  async softDelete(id: string): Promise<void> {
    const now = new Date();
    await db.update(supportTicket).set({ deletedAt: now, updatedAt: now, status: "archived" }).where(eq(supportTicket.id, id));
  }

  async getCommentCount(ticketId: string): Promise<number> {
    const result = await db.select({ count: count() }).from(supportTicketComment).where(eq(supportTicketComment.ticketId, ticketId));
    return Number(result[0]?.count ?? 0);
  }

  private mapTicket(row: typeof supportTicket.$inferSelect): SupportTicket {
    return {
      id: row.id,
      userId: row.userId,
      workspaceId: row.workspaceId ?? undefined,
      category: row.category as SupportTicket["category"],
      priority: row.priority as SupportTicket["priority"],
      status: row.status as TicketStatus,
      subject: row.subject,
      description: row.description,
      assignedTo: row.assignedTo ?? undefined,
      resolvedAt: row.resolvedAt ?? undefined,
      closedAt: row.closedAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? undefined,
    };
  }
}
