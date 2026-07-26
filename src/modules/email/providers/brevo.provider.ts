import { BrevoClient } from "@getbrevo/brevo";
import type { EmailProvider, EmailMessage, EmailResult, EmailProviderConfig, EmailProviderHealth, ProviderType, ProviderStatus } from "../email.interface";
import { decrypt } from "../email.encryption";
import { emailLogger } from "../email.logger";

export interface BrevoCredentials {
  apiKey: string;
}

export class BrevoProvider implements EmailProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType = "brevo";
  readonly status: ProviderStatus;
  readonly isActive: boolean;
  readonly priority: number;
  config: EmailProviderConfig;

  private credentials: BrevoCredentials | null = null;
  private client: BrevoClient | null = null;

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

  private decryptCredentials(credentials: Record<string, unknown>): BrevoCredentials {
    const apiKey = typeof credentials.apiKey === "string" ? decrypt(credentials.apiKey) : "";
    return { apiKey };
  }

  private initializeClient(): void {
    if (!this.credentials) {
      throw new Error("Brevo credentials not initialized");
    }

    this.client = new BrevoClient({ apiKey: this.credentials.apiKey });
    emailLogger.info("Brevo client initialized", { provider: this.id });
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      if (!this.client) {
        throw new Error("Brevo client not initialized");
      }

      const from = message.from ?? `${this.config.senderName} <${this.config.senderEmail}>`;
      const replyTo = message.replyTo ?? this.config.replyTo;

      const mailData: Record<string, unknown> = {
        sender: { email: this.config.senderEmail, name: this.config.senderName },
        to: [{ email: message.to }],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
        replyTo: replyTo ? { email: replyTo } : undefined,
        headers: message.headers,
      };

      emailLogger.info("Sending Brevo email", {
        provider: this.id,
        recipient: message.to,
      });

      const startTime = Date.now();
      const result = await this.client.transactionalEmails.sendTransacEmail(mailData);
      const latencyMs = Date.now() - startTime;

      const messageId = result.messageId ?? result.messageIds?.[0];

      emailLogger.info("Brevo email sent successfully", {
        provider: this.id,
        messageId,
        recipient: message.to,
        latencyMs,
      });

      return {
        success: true,
        messageId,
        provider: this.id,
        metadata: { messageId },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown Brevo error";
      emailLogger.error("Brevo send failed", error instanceof Error ? error : undefined, {
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
        subject: "Brevo Validation Test",
        text: "This is a validation test email.",
      };

      const sendResult = await this.send(testMessage);
      if (!sendResult.success) {
        return { success: false, error: sendResult.error };
      }

      emailLogger.info("Brevo provider validated successfully", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Validation failed";
      emailLogger.error("Brevo validation failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.client) {
        throw new Error("Brevo client not initialized");
      }

      await this.client.account.getAccount();
      emailLogger.info("Brevo connection verified", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection test failed";
      emailLogger.error("Brevo connection test failed", error instanceof Error ? error : undefined, {
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

      const account = await this.client.account.getAccount();
      const plan = account.plan as { emails?: { limit?: number; used?: number } } | undefined;
      const total = plan?.emails?.limit ?? 0;
      const used = plan?.emails?.used ?? 0;

      return { used, total };
    } catch (error) {
      emailLogger.warn("Brevo quota check failed", {
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
  return new BrevoProvider(params);
}
