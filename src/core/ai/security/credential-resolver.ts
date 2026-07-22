import type { AIProviderConfig } from "../types/domain";
import { logger } from "@/core/logger";
import { logAction } from "@/core/audit";

export interface ConfigService {
  getSecret(key: string): Promise<string | undefined>;
  getProviderBaseUrl(providerType: string): Promise<string | undefined>;
  setSecret(key: string, value: string): Promise<void>;
}

export interface CredentialResolutionContext {
  workspaceId?: string;
  userId?: string;
}

export interface ResolvedCredentials extends AIProviderConfig {
  maskedApiKey?: string;
}

export interface CredentialResolver {
  resolve(providerId: string, providerType: string, context?: CredentialResolutionContext): Promise<ResolvedCredentials>;
  rotate(providerId: string): Promise<void>;
}

export class DefaultCredentialResolver implements CredentialResolver {
  constructor(private configService: ConfigService) {}

  async resolve(providerId: string, providerType: string, context?: CredentialResolutionContext): Promise<ResolvedCredentials> {
    const workspaceKey = await this.resolveWorkspaceKey(providerType, context?.workspaceId);
    if (workspaceKey) return workspaceKey;

    const userKey = await this.resolveUserBYOK(providerType, context?.userId);
    if (userKey) return userKey;

    const platformKey = await this.resolvePlatformKey(providerType);
    if (platformKey) return platformKey;

    throw new Error(`No API key found for provider ${providerId} of type ${providerType}`);
  }

  async rotate(providerId: string): Promise<void> {
    logger.info("Credentials marked for rotation", { providerId });
    await logAction("provider.credentials.rotation.requested", undefined, undefined, { providerId });
  }

  private async resolveWorkspaceKey(providerType: string, workspaceId?: string): Promise<ResolvedCredentials | undefined> {
    if (!workspaceId) return undefined;
    const key = await this.configService.getSecret(`workspace:${workspaceId}:provider:${providerType}:apikey`);
    if (!key) return undefined;
    const baseUrl = await this.configService.getProviderBaseUrl(providerType);
    return this.buildResolved(providerType, key, baseUrl);
  }

  private async resolveUserBYOK(providerType: string, userId?: string): Promise<ResolvedCredentials | undefined> {
    if (!userId) return undefined;
    const key = await this.configService.getSecret(`user:${userId}:provider:${providerType}:apikey`);
    if (!key) return undefined;
    const baseUrl = await this.configService.getProviderBaseUrl(providerType);
    return this.buildResolved(providerType, key, baseUrl);
  }

  private async resolvePlatformKey(providerType: string): Promise<ResolvedCredentials | undefined> {
    const key = await this.configService.getSecret(`platform:provider:${providerType}:apikey`);
    if (!key) return undefined;
    const baseUrl = await this.configService.getProviderBaseUrl(providerType);
    return this.buildResolved(providerType, key, baseUrl);
  }

  private buildResolved(providerType: string, apiKey: string, baseUrl?: string): ResolvedCredentials {
    const masked = this.maskSecret(apiKey);
    logger.info("Credentials resolved for provider", { providerType, maskedApiKey: masked });
    return {
      providerType,
      apiKey,
      baseUrl,
      maskedApiKey: masked,
    };
  }

  maskSecret(secret: string): string {
    if (secret.length <= 4) return "***";
    return `***${secret.slice(-4)}`;
  }
}
