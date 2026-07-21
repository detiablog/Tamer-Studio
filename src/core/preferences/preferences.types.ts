export type NotificationChannel = "email" | "push" | "sms" | "in_app";
export type NotificationCategory = "system" | "billing" | "ai" | "workflow" | "security" | "marketing";

export interface ChannelPreference {
  channel: NotificationChannel;
  category: NotificationCategory;
  enabled: boolean;
}

export interface UserNotificationPreferences {
  userId: string;
  channels: ChannelPreference[];
  updatedAt: Date;
}

export interface UpdatePreferencesInput {
  channel: NotificationChannel;
  category: NotificationCategory;
  enabled: boolean;
}
