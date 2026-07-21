import { logger } from "@/core/logger/logger";

export interface QueuedEvent {
  id: string;
  type: string;
  source: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: Date;
  lastError?: string;
}

export class EventQueue {
  private queue: QueuedEvent[] = [];
  private deadLetterQueue: QueuedEvent[] = [];
  private isProcessingFlag = false;
  private processingPromise: Promise<void> | null = null;

  enqueue(
    event: Omit<QueuedEvent, "attempts" | "maxAttempts" | "nextAttemptAt">,
    options?: { maxAttempts?: number }
  ): void {
    const queuedEvent: QueuedEvent = {
      ...event,
      attempts: 0,
      maxAttempts: options?.maxAttempts ?? 3,
      nextAttemptAt: new Date(),
    };

    this.queue.push(queuedEvent);
  }

  dequeue(): QueuedEvent | undefined {
    return this.queue.shift();
  }

  peek(): QueuedEvent | undefined {
    return this.queue[0];
  }

  get size(): number {
    return this.queue.length;
  }

  get isProcessing(): boolean {
    return this.isProcessingFlag;
  }

  async process(
    handler: (event: QueuedEvent) => Promise<void>,
    concurrency = 1
  ): Promise<void> {
    if (this.isProcessingFlag) {
      return this.processingPromise ?? Promise.resolve();
    }

    this.isProcessingFlag = true;

    try {
      const workers: Promise<void>[] = [];

      for (let i = 0; i < concurrency; i++) {
        workers.push(this.worker(handler));
      }

      this.processingPromise = Promise.all(workers).then(() => undefined);
      await this.processingPromise;
    } finally {
      this.isProcessingFlag = false;
      this.processingPromise = null;
    }
  }

  private async worker(handler: (event: QueuedEvent) => Promise<void>): Promise<void> {
    while (this.queue.length > 0) {
      const queuedEvent = this.queue[0];

      if (!queuedEvent) {
        break;
      }

      if (queuedEvent.nextAttemptAt > new Date()) {
        break;
      }

      this.queue.shift();

      try {
        await handler(queuedEvent);
        queuedEvent.attempts++;
      } catch (error) {
        queuedEvent.attempts++;
        queuedEvent.lastError = error instanceof Error ? error.message : String(error);

        if (queuedEvent.attempts >= queuedEvent.maxAttempts) {
          logger.warn("Event moved to dead letter queue", {
            eventId: queuedEvent.id,
            type: queuedEvent.type,
            attempts: queuedEvent.attempts,
          });
          this.deadLetterQueue.push(queuedEvent);
        } else {
          const backoffMs = Math.min(1000 * Math.pow(2, queuedEvent.attempts), 30000);
          queuedEvent.nextAttemptAt = new Date(Date.now() + backoffMs);
          this.queue.push(queuedEvent);
        }
      }
    }
  }

  getDeadLetterEvents(): QueuedEvent[] {
    return [...this.deadLetterQueue];
  }
}
