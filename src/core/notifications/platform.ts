import { eventBus } from "@/core/events";
import type { EventType } from "@/core/events";
import { logger } from "@/core/logger";

export interface NotificationPlatformBootstrap {
  initialize(): Promise<void>;
  subscribeToDomainEvents(): void;
  shutdown(): void;
}

export function createNotificationPlatform(): NotificationPlatformBootstrap {
  const domainEventTypes: EventType[] = [
    "user.created",
    "user.updated",
    "user.deleted",
    "user.login",
    "user.logout",
    "user.registered",
    "workspace.created",
    "workspace.updated",
    "workspace.deleted",
    "membership.invited",
    "membership.accepted",
    "membership.removed",
    "payment.success",
    "payment.failed",
    "order.created",
    "order.paid",
    "order.cancelled",
    "subscription.created",
    "subscription.updated",
    "subscription.cancelled",
    "credits.low",
    "credits.exhausted",
    "credits.purchased",
    "ai.generation.started",
    "ai.generation.completed",
    "ai.generation.failed",
    "workflow.created",
    "workflow.started",
    "workflow.completed",
    "workflow.failed",
    "system.config.updated",
    "system.error",
  ];

  const subscriptions: (() => void)[] = [];

  return {
    async initialize(): Promise<void> {
      logger.info("Notification platform initializing");
      this.subscribeToDomainEvents();
      logger.info("Notification platform initialized", {
        domainEventSubscriptions: domainEventTypes.length,
      });
    },

    subscribeToDomainEvents(): void {
      for (const eventType of domainEventTypes) {
        const unsubscribe = eventBus.subscribe(eventType, (event) => {
          logger.info("Domain event received by notification platform", {
            eventType: event.type,
            eventId: event.id,
          });
        });
        subscriptions.push(unsubscribe);
      }
    },

    shutdown(): void {
      for (const unsubscribe of subscriptions) {
        unsubscribe();
      }
      subscriptions.length = 0;
      logger.info("Notification platform shutdown complete");
    },
  };
}
