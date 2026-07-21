export type TimelineEventType =
  | "ticket.created"
  | "ticket.resolved"
  | "ticket.closed"
  | "purchase"
  | "subscription.changed"
  | "billing.event"
  | "notification.sent"
  | "login"
  | "support.activity";

export interface CustomerTimelineEvent {
  id: string;
  userId: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface CustomerTimeline {
  userId: string;
  events: CustomerTimelineEvent[];
  total: number;
}
