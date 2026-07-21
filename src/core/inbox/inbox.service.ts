import type { InboxNotification, InboxFilter, InboxStats } from "./inbox.types";
import { logUserAction } from "@/core/audit";
import { InboxRepository } from "./inbox.repository";

export class InboxService {
  private repository = new InboxRepository();

  async getNotifications(userId: string, filter?: InboxFilter): Promise<InboxNotification[]> {
    return this.repository.getByUser(userId, filter);
  }

  async getNotification(userId: string, id: string): Promise<InboxNotification | undefined> {
    const result = await this.repository.getById(id);
    if (result && result.userId === userId) {
      return result;
    }
    return undefined;
  }

  async getStats(userId: string): Promise<InboxStats> {
    return this.repository.getStats(userId);
  }

  async markAsRead(userId: string, id: string): Promise<InboxNotification | undefined> {
    const result = await this.repository.markAsRead(id, userId);
    if (result) {
      await logUserAction("notification.read", userId, { notificationId: id });
    }
    return result;
  }

  async markAsUnread(userId: string, id: string): Promise<InboxNotification | undefined> {
    return this.repository.markAsUnread(id, userId);
  }

  async archive(userId: string, id: string): Promise<InboxNotification | undefined> {
    const result = await this.repository.archive(id, userId);
    if (result) {
      await logUserAction("notification.archived", userId, { notificationId: id });
    }
    return result;
  }

  async restore(userId: string, id: string): Promise<InboxNotification | undefined> {
    return this.repository.unarchive(id, userId);
  }

  async delete(userId: string, id: string): Promise<InboxNotification | undefined> {
    const result = await this.repository.softDelete(id, userId);
    if (result) {
      await logUserAction("notification.deleted", userId, { notificationId: id });
    }
    return result;
  }

  async getHistory(userId: string, limit = 50, offset = 0): Promise<InboxNotification[]> {
    return this.repository.getByUser(userId, { limit, offset });
  }
}
