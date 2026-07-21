import type { SupportTicket, CreateTicketInput, UpdateTicketInput, TicketFilter, TicketCategory, TicketPriority, TicketStatus } from "./types";
import { TicketRepository } from "./ticket.repository";
import { logAction } from "@/core/audit";
import type { AuditAction } from "@/core/audit";
import { logger } from "@/core/logger";
import type { EventPublisher } from "@/core/events";

const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  draft: ["open", "archived"],
  open: ["assigned", "in_progress", "waiting_customer", "waiting_internal", "closed"],
  assigned: ["in_progress", "waiting_customer", "waiting_internal", "resolved", "closed", "reopened"],
  in_progress: ["waiting_customer", "waiting_internal", "resolved", "closed"],
  waiting_customer: ["in_progress", "resolved", "closed"],
  waiting_internal: ["in_progress", "resolved", "closed"],
  resolved: ["closed", "reopened"],
  closed: ["reopened", "archived"],
  reopened: ["in_progress", "assigned", "waiting_customer", "waiting_internal", "resolved", "closed"],
  archived: [],
};

const TICKET_STATUS_AUDIT_MAP: Record<string, string> = {
  assigned: "ticket.assigned",
  resolved: "ticket.resolved",
  closed: "ticket.closed",
  reopened: "ticket.reopened",
  archived: "ticket.archived",
  open: "ticket.updated",
  in_progress: "ticket.updated",
  waiting_customer: "ticket.updated",
  waiting_internal: "ticket.updated",
  draft: "ticket.updated",
};

export class TicketService {
  private repository = new TicketRepository();

  constructor(private eventPublisher?: EventPublisher) {}

  async create(input: CreateTicketInput): Promise<SupportTicket> {
    const ticket = await this.repository.create({
      ...input,
      priority: input.priority ?? "medium",
      status: "draft",
    });

    logAction("ticket.created", undefined, undefined, { ticketId: ticket.id, userId: ticket.userId, category: ticket.category, priority: ticket.priority });
    logger.info("Ticket created", { ticketId: ticket.id });

    if (this.eventPublisher) {
      await this.eventPublisher.publishDomainEvent("ticket.created", { ticketId: ticket.id, userId: ticket.userId, category: ticket.category, priority: ticket.priority }, "support", { resourceId: ticket.id, resourceType: "ticket" });
    }

    return ticket;
  }

  async get(ticketId: string): Promise<SupportTicket | undefined> {
    return this.repository.getById(ticketId);
  }

  async list(filter?: TicketFilter): Promise<SupportTicket[]> {
    return this.repository.list(filter);
  }

  async update(ticketId: string, input: UpdateTicketInput): Promise<SupportTicket | undefined> {
    const existing = await this.repository.getById(ticketId);
    if (!existing) return undefined;

    if (input.status && input.status !== existing.status) {
      this.validateTransition(existing.status, input.status);
    }

    const ticket = await this.repository.update(ticketId, input);

    if (ticket) {
      logAction("ticket.updated", undefined, undefined, { ticketId, changes: input });
      logger.info("Ticket updated", { ticketId });

      if (this.eventPublisher) {
        await this.eventPublisher.publishDomainEvent("ticket.updated", { ticketId, status: ticket.status, priority: ticket.priority }, "support", { resourceId: ticket.id, resourceType: "ticket" });
      }
    }

    return ticket;
  }

  async assign(ticketId: string, assigneeId: string): Promise<SupportTicket | undefined> {
    const ticket = await this.repository.update(ticketId, { assignedTo: assigneeId, status: "assigned" });

    if (ticket) {
      logAction("ticket.assigned", undefined, undefined, { ticketId, assignedTo: assigneeId });
      logger.info("Ticket assigned", { ticketId, assigneeId });

      if (this.eventPublisher) {
        await this.eventPublisher.publishDomainEvent("ticket.assigned", { ticketId, assignedTo: assigneeId }, "support", { resourceId: ticket.id, resourceType: "ticket" });
      }
    }

    return ticket;
  }

  async transition(ticketId: string, newStatus: TicketStatus): Promise<SupportTicket | undefined> {
    const existing = await this.repository.getById(ticketId);
    if (!existing) return undefined;

    this.validateTransition(existing.status, newStatus);

    const updates: UpdateTicketInput = { status: newStatus };

    if (newStatus === "resolved") updates.resolvedAt = new Date();
    if (newStatus === "closed") updates.closedAt = new Date();

    const ticket = await this.repository.update(ticketId, updates);

    if (ticket) {
      const auditAction = TICKET_STATUS_AUDIT_MAP[newStatus] ?? "ticket.updated";
      logAction(auditAction as AuditAction, undefined, undefined, { ticketId, previousStatus: existing.status, newStatus });
      logger.info("Ticket transitioned", { ticketId, from: existing.status, to: newStatus });

      if (this.eventPublisher) {
        await this.eventPublisher.publishDomainEvent("ticket.updated", { ticketId, previousStatus: existing.status, newStatus }, "support", { resourceId: ticket.id, resourceType: "ticket" });
      }
    }

    return ticket;
  }

  async close(ticketId: string): Promise<SupportTicket | undefined> {
    return this.transition(ticketId, "closed");
  }

  async reopen(ticketId: string): Promise<SupportTicket | undefined> {
    return this.transition(ticketId, "reopened");
  }

  async archive(ticketId: string): Promise<SupportTicket | undefined> {
    const ticket = await this.repository.update(ticketId, { status: "archived" });

    if (ticket) {
      logAction("ticket.archived", undefined, undefined, { ticketId });
      logger.info("Ticket archived", { ticketId });

      if (this.eventPublisher) {
        await this.eventPublisher.publishDomainEvent("ticket.archived", { ticketId }, "support", { resourceId: ticket.id, resourceType: "ticket" });
      }
    }

    return ticket;
  }

  async softDelete(ticketId: string): Promise<void> {
    await this.repository.softDelete(ticketId);
    logAction("ticket.deleted", undefined, undefined, { ticketId });
    logger.info("Ticket soft deleted", { ticketId });
  }

  async getStats(filter?: { userId?: string; workspaceId?: string }): Promise<{
    total: number;
    byStatus: Record<TicketStatus, number>;
    byPriority: Record<TicketPriority, number>;
    byCategory: Record<TicketCategory, number>;
  }> {
    const tickets = await this.repository.list({ ...filter, limit: 1000 });

    const byStatus = tickets.reduce<Record<string, number>>((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
    const byPriority = tickets.reduce<Record<string, number>>((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {});
    const byCategory = tickets.reduce<Record<string, number>>((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {});

    return {
      total: tickets.length,
      byStatus: byStatus as Record<TicketStatus, number>,
      byPriority: byPriority as Record<TicketPriority, number>,
      byCategory: byCategory as Record<TicketCategory, number>,
    };
  }

  private validateTransition(current: TicketStatus, next: TicketStatus): void {
    const allowed = ALLOWED_TRANSITIONS[current] ?? [];
    if (!allowed.includes(next)) {
      throw new Error(`Invalid ticket transition from ${current} to ${next}`);
    }
  }
}
