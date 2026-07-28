import { eventBus } from "@/core/events/event-bus";
import { EventPublisher } from "@/core/events/event-publisher";
import { logger } from "@/core/logger/logger";
import type { Event, EventType } from "@/core/events/event";

interface NotificationPayload {
  recipientId?: string;
  recipientEmail?: string;
  title: string;
  body: string;
  channel: "email" | "in-app" | "push";
  metadata?: Record<string, unknown>;
}

const NOTIFICATION_EVENTS: EventType[] = [
  "cms.page.created",
  "cms.page.updated",
  "cms.page.deleted",
  "cms.section.created",
  "cms.section.updated",
  "cms.section.deleted",
  "membership.invited",
  "membership.accepted",
  "membership.removed",
  "ticket.created",
  "ticket.assigned",
  "ticket.resolved",
  "ticket.closed",
  "sla.violated",
  "payment.success",
  "payment.failed",
  "order.created",
  "order.paid",
  "order.cancelled",
  "subscription.created",
  "subscription.cancelled",
  "credits.low",
  "credits.exhausted",
];

export class NotificationSubscriber {
  private publisher = new EventPublisher();
  private unsubscribers: Array<() => void> = [];

  initialize(): void {
    for (const eventType of NOTIFICATION_EVENTS) {
      const unsub = eventBus.subscribe(eventType, this.onEvent.bind(this));
      this.unsubscribers.push(unsub);
    }
    logger.info("NotificationSubscriber initialized", {
      events: NOTIFICATION_EVENTS,
    });
  }

  async onEvent(event: Event): Promise<void> {
    try {
      const notifications = this.buildNotifications(event);

      for (const notification of notifications) {
        await this.dispatchNotification(notification, event);
      }
    } catch (error) {
      logger.error("Notification dispatch failed", error as Error, {
        eventType: event.type,
        eventId: event.id,
      });
    }
  }

