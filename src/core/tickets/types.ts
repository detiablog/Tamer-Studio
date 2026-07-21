export type TicketCategory = "billing" | "technical" | "account" | "feature_request" | "bug_report" | "general";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "draft" | "open" | "assigned" | "in_progress" | "waiting_customer" | "waiting_internal" | "resolved" | "closed" | "reopened" | "archived";

export interface SupportTicket {
  id: string;
  userId: string;
  workspaceId?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  assignedTo?: string;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateTicketInput {
  userId: string;
  workspaceId?: string;
  category: TicketCategory;
  priority?: TicketPriority;
  subject: string;
  description: string;
}

export interface UpdateTicketInput {
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  subject?: string;
  description?: string;
  assignedTo?: string;
  resolvedAt?: Date;
  closedAt?: Date;
}

export interface TicketFilter {
  userId?: string;
  workspaceId?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignedTo?: string;
  limit?: number;
  offset?: number;
}
