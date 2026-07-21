export type InboxStatus = "pending" | "queued" | "sent" | "delivered" | "failed" | "read" | "archived" | "deleted";
export type InboxChannel = "email" | "sms" | "push" | "in_app";
export type InboxCategory = "system" | "billing" | "ai" | "workflow" | "security" | "marketing";

export interface InboxNotification {
  id: string;
  userId: string;
  type: "domain" | "application" | "system";
  category: InboxCategory;
  channel: InboxChannel;
  title: string;
  message: string;
  data: Record<string, unknown>;
  priority: "low" | "normal" | "high" | "urgent";
  status: InboxStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  archivedAt?: Date;
  deletedAt?: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InboxFilter {
  status?: InboxStatus;
  category?: InboxCategory;
  channel?: InboxChannel;
  unreadOnly?: boolean;
  archived?: boolean;
  limit?: number;
  offset?: number;
}

export interface InboxStats {
  total: number;
  unread: number;
  byCategory: Record<InboxCategory, number>;
  byChannel: Record<InboxChannel, number>;
}
