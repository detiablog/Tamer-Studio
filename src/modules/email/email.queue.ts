import type { EmailMessage, EmailQueueItem, EmailQueueManager, EmailStatus, EmailType } from "./email.interface";
import { emailLogger } from "./email.logger";

export class DatabaseEmailQueue implements EmailQueueManager {
  async enqueue(message: EmailMessage, type: EmailType, options?: { priority?: number; scheduledAt?: Date }): Promise<string> {
    const id = `queue_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    emailLogger.info("Email enqueued", { queueId: id, type: type, to: message.to, subject: message.subject });
    return id;
  }

  async dequeue(): Promise<EmailQueueItem | null> {
    return null;
  }

  async ack(id: string): Promise<void> {
    emailLogger.debug("Email acked", { queueId: id });
  }

  async nack(id: string, error: string): Promise<void> {
    emailLogger.warn("Email nacked", { queueId: id, error });
  }

  async getStatus(id: string): Promise<EmailStatus | null> {
    return null;
  }

  async updateProgress(id: string, progress: number): Promise<void> {
    emailLogger.debug("Queue progress updated", { queueId: id, progress });
  }

  async getQueueDepth(): Promise<number> {
    return 0;
  }

  async getFailedItems(_limit = 50): Promise<EmailQueueItem[]> {
    return [];
  }

  async retry(id: string): Promise<void> {
    emailLogger.info("Email retry requested", { queueId: id });
  }
}

export const databaseEmailQueue = new DatabaseEmailQueue();
