import type { ApiKey, CreateApiKeyInput, RotateApiKeyInput, ApiKeyValidationResult } from "./apikey.types";
import { ApiKeyRepository } from "./apikey.repository";

export class ApiKeyService {
  private repository = new ApiKeyRepository();

  async createApiKey(input: CreateApiKeyInput): Promise<ApiKey & { rawKey: string }> {
    return this.repository.createApiKey(input);
  }

  async revokeApiKey(apiKeyId: string): Promise<void> {
    return this.repository.revokeApiKey(apiKeyId);
  }

  async rotateApiKey(input: RotateApiKeyInput): Promise<ApiKey & { rawKey: string }> {
    return this.repository.rotateApiKey(input);
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