  private buildNotifications(event: Event): NotificationPayload[] {
    const notifications: NotificationPayload[] = [];
    const payload = event.payload;

    switch (event.type) {
      case "cms.page.created":
        notifications.push({
          title: "Page Created",
          body: `A new page "${payload.title ?? "untitled"}" has been created.`,
          channel: "in-app",
          metadata: { pageId: payload.pageId, slug: payload.slug },
        });
        break;

      case "cms.page.updated":
        notifications.push({
          title: "Page Updated",
          body: `Page "${payload.title ?? "untitled"}" has been updated.`,
          channel: "in-app",
          metadata: { pageId: payload.pageId },
        });
        break;

      case "cms.page.deleted":
        notifications.push({
          title: "Page Deleted",
          body: `Page "${payload.title ?? "untitled"}" has been deleted.`,
          channel: "in-app",
          metadata: { pageId: payload.pageId },
        });
        break;

      case "cms.section.created":
      case "cms.section.updated":
      case "cms.section.deleted":
        notifications.push({
          title: `Section ${event.type.split(".").pop()}`,
          body: `Section has been ${event.type.split(".").pop()}.`,
          channel: "in-app",
          metadata: { sectionId: payload.sectionId, pageId: payload.pageId },
        });
        break;

      case "membership.invited":
        notifications.push({
          title: "Team Invitation",
          body: `You have been invited to join a workspace.`,
          channel: "email",
          recipientEmail: payload.email as string,
          metadata: { workspaceId: payload.workspaceId },
        });
        break;

      case "ticket.created":
      case "ticket.assigned":
        notifications.push({
          title: `Ticket ${event.type.split(".").pop()}`,
          body: `Support ticket has been ${event.type.split(".").pop()}.`,
          channel: "in-app",
          metadata: { ticketId: payload.ticketId },
        });
        break;

      case "ticket.resolved":
      case "ticket.closed":
        notifications.push({
          title: `Ticket ${event.type.split(".").pop()}`,
          body: `Support ticket has been ${event.type.split(".").pop()}.`,
          channel: "in-app",
          metadata: { ticketId: payload.ticketId },
        });
        break;

      case "sla.violated":
        notifications.push({
          title: "SLA Violation",
          body: `An SLA policy has been violated.`,
          channel: "email",
          metadata: { slaId: payload.slaId, ticketId: payload.ticketId },
        });
        break;

      case "payment.success":
        notifications.push({
          title: "Payment Successful",
          body: `Your payment of ${payload.amount ?? "unknown"} has been processed.`,
          channel: "email",
          metadata: { paymentId: payload.paymentId },
        });
        break;

      case "payment.failed":
        notifications.push({
          title: "Payment Failed",
          body: `Your payment could not be processed. Please update your payment method.`,
          channel: "email",
          metadata: { paymentId: payload.paymentId },
        });
        break;

      case "order.created":
        notifications.push({
          title: "Order Created",
          body: `Your order has been placed successfully.`,
          channel: "in-app",
          metadata: { orderId: payload.orderId },
        });
        break;

      case "order.paid":
        notifications.push({
          title: "Order Paid",
          body: `Your order has been paid.`,
          channel: "in-app",
          metadata: { orderId: payload.orderId },
        });
        break;

      case "order.cancelled":
        notifications.push({
          title: "Order Cancelled",
          body: `Your order has been cancelled.`,
          channel: "in-app",
          metadata: { orderId: payload.orderId },
        });
        break;

      case "subscription.created":
      case "subscription.cancelled":
        notifications.push({
          title: `Subscription ${event.type.split(".").pop()}`,
          body: `Your subscription has been ${event.type.split(".").pop()}.`,
          channel: "email",
          metadata: { subscriptionId: payload.subscriptionId },
        });
        break;

      case "credits.low":
        notifications.push({
          title: "Credits Running Low",
          body: `Your credit balance is running low. Consider purchasing more.`,
          channel: "in-app",
          metadata: { balance: payload.balance },
        });
        break;

      case "credits.exhausted":
        notifications.push({
          title: "Credits Exhausted",
          body: `Your credits have been exhausted. Please purchase more to continue.`,
          channel: "email",
          metadata: { balance: payload.balance },
        });
        break;

      default:
        break;
    }

    return notifications;
  }

  private async dispatchNotification(
    notification: NotificationPayload,
    sourceEvent: Event
  ): Promise<void> {
    logger.info("Dispatching notification", {
      title: notification.title,
      channel: notification.channel,
      sourceEventId: sourceEvent.id,
      sourceEventType: sourceEvent.type,
    });

    if (notification.channel === "email" && notification.recipientEmail) {
      await this.sendEmail(notification.recipientEmail, notification.title, notification.body);
    }

    if (notification.channel === "in-app") {
      await this.sendInApp(notification);
    }

    await this.publisher.publishApplicationEvent("notification.dispatched", {
      title: notification.title,
      body: notification.body,
      channel: notification.channel,
      sourceEventType: sourceEvent.type,
      sourceEventId: sourceEvent.id,
      metadata: notification.metadata,
    });
  }

  private async sendEmail(to: string, subject: string, body: string): Promise<void> {
    logger.info("Sending email notification", { to, subject });
  }

  private async sendInApp(notification: NotificationPayload): Promise<void> {
    logger.info("Sending in-app notification", { title: notification.title });
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
    logger.info("NotificationSubscriber destroyed");
  }
}

let notificationSubscriberInstance: NotificationSubscriber | null = null;

export function getNotificationSubscriber(): NotificationSubscriber {
  if (!notificationSubscriberInstance) {
    notificationSubscriberInstance = new NotificationSubscriber();
  }
  return notificationSubscriberInstance;
}

export function resetNotificationSubscriber(): void {
  if (notificationSubscriberInstance) {
    notificationSubscriberInstance.destroy();
    notificationSubscriberInstance = null;
  }
}
