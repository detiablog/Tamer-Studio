import { logger } from "@/core/logger/logger";
import { EventBus } from "./event-bus";
import type { Event, EventHandler } from "./event";

export interface AsyncEventBusOptions {
  concurrency: number;
}

export class AsyncEventBus {
  private queue: { event: Event; handler: EventHandler }[] = [];
  private running = 0;
  private finished = false;

  constructor(private options: AsyncEventBusOptions, private bus = EventBus.getInstance()) {}

  start(): void {
    this.finished = false;
    this.process();
  }

  async process(): Promise<void> {
    while (!this.finished) {
      while (this.running < this.options.concurrency && this.queue.length > 0) {
        const item = this.queue.shift();
        if (!item) break;
        this.running++;
        this.execute(item.event, item.handler);
      }
      if (this.queue.length === 0 && this.running === 0) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  enqueue(event: Event, handler: EventHandler): void {
    this.queue.push({ event, handler });
  }

  stop(): void {
    this.finished = true;
    this.queue = [];
  }

  private async execute(event: Event, handler: EventHandler): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
      logger.error("Async event handler failed", error as Error, { eventId: event.id });
    } finally {
      this.running--;
    }
  }
}