export interface ApiKey {
  id: string;
  userId: string;
  workspaceId: string | null;
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes: string[];
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  usageCount: string;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApiKeyInput {
  userId: string;
  workspaceId?: string | null;
  name: string;
  scopes?: string[];
  expiresInDays?: number | null;
}

export interface RotateApiKeyInput {
  apiKeyId: string;
}

export interface ApiKeyValidationResult {
  valid: boolean;
  apiKey?: ApiKey;
  error?: string;
}
