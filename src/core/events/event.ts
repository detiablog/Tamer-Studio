export type DomainEventType =
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "user.login"
  | "user.logout"
  | "user.registered"
  | "workspace.created"
  | "workspace.updated"
  | "workspace.deleted"
  | "membership.invited"
  | "membership.accepted"
  | "membership.removed"
  | "payment.success"
  | "payment.failed"
  | "order.created"
  | "order.paid"
  | "order.cancelled"
  | "subscription.created"
  | "subscription.updated"
  | "subscription.cancelled"
  | "credits.low"
  | "credits.exhausted"
  | "credits.purchased"
  | "ai.generation.started"
  | "ai.generation.completed"
  | "ai.generation.failed"
  | "workflow.created"
  | "workflow.started"
  | "workflow.completed"
  | "workflow.failed"
  | "system.config.updated"
  | "system.error";

export type ApplicationEventType =
  | "notification.created"
  | "notification.queued"
  | "notification.dispatched"
  | "notification.delivered"
  | "notification.failed"
  | "notification.retried"
  | "notification.read"
  | "notification.archived"
  | "notification.deleted"
  | "notification.broadcast"
  | "template.rendered"
  | "preferences.updated"
  | "event.queue.full"
  | "event.dlq.alert";

export type EventType = DomainEventType | ApplicationEventType;

export interface Event {
  id: string;
  type: EventType;
  source: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface DomainEvent extends Event {
  type: DomainEventType;
  source: "identity" | "workspace" | "commerce" | "billing" | "ai" | "workflow" | "system";
  actorId?: string;
  resourceId?: string;
  resourceType?: string;
}

export interface ApplicationEvent extends Event {
  type: ApplicationEventType;
  source: "notifications";
  correlationId?: string;
}

export type EventHandler<T extends Event = Event> = (event: T) => Promise<void> | void;

export interface EventSubscription {
  id: string;
  type: EventType;
  handler: EventHandler;
  once: boolean;
}
