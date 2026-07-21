export type NotificationChannel = "email" | "sms" | "push" | "in_app";
export type NotificationCategory = "system" | "billing" | "ai" | "workflow" | "security" | "marketing";
export type NotificationStatus = "pending" | "queued" | "sent" | "delivered" | "failed" | "read" | "archived" | "deleted";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface CreateNotificationInput {
  userId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  channel: NotificationChannel;
  data?: Record<string, unknown>;
  priority?: NotificationPriority;
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface BroadcastInput {
  category: NotificationCategory;
  title: string;
  message: string;
  channel: NotificationChannel;
  data?: Record<string, unknown>;
  priority?: NotificationPriority;
  userIds?: string[];
  workspaceId?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationDeliveryResult {
  notificationId: string;
  channel: NotificationChannel;
  success: boolean;
  error?: string;
  provider?: string;
}
