import type { Event, EventHandler } from "./event";
import { logger } from "@/core/logger/logger";

export interface EventLogEntry {
  event: Event;
  timestamp: number;
}

export class EventLog {
  private history: EventLogEntry[] = [];

  append(event: Event): void {
    this.history.push({ event, timestamp: Date.now() });
  }

  getHistory(): Event[] {
    return this.history.map((entry) => entry.event);
  }

  getHistorySince(timestamp: number): Event[] {
    return this.history.filter((entry) => entry.timestamp > timestamp).map((entry) => entry.event);
  }

  async replay(handler: EventHandler, fromTimestamp?: number): Promise<void> {
    const events = fromTimestamp ? this.getHistorySince(fromTimestamp) : this.getHistory();
    for (const event of events) {
      try {
        await handler(event);
      } catch (error) {
        logger.error("Event replay handler failed", error as Error, { eventId: event.id });
      }
    }
  }

  clear(): void {
    this.history = [];
  }
}