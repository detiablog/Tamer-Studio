import type { EventQueue } from "@/core/events";
import type { CreateNotificationInput } from "./notification.types";
import { logger } from "@/core/logger";

export class NotificationScheduler {
  constructor(private eventQueue: EventQueue) {}

  async schedule(input: CreateNotificationInput & { id?: string }): Promise<void> {
    const event = {
      id: input.id ?? `notif_${crypto.randomUUID()}`,
      type: "notification.schedule",
      source: "notifications",
      payload: input as unknown as Record<string, unknown>,
      timestamp: new Date(),
    };

    this.eventQueue.enqueue(event, { maxAttempts: 3 });
    logger.info("Notification scheduled", { notificationId: event.id, scheduledAt: input.scheduledAt });
  }

  async processPending(): Promise<void> {
    logger.info("Processing pending notification events");
    await this.eventQueue.process(async (event) => {
      if (event.type === "notification.schedule") {
        const input = event.payload as unknown as CreateNotificationInput;
        logger.info("Processing scheduled notification", { notificationId: event.id, userId: input.userId });
      }
    }, 1);
  }

  async retryFailed(): Promise<void> {
    const deadLetter = this.eventQueue.getDeadLetterEvents();
    logger.warn("Retrying failed notification events", { count: deadLetter.length });

    for (const event of deadLetter) {
      if (event.type === "notification.schedule") {
        this.eventQueue.enqueue(event, { maxAttempts: 3 });
      }
    }
  }
}
