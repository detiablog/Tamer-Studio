import type { ChannelPreference, NotificationCategory, NotificationChannel, UpdatePreferencesInput, UserNotificationPreferences } from "./preferences.types";
import { logUserAction } from "@/core/audit";
import { NotificationPreferencesRepository } from "./preferences.repository";

const ALL_CHANNELS: NotificationChannel[] = ["email", "push", "sms", "in_app"];
const ALL_CATEGORIES: NotificationCategory[] = ["system", "billing", "ai", "workflow", "security", "marketing"];

export class NotificationPreferencesService {
  private repository = new NotificationPreferencesRepository();

  async getPreferences(userId: string): Promise<UserNotificationPreferences> {
    const rows = await this.repository.getByUser(userId);
    const channels: ChannelPreference[] = [];

    for (const category of ALL_CATEGORIES) {
      for (const channel of ALL_CHANNELS) {
        const existing = rows.find((r) => r.channel === channel && r.category === category);
        channels.push({
          channel,
          category,
          enabled: existing ? existing.enabled : true,
        });
      }
    }

    const updatedAt = rows.length > 0 ? rows[rows.length - 1].updatedAt : new Date();

    return { userId, channels, updatedAt };
  }

  async updatePreference(userId: string, input: UpdatePreferencesInput): Promise<UserNotificationPreferences> {
    await this.repository.upsert(userId, input.channel, input.category, input.enabled);
    await logUserAction("notification.preferences.updated", userId, {
      channel: input.channel,
      category: input.category,
      enabled: input.enabled,
    });
    return this.getPreferences(userId);
  }

  async updateBulk(userId: string, inputs: UpdatePreferencesInput[]): Promise<UserNotificationPreferences> {
    for (const input of inputs) {
      await this.repository.upsert(userId, input.channel, input.category, input.enabled);
    }
    await logUserAction("notification.preferences.updated", userId, { bulk: true, count: inputs.length });
    return this.getPreferences(userId);
  }

  async isChannelEnabled(userId: string, channel: NotificationChannel, category: NotificationCategory): Promise<boolean> {
    const rows = await this.repository.getByUser(userId);
    const existing = rows.find((r) => r.channel === channel && r.category === category);
    return existing ? existing.enabled : true;
  }

  async getEnabledChannels(userId: string, category: NotificationCategory): Promise<NotificationChannel[]> {
    const rows = await this.repository.getByUser(userId);
    return rows
      .filter((r) => r.category === category && r.enabled)
      .map((r) => r.channel as NotificationChannel);
  }
}
