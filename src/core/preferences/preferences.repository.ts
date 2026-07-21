import { db } from "@/lib/db";
import { notificationPreference } from "@/lib/db/schema/notification";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export class NotificationPreferencesRepository {
  async getByUser(userId: string) {
    return db.select().from(notificationPreference).where(eq(notificationPreference.userId, userId));
  }

  async upsert(userId: string, channel: string, category: string, enabled: boolean) {
    const existing = await db
      .select()
      .from(notificationPreference)
      .where(and(eq(notificationPreference.userId, userId), eq(notificationPreference.channel, channel), eq(notificationPreference.category, category)))
      .limit(1);

    const now = new Date();
    if (existing.length > 0) {
      await db
        .update(notificationPreference)
        .set({ enabled, updatedAt: now })
        .where(eq(notificationPreference.id, existing[0].id));
      return { ...existing[0], enabled, updatedAt: now };
    }

    const row = {
      id: `notif_pref_${randomUUID()}`,
      userId,
      channel,
      category,
      enabled,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(notificationPreference).values(row);
    return row;
  }
}
