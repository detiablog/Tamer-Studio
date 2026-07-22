import type { AIProviderConfig } from "../types";
import { logger } from "@/core/logger";
import { logAction } from "@/core/audit";

const rotationMarkers = new Map<string, boolean>();

export class ProviderCredentialLoader {
  async loadCredentials(providerId: string, providerType: string): Promise<AIProviderConfig> {
    const userProvidedKey = this.resolveUserProvidedKey(providerType);
    const platformKey = this.resolvePlatformKey(providerType);
    const apiKey = userProvidedKey ?? platformKey;

    if (!apiKey) {
      throw new Error(`No API key found for provider ${providerId} of type ${providerType}`);
    }

    const baseUrl = this.resolveBaseUrl(providerType);

    const maskedKey = this.maskSecret(apiKey);
    logger.info("Credentials loaded for provider", { providerId, providerType, maskedApiKey: maskedKey });

    return {
      providerType: providerType as AIProviderConfig["providerType"],
      baseUrl,
      apiKey,
    };
  }

  maskSecret(secret: string): string {
    if (secret.length <= 4) return "***";
    return `***${secret.slice(-4)}`;
  }

  async rotateCredentials(providerId: string): Promise<void> {
    rotationMarkers.set(providerId, true);
    logger.info("Credentials marked for rotation", { providerId });
    await logAction("provider.credentials.rotation.requested", undefined, undefined, { providerId });
  }

  private resolveUserProvidedKey(providerType: string): string | undefined {
    return process.env[`PROVIDER_${providerType.toUpperCase()}_API_KEY`];
  }

  private resolvePlatformKey(providerType: string): string | undefined {
    const platformKeys: Record<string, string> = {
      openai: "OPENAI_API_KEY",
      anthropic: "ANTHROPIC_API_KEY",
      google: "GOOGLE_API_KEY",
      aws: "AWS_API_KEY",
      azure: "AZURE_API_KEY",
    };
    const envKey = platformKeys[providerType.toLowerCase()];
    if (!envKey) return undefined;
    return process.env[envKey];
  }

  private resolveBaseUrl(providerType: string): string | undefined {
    if (providerType === "custom") {
      return process.env["CUSTOM_PROVIDER_BASE_URL"];
    }

    const baseUrls: Record<string, string> = {
      openai: "https://api.openai.com/v1",
      anthropic: "https://api.anthropic.com/v1",
      google: "https://generativelanguage.googleapis.com/v1beta",
      aws: "https://bedrock-runtime.us-east-1.amazonaws.com",
      azure: "https://<resource>.openai.azure.com/openai/deployments",
    };

    return baseUrls[providerType.toLowerCase()] ?? undefined;
  }
}
