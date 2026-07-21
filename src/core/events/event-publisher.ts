import { eventBus } from "./event-bus";
import { logger } from "@/core/logger/logger";
import type { DomainEvent, ApplicationEvent } from "./event";

export class EventPublisher {
  async publishDomainEvent(
    type: DomainEvent["type"],
    payload: Record<string, unknown>,
    source: DomainEvent["source"],
    options?: { actorId?: string; resourceId?: string; resourceType?: string }
  ): Promise<void> {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      logger.warn("Invalid domain event payload", { type, source });
      return;
    }

    const event: DomainEvent = {
      id: crypto.randomUUID(),
      type,
      source,
      payload,
      timestamp: new Date(),
      ...options,
    };

    logger.info("Publishing domain event", { eventId: event.id, type, source });
    eventBus.emit(event);
  }

  async publishApplicationEvent(
    type: ApplicationEvent["type"],
    payload: Record<string, unknown>,
    options?: { correlationId?: string }
  ): Promise<void> {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      logger.warn("Invalid application event payload", { type });
      return;
    }

    const event: ApplicationEvent = {
      id: crypto.randomUUID(),
      type,
      source: "notifications",
      payload,
      timestamp: new Date(),
      ...options,
    };

    logger.info("Publishing application event", { eventId: event.id, type });
    eventBus.emit(event);
  }
}
