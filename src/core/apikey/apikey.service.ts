import type { ApiKey, CreateApiKeyInput, RotateApiKeyInput, ApiKeyValidationResult } from "./apikey.types";
import { ApiKeyRepository } from "./apikey.repository";
import { logAction } from "@/core/audit";

export class ApiKeyService {
  private repository = new ApiKeyRepository();

  async createApiKey(input: CreateApiKeyInput): Promise<ApiKey & { rawKey: string }> {
    const result = await this.repository.createApiKey(input);
    logAction("apikey.created", undefined, undefined, { apiKeyId: result.id, userId: input.userId, workspaceId: input.workspaceId });
    return result;
  }

  async revokeApiKey(apiKeyId: string): Promise<void> {
    await this.repository.revokeApiKey(apiKeyId);
    logAction("apikey.revoked", undefined, undefined, { apiKeyId });
  }

  async rotateApiKey(input: RotateApiKeyInput): Promise<ApiKey & { rawKey: string }> {
    const result = await this.repository.rotateApiKey(input);
    logAction("apikey.rotated", undefined, undefined, { apiKeyId: input.apiKeyId });
    return result;
  }

  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    return this.repository.getUserApiKeys(userId);
  }

  async getWorkspaceApiKeys(workspaceId: string): Promise<ApiKey[]> {
    return this.repository.getWorkspaceApiKeys(workspaceId);
  }

  async validateKey(keyHash: string): Promise<ApiKeyValidationResult> {
    return this.repository.validateKey(keyHash);
  }

  async recordUsage(apiKeyId: string): Promise<void> {
    return this.repository.recordUsage(apiKeyId);
  }
}
