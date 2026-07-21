import { db } from "@/lib/db";
import { apiKey } from "@/lib/db/schema/identity";
import { eq, desc } from "drizzle-orm";
import type { ApiKey, CreateApiKeyInput, RotateApiKeyInput, ApiKeyValidationResult } from "./apikey.types";
import { randomUUID, createHash } from "crypto";
import { logAction } from "@/core/audit";

export class ApiKeyRepository {
  async getApiKey(apiKeyId: string): Promise<ApiKey | undefined> {
    const rows = await db.select().from(apiKey).where(eq(apiKey.id, apiKeyId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapApiKey(rows[0]);
  }

  async getApiKeyByHash(keyHash: string): Promise<ApiKey | undefined> {
    const rows = await db.select().from(apiKey).where(eq(apiKey.keyHash, keyHash)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapApiKey(rows[0]);
  }

  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    const rows = await db.select().from(apiKey).where(eq(apiKey.userId, userId)).orderBy(desc(apiKey.createdAt));
    return rows.map(this.mapApiKey);
  }

  async getWorkspaceApiKeys(workspaceId: string): Promise<ApiKey[]> {
    const rows = await db.select().from(apiKey).where(eq(apiKey.workspaceId, workspaceId)).orderBy(desc(apiKey.createdAt));
    return rows.map(this.mapApiKey);
  }

  async createApiKey(input: CreateApiKeyInput): Promise<ApiKey & { rawKey: string }> {
    const id = `key_${randomUUID()}`;
    const rawKey = `tamer_${randomUUID()}_${randomUUID()}`;
    const keyHash = createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.slice(0, 8);
    const now = new Date();
    const expiresAt = input.expiresInDays ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000) : null;
    const ak: ApiKey = {
      id,
      userId: input.userId,
      workspaceId: input.workspaceId ?? null,
      name: input.name,
      keyPrefix,
      keyHash,
      scopes: input.scopes ?? [],
      expiresAt,
      lastUsedAt: null,
      usageCount: "0",
      isRevoked: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(apiKey).values({
      id,
      userId: input.userId,
      workspaceId: input.workspaceId ?? undefined,
      name: input.name,
      keyPrefix,
      keyHash,
      scopes: ak.scopes,
      expiresAt,
      lastUsedAt: undefined,
      usageCount: "0",
      isRevoked: false,
      createdAt: now,
      updatedAt: now,
    });
    logAction("apikey.created", undefined, undefined, {  apiKeyId: id, userId: input.userId, workspaceId: input.workspaceId  });
    return { ...ak, rawKey };
  }

  async revokeApiKey(apiKeyId: string): Promise<void> {
    const existing = await this.getApiKey(apiKeyId);
    if (!existing) throw new Error("API key not found");
    await db.update(apiKey).set({ isRevoked: true, updatedAt: new Date() }).where(eq(apiKey.id, apiKeyId));
    logAction("apikey.revoked", undefined, undefined, {  apiKeyId  });
  }

  async rotateApiKey(input: RotateApiKeyInput): Promise<ApiKey & { rawKey: string }> {
    const existing = await this.getApiKey(input.apiKeyId);
    if (!existing) throw new Error("API key not found");
    if (existing.isRevoked) throw new Error("API key is revoked");
    const rawKey = `tamer_${randomUUID()}_${randomUUID()}`;
    const keyHash = createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.slice(0, 8);
    await db.update(apiKey).set({ keyHash, keyPrefix, updatedAt: new Date() }).where(eq(apiKey.id, input.apiKeyId));
    logAction("apikey.rotated", undefined, undefined, {  apiKeyId: input.apiKeyId  });
    return { ...existing, keyHash, keyPrefix, rawKey };
  }

  async recordUsage(apiKeyId: string): Promise<void> {
    const existing = await this.getApiKey(apiKeyId);
    if (!existing) return;
    const usageCount = Number(existing.usageCount) + 1;
    await db.update(apiKey).set({ usageCount: String(usageCount), lastUsedAt: new Date(), updatedAt: new Date() }).where(eq(apiKey.id, apiKeyId));
  }

  async validateKey(keyHash: string): Promise<ApiKeyValidationResult> {
    const key = await this.getApiKeyByHash(keyHash);
    if (!key) return { valid: false, error: "Invalid API key" };
    if (key.isRevoked) return { valid: false, error: "API key is revoked" };
    if (key.expiresAt && key.expiresAt < new Date()) return { valid: false, error: "API key expired" };
    return { valid: true, apiKey: key };
  }

  private mapApiKey(row: typeof apiKey.$inferSelect): ApiKey {
    return {
      id: row.id,
      userId: row.userId,
      workspaceId: row.workspaceId,
      name: row.name,
      keyPrefix: row.keyPrefix,
      keyHash: row.keyHash,
      scopes: row.scopes as string[],
      expiresAt: row.expiresAt,
      lastUsedAt: row.lastUsedAt,
      usageCount: row.usageCount,
      isRevoked: row.isRevoked,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
