import SparkPost from "sparkpost";
import type { EmailProvider, EmailMessage, EmailResult, EmailProviderConfig, EmailProviderHealth, ProviderType, ProviderStatus } from "../email.interface";
import { decrypt } from "../email.encryption";
import { emailLogger } from "../email.logger";

export interface SparkPostCredentials {
  apiKey: string;
}

export class SparkPostProvider implements EmailProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType = "sparkpost";
  readonly status: ProviderStatus;
  readonly isActive: boolean;
  readonly priority: number;
  config: EmailProviderConfig;

  private credentials: SparkPostCredentials | null = null;
  private client: SparkPost | null = null;

  constructor(params: {
    id: string;
    name: string;
    status: ProviderStatus;
    isActive: boolean;
    priority: number;
    config: EmailProviderConfig;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.status = params.status;
    this.isActive = params.isActive;
    this.priority = params.priority;
    this.config = params.config;
    this.credentials = this.decryptCredentials(params.config.credentials);
    this.initializeClient();
  }

  private decryptCredentials(credentials: Record<string, unknown>): SparkPostCredentials {
    const apiKey = typeof credentials.apiKey === "string" ? decrypt(credentials.apiKey) : "";
    return { apiKey };
  }

  private initializeClient(): void {
    if (!this.credentials) {
      throw new Error("SparkPost credentials not initialized");
    }

    this.client = new SparkPost(this.credentials.apiKey);
    emailLogger.info("SparkPost client initialized", { provider: this.id });
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      if (!this.client) {
        throw new Error("SparkPost client not initialized");
      }

      const from = message.from ?? `${this.config.senderName} <${this.config.senderEmail}>`;
      const replyTo = message.replyTo ?? this.config.replyTo;

      const transmissionData: Record<string, unknown> = {
        content: {
          from: { email: this.config.senderEmail, name: this.config.senderName },
          subject: message.subject,
          html: message.html,
          text: message.text,
          reply_to: replyTo,
          headers: message.headers,
        },
        recipients: [{ address: { email: message.to } }],
      };

      emailLogger.info("Sending SparkPost email", {
        provider: this.id,
        recipient: message.to,
      });

      const startTime = Date.now();
      // @ts-expect-error - SparkPost SDK type mismatch
      const result = await this.client.post("transmissions", transmissionData);
      const latencyMs = Date.now() - startTime;

      const results = (result as { results?: Array<{ id?: string }> }).results ?? [];
      const messageId = results[0]?.id;

      emailLogger.info("SparkPost email sent successfully", {
        provider: this.id,
        messageId,
        recipient: message.to,
        latencyMs,
      });

      return {
        success: true,
        messageId,
        provider: this.id,
        metadata: { totalAccepted: results.length },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown SparkPost error";
      emailLogger.error("SparkPost send failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        recipient: message.to,
        error: errorMessage,
      });

      return { success: false, provider: this.id, error: errorMessage };
    }
  }

  async validate(): Promise<{ success: boolean; error?: string }> {
    try {
      const testMessage: EmailMessage = {
        to: this.config.senderEmail,
        subject: "SparkPost Validation Test",
        text: "This is a validation test email.",
      };

      const sendResult = await this.send(testMessage);
      if (!sendResult.success) {
        return { success: false, error: sendResult.error };
      }

      emailLogger.info("SparkPost provider validated successfully", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Validation failed";
      emailLogger.error("SparkPost validation failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.client) {
        throw new Error("SparkPost client not initialized");
      }

      // @ts-expect-error - SparkPost SDK get path type
      await this.client.get("/api/v1/metrics/delivery/by-domain");
      emailLogger.info("SparkPost connection verified", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection test failed";
      emailLogger.error("SparkPost connection test failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async getQuota(): Promise<{ used: number; total: number }> {
    try {
      if (!this.client) {
        return { used: 0, total: 0 };
      }

      // @ts-expect-error - SparkPost SDK get path type
      const result = await this.client.get("/api/v1/sending/limits");
      const body = result as { results?: { last_domain_sending_limit?: number; last_domain_sending_used?: number } };
      const total = Number(body.results?.last_domain_sending_limit ?? 0);
      const used = Number(body.results?.last_domain_sending_used ?? 0);

      return { used, total };
    } catch (error) {
      emailLogger.warn("SparkPost quota check failed", {
        provider: this.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return { used: 0, total: 0 };
    }
  }

  async healthCheck(): Promise<EmailProviderHealth> {
    const checkedAt = new Date();
    const startTime = Date.now();

    try {
      const connectionResult = await this.testConnection();
      const latencyMs = Date.now() - startTime;

      if (connectionResult.success) {
        return {
          id: `health_${this.id}_${Date.now()}`,
          providerId: this.id,
          status: "healthy",
          latencyMs,
          lastSuccessAt: new Date(),
          consecutiveFailures: 0,
          checkedAt,
        };
      } else {
        return {
          id: `health_${this.id}_${Date.now()}`,
          providerId: this.id,
          status: "offline",
          latencyMs,
          lastFailureAt: new Date(),
          consecutiveFailures: 1,
          errorMessage: connectionResult.error,
          checkedAt,
        };
      }
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Health check failed";

      return {
        id: `health_${this.id}_${Date.now()}`,
        providerId: this.id,
        status: "offline",
        latencyMs,
        lastFailureAt: new Date(),
        consecutiveFailures: 1,
        errorMessage,
        checkedAt,
      };
    }
  }
}

export function createProvider(params: {
  id: string;
  name: string;
  status: ProviderStatus;
  isActive: boolean;
  priority: number;
  config: EmailProviderConfig;
}): EmailProvider {
  return new SparkPostProvider(params);
}
