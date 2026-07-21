import type { CustomerTimelineEvent, CustomerTimeline, TimelineEventType } from "./types";
import { db } from "@/lib/db";
import { supportCustomerTimeline } from "@/lib/db/schema/support";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { TicketService } from "../tickets";
import type { EventPublisher } from "@/core/events";

export class CustomerService {
  private ticketService: TicketService;

  constructor(eventPublisher?: EventPublisher) {
    this.ticketService = new TicketService(eventPublisher);
  }

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

  async getTimeline(userId: string, limit = 50, offset = 0): Promise<CustomerTimeline> {
    const supportEvents = await db.select().from(supportCustomerTimeline).where(eq(supportCustomerTimeline.userId, userId)).orderBy(desc(supportCustomerTimeline.createdAt)).limit(limit).offset(offset);

    const events: CustomerTimelineEvent[] = supportEvents.map(this.mapEvent);

    return {
      userId,
      events,
      total: events.length,
    };
  }

  async getUnifiedTimeline(userId: string, limit = 50): Promise<CustomerTimelineEvent[]> {
    const tickets = await this.ticketService.list({ userId, limit: 20 });

    const ticketEvents: CustomerTimelineEvent[] = tickets.map((t) => ({
      id: `ticket_${t.id}`,
      userId: t.userId,
      type: "ticket.created" as TimelineEventType,
      title: `Ticket: ${t.subject}`,
      description: t.description.slice(0, 200),
      metadata: { ticketId: t.id, status: t.status, priority: t.priority, category: t.category },
      createdAt: t.createdAt,
    }));

    const supportEvents = await db.select().from(supportCustomerTimeline).where(eq(supportCustomerTimeline.userId, userId)).orderBy(desc(supportCustomerTimeline.createdAt)).limit(limit);

    const otherEvents = supportEvents.map(this.mapEvent);

    const events = [...ticketEvents, ...otherEvents];
    events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return events.slice(0, limit);
  }

  async recordSupportActivity(userId: string, title: string, description?: string, metadata?: Record<string, unknown>): Promise<CustomerTimelineEvent> {
    return this.addTimelineEvent(userId, "support.activity", title, description, metadata);
  }

  async recordPurchase(userId: string, title: string, description?: string, metadata?: Record<string, unknown>): Promise<CustomerTimelineEvent> {
    return this.addTimelineEvent(userId, "purchase", title, description, metadata);
  }

  async recordSubscriptionChange(userId: string, title: string, description?: string, metadata?: Record<string, unknown>): Promise<CustomerTimelineEvent> {
    return this.addTimelineEvent(userId, "subscription.changed", title, description, metadata);
  }

  async recordBillingEvent(userId: string, title: string, description?: string, metadata?: Record<string, unknown>): Promise<CustomerTimelineEvent> {
    return this.addTimelineEvent(userId, "billing.event", title, description, metadata);
  }

  async recordLogin(userId: string, title: string, description?: string, metadata?: Record<string, unknown>): Promise<CustomerTimelineEvent> {
    return this.addTimelineEvent(userId, "login", title, description, metadata);
  }

  async recordNotificationSent(userId: string, title: string, description?: string, metadata?: Record<string, unknown>): Promise<CustomerTimelineEvent> {
    return this.addTimelineEvent(userId, "notification.sent", title, description, metadata);
  }

  private mapEvent(row: typeof supportCustomerTimeline.$inferSelect): CustomerTimelineEvent {
    return {
      id: row.id,
      userId: row.userId,
      type: row.type as TimelineEventType,
      title: row.title,
      description: row.description ?? undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.createdAt,
    };
  }
}
