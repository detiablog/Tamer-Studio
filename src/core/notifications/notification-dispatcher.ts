import type { MailService, MailMessage } from "@/core/mail";
import type { SmsService, SmsMessage } from "@/core/sms";
import type { PushService, PushMessage } from "@/core/push";
import type { NotificationPreferencesService } from "@/core/preferences";
import type { EventPublisher } from "@/core/events";
import type { InboxNotification } from "@/core/inbox";
import type { NotificationDeliveryResult } from "./notification.types";
import { logger } from "@/core/logger";

export class NotificationDispatcher {
  constructor(
    private mailService: MailService,
    private smsService: SmsService,
    private pushService: PushService,
    private preferencesService: NotificationPreferencesService,
    private eventPublisher: EventPublisher
  ) {}

  async dispatch(notification: InboxNotification): Promise<NotificationDeliveryResult> {
    const isEnabled = await this.preferencesService.isChannelEnabled(notification.userId, notification.channel, notification.category);
    
    if (!isEnabled) {
      logger.info("Notification skipped due to user preferences", {
        notificationId: notification.id,
        userId: notification.userId,
        channel: notification.channel,
        category: notification.category,
      });
      return {
        notificationId: notification.id,
        channel: notification.channel,
        success: false,
        error: "Channel disabled by user preference",
      };
    }

    switch (notification.channel) {
      case "in_app":
        return this.dispatchInApp(notification);
      case "email":
        return this.dispatchEmail(notification);
      case "sms":
        return this.dispatchSms(notification);
      case "push":
        return this.dispatchPush(notification);
      default:
        return {
          notificationId: notification.id,
          channel: notification.channel,
          success: false,
          error: `Unsupported channel: ${notification.channel}`,
        };
    }
  }

  async dispatchInApp(notification: InboxNotification): Promise<NotificationDeliveryResult> {
    logger.info("Dispatching in-app notification", { notificationId: notification.id });
    
    await this.eventPublisher.publishApplicationEvent("notification.dispatched", {
      notificationId: notification.id,
      channel: "in_app",
      userId: notification.userId,
    });

    return {
      notificationId: notification.id,
      channel: "in_app",
      success: true,
    };
  }

  async dispatchEmail(notification: InboxNotification): Promise<NotificationDeliveryResult> {
    logger.info("Dispatching email notification", { notificationId: notification.id });

    const message: MailMessage = {
      to: notification.userId,
      subject: notification.title,
      html: `<p>${notification.message}</p>`,
      metadata: { notificationId: notification.id, category: notification.category },
    };

    const result = await this.mailService.send(message);

    await this.eventPublisher.publishApplicationEvent("notification.dispatched", {
      notificationId: notification.id,
      channel: "email",
      userId: notification.userId,
      success: result.success,
      provider: result.provider,
      error: result.error,
    });

    return {
      notificationId: notification.id,
      channel: "email",
      success: result.success,
      error: result.error,
      provider: result.provider,
    };
  }

  async dispatchSms(notification: InboxNotification): Promise<NotificationDeliveryResult> {
    logger.info("Dispatching SMS notification", { notificationId: notification.id });

    const message: SmsMessage = {
      to: notification.userId,
      body: notification.message,
      metadata: { notificationId: notification.id, category: notification.category },
    };

    const result = await this.smsService.send(message);

    await this.eventPublisher.publishApplicationEvent("notification.dispatched", {
      notificationId: notification.id,
      channel: "sms",
      userId: notification.userId,
      success: result.success,
      provider: result.provider,
      error: result.error,
    });

    return {
      notificationId: notification.id,
      channel: "sms",
      success: result.success,
      error: result.error,
      provider: result.provider,
    };
  }

  async dispatchPush(notification: InboxNotification): Promise<NotificationDeliveryResult> {
    logger.info("Dispatching push notification", { notificationId: notification.id });

    const message: PushMessage = {
      userId: notification.userId,
      title: notification.title,
      body: notification.message,
      data: { notificationId: notification.id, category: notification.category },
    };

    const result = await this.pushService.send(message);

    await this.eventPublisher.publishApplicationEvent("notification.dispatched", {
      notificationId: notification.id,
      channel: "push",
      userId: notification.userId,
      success: result.success,
      provider: result.provider,
      error: result.error,
    });

    return {
      notificationId: notification.id,
      channel: "push",
      success: result.success,
      error: result.error,
      provider: result.provider,
    };
  }
}
