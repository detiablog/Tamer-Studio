import type { UserProfile, UserPreferences, ExternalIdentity, UpdateUserProfileInput } from "./user.types";
import { UserRepository } from "./user.repository";
import { logAction } from "@/core/audit";

export class UserService {
  private repository = new UserRepository();

  async getProfile(userId: string): Promise<UserProfile | undefined> {
    return this.repository.getUserProfile(userId);
  }

  async listUsers(): Promise<Array<{ id: string; name: string; email: string; role: string; status: string }>> {
    return this.repository.getAllUsers();
  }

  async createUser(input: { name: string; email: string; password: string; role?: string; status?: string }): Promise<{ id: string; name: string; email: string; role: string; status: string }> {
    const user = await this.repository.createUser(input);
    logAction("user.created", undefined, undefined, { userId: user.id });
    return user;
  }

  async updateProfile(userId: string, input: UpdateUserProfileInput): Promise<UserProfile> {
    const profile = await this.repository.upsertProfile(userId, input);
    logAction("user.profile.updated", undefined, undefined, {  userId, changes: input  });
    return profile;
  }

  async getPreferences(userId: string): Promise<UserPreferences | undefined> {
    return this.repository.getPreferences(userId);
  }

  async updatePreferences(userId: string, preferences: Record<string, unknown>): Promise<UserPreferences> {
    const result = await this.repository.upsertPreferences(userId, preferences);
    logAction("user.preferences.updated", undefined, undefined, {  userId  });
    return result;
  }

  async getExternalIdentities(userId: string): Promise<ExternalIdentity[]> {
    return this.repository.getExternalIdentities(userId);
  }

  async linkExternalIdentity(userId: string, provider: string, providerUserId: string): Promise<ExternalIdentity> {
    const identity = await this.repository.upsertExternalIdentity(userId, provider, providerUserId);
    logAction("user.external_identity.linked", undefined, undefined, { userId, provider });
    return identity;
  }

  async getUserByEmail(email: string): Promise<{ id: string; email: string; name: string } | undefined> {
    return this.repository.getUserByEmail(email);
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.repository.verifyEmail(userId);
    logAction("user.email.verified", undefined, undefined, { userId });
  }

  async suspend(userId: string, suspendedBy: string): Promise<void> {
    await this.repository.suspend(userId, suspendedBy);
    logAction("user.suspended", undefined, undefined, {  userId, suspendedBy  });
  }

  async softDelete(userId: string, deletedBy: string): Promise<void> {
    await this.repository.softDelete(userId, deletedBy);
    logAction("user.deleted", undefined, undefined, { userId, deletedBy });
  }

  async getUserById(userId: string): Promise<{ id: string; name: string; email: string; role: string; status: string } | undefined> {
    return this.repository.getUserById(userId);
  }

  async updateUser(userId: string, input: Record<string, unknown>, adminSessionToken?: string): Promise<{ id: string; name: string; email: string; role: string; status: string }> {
    const user = await this.repository.updateUser(userId, input, adminSessionToken);
    logAction("user.updated", undefined, undefined, { userId, changes: input });
    return user;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const deleted = await this.repository.deleteUser(userId);
    if (deleted) {
      logAction("user.deleted", undefined, undefined, { userId });
    }
    return deleted;
  }

}
