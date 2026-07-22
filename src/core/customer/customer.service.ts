import type { CustomerTimelineEvent, CustomerTimeline, TimelineEventType } from "./types";
import { CustomerRepository } from "./customer.repository";
import { TicketService } from "../tickets";
import type { EventPublisher } from "@/core/events";

export class CustomerService {
  private repository = new CustomerRepository();
  private ticketService: TicketService;

  constructor(eventPublisher?: EventPublisher) {
    this.ticketService = new TicketService(eventPublisher);
  }

  async addTimelineEvent(userId: string, type: TimelineEventType, title: string, description?: string, metadata?: Record<string, unknown>): Promise<CustomerTimelineEvent> {
    return this.repository.addTimelineEvent(userId, type, title, description, metadata);
  }

  async getTimeline(userId: string, limit = 50, offset = 0): Promise<CustomerTimeline> {
    const { events, total } = await this.repository.getTimeline(userId, limit, offset);
    return { userId, events, total };
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

    const { events } = await this.repository.getTimeline(userId, limit);

    const allEvents = [...ticketEvents, ...events];
    allEvents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return allEvents.slice(0, limit);
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
}
