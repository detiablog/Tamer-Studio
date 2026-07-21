import type { SupportStats, SupportQueueItem, SupportCategory, SupportPriority } from "./types";
import { SUPPORT_CATEGORIES, SUPPORT_PRIORITIES, SUPPORT_QUEUES } from "./types";
import { TicketService } from "../tickets";
import type { TicketStatus } from "../tickets";
import type { EventPublisher } from "@/core/events";

export class SupportService {
  private ticketService: TicketService;

  constructor(eventPublisher?: EventPublisher) {
    this.ticketService = new TicketService(eventPublisher);
  }

  async createTicket(userId: string, category: SupportCategory, subject: string, description: string, priority?: SupportPriority, workspaceId?: string) {
    return this.ticketService.create({
      userId,
      workspaceId,
      category,
      priority: priority ?? "medium",
      subject,
      description,
    });
  }

  async getTicket(ticketId: string) {
    return this.ticketService.get(ticketId);
  }

  async listTickets(filter?: { userId?: string; workspaceId?: string; category?: SupportCategory; priority?: SupportPriority; status?: TicketStatus; assignedTo?: string }) {
    return this.ticketService.list(filter);
  }

  async updateTicket(ticketId: string, input: { category?: SupportCategory; priority?: SupportPriority; status?: TicketStatus; subject?: string; description?: string; assignedTo?: string }) {
    return this.ticketService.update(ticketId, input);
  }

  async assignTicket(ticketId: string, assigneeId: string) {
    return this.ticketService.assign(ticketId, assigneeId);
  }

  async closeTicket(ticketId: string) {
    return this.ticketService.close(ticketId);
  }

  async reopenTicket(ticketId: string) {
    return this.ticketService.reopen(ticketId);
  }

  async archiveTicket(ticketId: string) {
    return this.ticketService.archive(ticketId);
  }

  async transitionTicket(ticketId: string, status: string) {
    return this.ticketService.transition(ticketId, status as TicketStatus);
  }

  async getSupportStats(filter?: { userId?: string; workspaceId?: string }): Promise<SupportStats> {
    const stats = await this.ticketService.getStats(filter);
    return {
      ...stats,
      open: stats.byStatus.open ?? 0,
      assigned: stats.byStatus.assigned ?? 0,
      inProgress: stats.byStatus.in_progress ?? 0,
      waitingCustomer: stats.byStatus.waiting_customer ?? 0,
      waitingInternal: stats.byStatus.waiting_internal ?? 0,
      resolved: stats.byStatus.resolved ?? 0,
      closed: stats.byStatus.closed ?? 0,
      reopened: stats.byStatus.reopened ?? 0,
      archived: stats.byStatus.archived ?? 0,
    } as SupportStats;
  }

  async getQueue(queueName: string, limit = 50): Promise<SupportQueueItem[]> {
    const statusMap: Record<string, TicketStatus> = {
      customer_service: "open",
      technical_support: "open",
      billing_support: "open",
      internal_support: "open",
    };

    const status = statusMap[queueName] ?? "open";
    const tickets = await this.ticketService.list({ status, limit });

    return tickets.map((t) => ({
      ticketId: t.id,
      userId: t.userId,
      category: t.category,
      priority: t.priority,
      status: t.status,
      assignedTo: t.assignedTo,
      createdAt: t.createdAt,
    }));
  }

  getCategories() {
    return SUPPORT_CATEGORIES;
  }

  getPriorities() {
    return SUPPORT_PRIORITIES;
  }

  getQueues() {
    return SUPPORT_QUEUES;
  }
}
