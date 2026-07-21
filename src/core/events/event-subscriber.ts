import { eventBus } from "./event-bus";
import type { Event, EventHandler, EventType } from "./event";

export interface EventSubscriber {
  subscribe(eventTypes: EventType[], handler: EventHandler): void;
  unsubscribe(): void;
}

export abstract class BaseEventSubscriber implements EventSubscriber {
  private unsubscribers: Array<() => void> = [];

  subscribe(eventTypes: EventType[], handler: EventHandler): void {
    this.unsubscribe();

    for (const type of eventTypes) {
      this.unsubscribers.push(eventBus.subscribe(type, handler));
    }
  }

  unsubscribe(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
  }

  abstract onEvent(event: Event): Promise<void> | void;
}
