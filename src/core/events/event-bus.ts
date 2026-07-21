import { logger } from "@/core/logger/logger";
import type { Event, EventHandler, EventType } from "./event";

type ListenerMap = Map<EventType, Set<EventHandler>>;

class EventBus {
  private static instance: EventBus;
  private listeners: ListenerMap = new Map();
  private allListeners: Set<EventHandler> = new Set();

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  subscribe(type: EventType, handler: EventHandler): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);

    return () => {
      this.listeners.get(type)?.delete(handler);
    };
  }

  subscribeAll(handler: EventHandler): () => void {
    this.allListeners.add(handler);

    return () => {
      this.allListeners.delete(handler);
    };
  }

  emit(event: Event): void {
    const specificHandlers = this.listeners.get(event.type) || new Set();

    specificHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        logger.error(`Event handler failed for ${event.type}`, error as Error, {
          eventId: event.id,
        });
      }
    });

    this.allListeners.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        logger.error(`Global event handler failed for ${event.type}`, error as Error, {
          eventId: event.id,
        });
      }
    });
  }

  publish(type: EventType, payload: Record<string, unknown>, source: string): void {
    const event: Event = {
      id: crypto.randomUUID(),
      type,
      source,
      payload,
      timestamp: new Date(),
    };

    this.emit(event);
  }

  getStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    this.listeners.forEach((handlers, type) => {
      stats[type] = handlers.size;
    });

    stats._all = this.allListeners.size;

    return stats;
  }
}

export const eventBus = EventBus.getInstance();
export { EventBus };
