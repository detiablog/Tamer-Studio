import type { InboxNotification, InboxFilter, InboxStats } from "@/core/inbox";
import type { CreateNotificationInput, BroadcastInput } from "./notification.types";
import { logAction } from "@/core/audit";
import type { EventPublisher } from "@/core/events";
import type { NotificationTemplateService } from "@/core/templates";
import type { NotificationPreferencesService } from "@/core/preferences";
import type { NotificationRepository } from "./notification.repository";
import type { NotificationDispatcher } from "./notification-dispatcher";
import type { NotificationScheduler } from "./notification-scheduler";

export class NotificationService {
  constructor(
    private repository: NotificationRepository,
    private dispatcher: NotificationDispatcher,
    private scheduler: NotificationScheduler,
    private eventPublisher: EventPublisher,
    private templateService: NotificationTemplateService,
    private preferencesService: NotificationPreferencesService
  ) {}

  async create(input: CreateNotificationInput): Promise<InboxNotification> {
    const notification = await this.repository.create(input);

    await this.eventPublisher.publishApplicationEvent("notification.created", {
      notificationId: notification.id,
      userId: input.userId,
      category: input.category,
      channel: input.channel,
    });

    if (input.scheduledAt) {
      await this.scheduler.schedule({ ...input, id: notification.id });
    } else {
      await this.dispatcher.dispatch(notification);
    }

    await logAction("notification.created", undefined, undefined, {
      notificationId: notification.id,
      userId: input.userId,
      channel: input.channel,
    });

    return notification;
  }

  async send(input: CreateNotificationInput): Promise<InboxNotification> {
    const notification = await this.repository.create(input);
    const result = await this.dispatcher.dispatch(notification);

    if (result.success) {
      await this.repository.updateStatus(notification.id, "sent");
    } else {
      await this.repository.updateStatus(notification.id, "failed");
    }

    await this.eventPublisher.publishApplicationEvent("notification.dispatched", {
      notificationId: notification.id,
      success: result.success,
      channel: input.channel,
    });

    return notification;
  }

  async broadcast(input: BroadcastInput): Promise<InboxNotification[]> {
    const notifications: InboxNotification[] = [];
    const userIds = input.userIds ?? [];

    for (const userId of userIds) {
      const notification = await this.create({
        ...input,
        userId,
      });
      notifications.push(notification);
    }

    await this.eventPublisher.publishApplicationEvent("notification.broadcast", {
      count: notifications.length,
      category: input.category,
      channel: input.channel,
      workspaceId: input.workspaceId,
    });

    return notifications;
  }

  async schedule(input: CreateNotificationInput): Promise<InboxNotification> {
    const notification = await this.repository.create(input);
    await this.scheduler.schedule({ ...input, id: notification.id });

    await this.eventPublisher.publishApplicationEvent("notification.queued", {
      notificationId: notification.id,
      scheduledAt: input.scheduledAt,
    });

    return notification;
  }

  async get(userId: string, id: string): Promise<InboxNotification | undefined> {
    return this.repository.getById(id);
  }

  async list(userId: string, filter?: InboxFilter): Promise<InboxNotification[]> {
    return this.repository.getByUser(userId, filter);
  }

  async markAsRead(userId: string, id: string): Promise<InboxNotification | undefined> {
    const notification = await this.repository.getById(id);
    if (!notification || notification.userId !== userId) return undefined;

    const result = await this.repository.markAsRead(id, userId);
    if (result) {
      await this.eventPublisher.publishApplicationEvent("notification.read", {
        notificationId: id,
        userId,
      });
    }
    return result;
  }

  async archive(userId: string, id: string): Promise<InboxNotification | undefined> {
    const notification = await this.repository.getById(id);
    if (!notification || notification.userId !== userId) return undefined;

    const result = await this.repository.archive(id, userId);
    if (result) {
      await this.eventPublisher.publishApplicationEvent("notification.archived", {
        notificationId: id,
        userId,
      });
    }
    return result;
  }

  async delete(userId: string, id: string): Promise<InboxNotification | undefined> {
    const notification = await this.repository.getById(id);
    if (!notification || notification.userId !== userId) return undefined;

    await this.repository.softDelete(id);

    await logAction("notification.deleted", undefined, undefined, { notificationId: id, userId });
    await this.eventPublisher.publishApplicationEvent("notification.deleted", {
      notificationId: id,
      userId,
    });

    return notification;
  }

  async getStats(userId: string): Promise<InboxStats> {
    return this.repository.getStats(userId);
  }
}
