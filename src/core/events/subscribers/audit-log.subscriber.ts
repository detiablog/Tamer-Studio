import { eventBus } from "@/core/events/event-bus";
import { auditService } from "@/core/audit/audit.service";
import { logger } from "@/core/logger/logger";
import type { Event, DomainEvent, EventType } from "@/core/events/event";

const NON_AUDIT_EVENTS: Set<EventType> = new Set([
  "notification.created",
  "notification.queued",
  "notification.dispatched",
  "notification.delivered",
  "notification.failed",
  "notification.retried",
  "notification.read",
  "notification.archived",
  "notification.deleted",
  "notification.broadcast",
  "template.rendered",
  "preferences.updated",
  "event.queue.full",
  "event.dlq.alert",
]);

export class AuditLogSubscriber {
  private unsubscribeFn: (() => void) | null = null;

  initialize(): void {
    this.unsubscribeFn = eventBus.subscribeAll(this.onEvent.bind(this));
    logger.info("AuditLogSubscriber initialized - listening to all events");
  }

  async onEvent(event: Event): Promise<void> {
    if (NON_AUDIT_EVENTS.has(event.type)) {
      return;
    }

    try {
      const domainEvent = event as DomainEvent;
      const actorId = domainEvent.actorId ?? event.payload.actorId as string | undefined;
      const resourceId = domainEvent.resourceId ?? event.payload.resourceId as string | undefined;
      const resourceType = domainEvent.resourceType ?? event.payload.resourceType as string | undefined;

      await auditService.logAction(
        event.type as Parameters<typeof auditService.logAction>[0],
        actorId,
        "system",
        {
          ...event.payload,
          eventId: event.id,
          eventSource: event.source,
          resourceId,
          resourceType,
        }
      );

      logger.debug("Audit log recorded for event", {
        eventType: event.type,
        eventId: event.id,
        actorId,
        resourceId,
      });
    } catch (error) {
      logger.error("Failed to record audit log for event", error as Error, {
        eventType: event.type,
        eventId: event.id,
      });
    }
  }

  destroy(): void {
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
      this.unsubscribeFn = null;
    }
    logger.info("AuditLogSubscriber destroyed");
  }
}

let auditLogSubscriberInstance: AuditLogSubscriber | null = null;

export function getAuditLogSubscriber(): AuditLogSubscriber {
  if (!auditLogSubscriberInstance) {
    auditLogSubscriberInstance = new AuditLogSubscriber();
  }
  return auditLogSubscriberInstance;
}

export function resetAuditLogSubscriber(): void {
  if (auditLogSubscriberInstance) {
    auditLogSubscriberInstance.destroy();
    auditLogSubscriberInstance = null;
  }
}
