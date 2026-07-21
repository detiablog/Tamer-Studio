import type { UserProfile, UserPreferences, ExternalIdentity, UpdateUserProfileInput } from "./user.types";
import { db } from "@/lib/db";
import { userProfile, userPreferences, externalIdentity } from "@/lib/db/schema/identity";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export class UserRepository {
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const rows = await db.select().from(userProfile).where(eq(userProfile.userId, userId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapProfile(rows[0]);
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const rows = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapPreferences(rows[0]);
  }

  async getExternalIdentities(userId: string): Promise<ExternalIdentity[]> {
    const rows = await db.select().from(externalIdentity).where(eq(externalIdentity.userId, userId)).orderBy(desc(externalIdentity.linkedAt));
    return rows.map(this.mapExternalIdentity);
  }

  async upsertProfile(userId: string, input: UpdateUserProfileInput): Promise<UserProfile> {
    const existing = await this.getUserProfile(userId);
    const now = new Date();
    if (existing) {
      const updates: Record<string, unknown> = { updatedAt: now };
      if (input.avatar !== undefined) updates.avatar = input.avatar;
      if (input.timezone !== undefined) updates.timezone = input.timezone;
      if (input.language !== undefined) updates.language = input.language;
      if (input.country !== undefined) updates.country = input.country;
      await db.update(userProfile).set(updates).where(eq(userProfile.userId, userId));
      return { ...existing, ...updates } as UserProfile;
    }
    const profile: UserProfile = {
      userId,
      avatar: input.avatar ?? null,
      timezone: input.timezone ?? "UTC",
      language: input.language ?? "en",
      country: input.country ?? null,
      status: "active",
      verificationStatus: "unverified",
      suspendedAt: null,
      suspendedBy: null,
      deletedAt: null,
      deletedBy: null,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(userProfile).values({
      userId,
      avatar: profile.avatar ?? undefined,
      timezone: profile.timezone,
      language: profile.language,
      country: profile.country ?? undefined,
      status: profile.status,
      verificationStatus: profile.verificationStatus,
      suspendedAt: profile.suspendedAt ?? undefined,
      suspendedBy: profile.suspendedBy ?? undefined,
      deletedAt: profile.deletedAt ?? undefined,
      deletedBy: profile.deletedBy ?? undefined,
      createdAt: now,
      updatedAt: now,
    });
    return profile;
  }

  async upsertPreferences(userId: string, preferences: Record<string, unknown>): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(userId);
    const now = new Date();
    if (existing) {
      await db.update(userPreferences).set({ preferences, updatedAt: now }).where(eq(userPreferences.userId, userId));
      return { ...existing, preferences, updatedAt: now };
    }
    const prefs: UserPreferences = {
      userId,
      preferences,
      updatedAt: now,
    };
    await db.insert(userPreferences).values({
      userId,
      preferences,
      updatedAt: now,
    });
    return prefs;
  }

  async upsertExternalIdentity(userId: string, provider: string, providerUserId: string): Promise<ExternalIdentity> {
    const existing = await db.select().from(externalIdentity).where(and(eq(externalIdentity.userId, userId), eq(externalIdentity.provider, provider))).limit(1);
    const now = new Date();
    if (existing.length > 0) {
      await db.update(externalIdentity).set({ providerUserId, linkedAt: now }).where(eq(externalIdentity.id, existing[0].id));
      return { ...existing[0], providerUserId, linkedAt: now };
    }
    const id = `ext_${randomUUID()}`;
    const identity: ExternalIdentity = { id, userId, provider, providerUserId, linkedAt: now };
    await db.insert(externalIdentity).values({ id, userId, provider, providerUserId, linkedAt: now });
    return identity;
  }

  async suspend(userId: string, suspendedBy: string): Promise<void> {
    const now = new Date();
    await db.update(userProfile).set({ status: "suspended", suspendedAt: now, suspendedBy, updatedAt: now }).where(eq(userProfile.userId, userId));
  }

  async softDelete(userId: string, deletedBy: string): Promise<void> {
    const now = new Date();
    await db.update(userProfile).set({ status: "deleted", deletedAt: now, deletedBy, updatedAt: now }).where(eq(userProfile.userId, userId));
  }

  private mapProfile(row: typeof userProfile.$inferSelect): UserProfile {
    return {
      userId: row.userId,
      avatar: row.avatar,
      timezone: row.timezone,
      language: row.language,
      country: row.country,
      status: row.status as UserProfile["status"],
      verificationStatus: row.verificationStatus as UserProfile["verificationStatus"],
      suspendedAt: row.suspendedAt,
      suspendedBy: row.suspendedBy,
      deletedAt: row.deletedAt,
      deletedBy: row.deletedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapPreferences(row: typeof userPreferences.$inferSelect): UserPreferences {
    return {
      userId: row.userId,
      preferences: row.preferences as Record<string, unknown>,
      updatedAt: row.updatedAt,
    };
  }

  private mapExternalIdentity(row: typeof externalIdentity.$inferSelect): ExternalIdentity {
    return {
      id: row.id,
      userId: row.userId,
      provider: row.provider,
      providerUserId: row.providerUserId,
      linkedAt: row.linkedAt,
    };
  }
}
