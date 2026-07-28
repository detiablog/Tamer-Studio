import type { UserProfile, UserPreferences, ExternalIdentity, UpdateUserProfileInput } from "./user.types";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { userProfile, userPreferences, externalIdentity } from "@/lib/db/schema/identity";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export class UserRepository {
  async getAllUsers(): Promise<Array<{ id: string; name: string; email: string; role: string; status: string }>> {
    const rows = await db.select().from(user);
    return rows.map((u) => ({
      id: u.id,
      name: u.name || "Unknown",
      email: u.email,
      role: u.role || "user",
      status: u.status || "pending",
    }));
  }

  async createUser(input: { name: string; email: string; role?: string; status?: string }): Promise<{ id: string; name: string; email: string; role: string; status: string }> {
    const id = `user_${randomUUID()}`;
    const now = new Date();
    const [row] = await db.insert(user).values({
      id,
      name: input.name,
      email: input.email,
      role: input.role || "user",
      status: input.status || "pending",
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
    };
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const rows = await db.select().from(userProfile).where(eq(userProfile.userId, userId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapProfile(rows[0]);
  }

  async getUserByAuthId(authId: string): Promise<{ id: string; email: string; name: string } | undefined> {
    const rows = await db.select().from(user).where(eq(user.id, authId)).limit(1);
    if (rows.length === 0) return undefined;
    return { id: rows[0].id, email: rows[0].email, name: rows[0].name ?? "" };
  }

  async getUserByEmail(email: string): Promise<{ id: string; email: string; name: string } | undefined> {
    const rows = await db.select().from(user).where(eq(user.email, email)).limit(1);
    if (rows.length === 0) return undefined;
    return { id: rows[0].id, email: rows[0].email, name: rows[0].name ?? "" };
  }

  async verifyEmail(userId: string): Promise<void> {
    const now = new Date();
    await db.update(user).set({ emailVerified: true, updatedAt: now }).where(eq(user.id, userId));
  }

  async getPreferences(userId: string): Promise<UserPreferences | undefined> {
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
    const existing = await this.getPreferences(userId);
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

  async getUserById(userId: string): Promise<{ id: string; name: string; email: string; role: string; status: string; emailVerified: boolean; createdAt: Date; updatedAt: Date } | undefined> {
    const rows = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (rows.length === 0) return undefined;
    const u = rows[0];
    return {
      id: u.id,
      name: u.name || "Unknown",
      email: u.email,
      role: u.role || "user",
      status: u.status || "pending",
      emailVerified: u.emailVerified || false,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }

  async updateUser(userId: string, input: Record<string, unknown>): Promise<{ id: string; name: string; email: string; role: string; status: string; emailVerified: boolean; createdAt: Date; updatedAt: Date }> {
    const existing = await this.getUserById(userId);
    if (!existing) throw new Error("User not found");
    const now = new Date();
    const updates: Record<string, unknown> = { updatedAt: now };
    if (input.name !== undefined) updates.name = input.name as string;
    if (input.email !== undefined) updates.email = input.email as string;
    if (input.role !== undefined) updates.role = input.role as string;
    if (input.status !== undefined) updates.status = input.status as string;
    const [row] = await db.update(user).set(updates).where(eq(user.id, userId)).returning();
    return {
      id: row.id,
      name: row.name || "Unknown",
      email: row.email,
      role: row.role || "user",
      status: row.status || "pending",
      emailVerified: row.emailVerified || false,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async deleteUser(userId: string): Promise<boolean> {
    const [row] = await db.delete(user).where(eq(user.id, userId)).returning({ id: user.id });
    return !!row;
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
