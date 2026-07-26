import { Resend } from "resend";
import type { EmailProvider, EmailMessage, EmailResult, EmailProviderConfig, EmailProviderHealth, ProviderType, ProviderStatus } from "../email.interface";
import { decrypt } from "../email.encryption";
import { emailLogger } from "../email.logger";

export interface ResendCredentials {
  apiKey: string;
}

export class ResendProvider implements EmailProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType = "resend";
  readonly status: ProviderStatus;
  readonly isActive: boolean;
  readonly priority: number;
  config: EmailProviderConfig;

  private credentials: ResendCredentials | null = null;
  private client: Resend | null = null;

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

  private decryptCredentials(credentials: Record<string, unknown>): ResendCredentials {
    const apiKey = typeof credentials.apiKey === "string" ? decrypt(credentials.apiKey) : "";
    return { apiKey };
  }

  private initializeClient(): void {
    if (!this.credentials) {
      throw new Error("Resend credentials not initialized");
    }

    this.client = new Resend(this.credentials.apiKey);
    emailLogger.info("Resend client initialized", { provider: this.id });
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      if (!this.client) {
        throw new Error("Resend client not initialized");
      }

      const from = message.from ?? `${this.config.senderName} <${this.config.senderEmail}>`;
      const replyTo = message.replyTo ?? this.config.replyTo;

      const data: Record<string, unknown> = {
        from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo,
        cc: message.cc,
        bcc: message.bcc,
        headers: message.headers,
      };

      emailLogger.info("Sending Resend email", {
        provider: this.id,
        recipient: message.to,
      });

      const startTime = Date.now();
      const result = await this.client.emails.send(data as never);
      const latencyMs = Date.now() - startTime;

      if ("error" in result && result.error) {
        const errorMessage = result.error.message ?? "Unknown Resend error";
        emailLogger.error("Resend send failed", undefined, {
          provider: this.id,
          recipient: message.to,
          error: errorMessage,
        });
        return { success: false, provider: this.id, error: errorMessage };
      }

      const sendData = result as { data?: { id?: string } };
      emailLogger.info("Resend email sent successfully", {
        provider: this.id,
        messageId: sendData.data?.id,
        recipient: message.to,
        latencyMs,
      });

      return {
        success: true,
        messageId: sendData.data?.id,
        provider: this.id,
        metadata: { statusCode: 202 },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown Resend error";
      emailLogger.error("Resend send failed", error instanceof Error ? error : undefined, {
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
        subject: "Resend Validation Test",
        text: "This is a validation test email.",
      };

      const sendResult = await this.send(testMessage);
      if (!sendResult.success) {
        return { success: false, error: sendResult.error };
      }

      emailLogger.info("Resend provider validated successfully", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Validation failed";
      emailLogger.error("Resend validation failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.client) {
        throw new Error("Resend client not initialized");
      }

      await this.client.domains.list();
      emailLogger.info("Resend connection verified", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection test failed";
      emailLogger.error("Resend connection test failed", error instanceof Error ? error : undefined, {
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

      const result = await this.client.domains.list();
      // @ts-expect-error - Resend SDK type mismatch for domain list
      if (!("data" in result) || !result.data || result.data.length === 0) {
        return { used: 0, total: 0 };
      }

      // @ts-expect-error - Resend SDK type mismatch for domain data
      const domain = result.data[0];
      const used = (domain as { sent?: number }).sent ?? 0;
      const total = (domain as { limit?: number }).limit ?? 0;

      return { used, total };
    } catch (error) {
      emailLogger.warn("Resend quota check failed", {
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
  return new ResendProvider(params);
}
