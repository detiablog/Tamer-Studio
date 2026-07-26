import { Client } from "postmark";
import type { EmailProvider, EmailMessage, EmailResult, EmailProviderConfig, EmailProviderHealth, ProviderType, ProviderStatus } from "../email.interface";
import { decrypt } from "../email.encryption";
import { emailLogger } from "../email.logger";

export interface PostmarkCredentials {
  serverToken: string;
}

export class PostmarkProvider implements EmailProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType = "postmark";
  readonly status: ProviderStatus;
  readonly isActive: boolean;
  readonly priority: number;
  config: EmailProviderConfig;

  private credentials: PostmarkCredentials | null = null;
  private client: Client | null = null;

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

  private decryptCredentials(credentials: Record<string, unknown>): PostmarkCredentials {
    const serverToken = typeof credentials.serverToken === "string" ? decrypt(credentials.serverToken) : "";
    return { serverToken };
  }

  private initializeClient(): void {
    if (!this.credentials) {
      throw new Error("Postmark credentials not initialized");
    }

    this.client = new Client(this.credentials.serverToken);
    emailLogger.info("Postmark client initialized", { provider: this.id });
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      if (!this.client) {
        throw new Error("Postmark client not initialized");
      }

      const from = message.from ?? this.config.senderEmail;
      const replyTo = message.replyTo ?? this.config.replyTo;

      const mailData: Record<string, unknown> = {
        From: from,
        To: message.to,
        Subject: message.subject,
        HtmlBody: message.html,
        TextBody: message.text,
        ReplyTo: replyTo,
        Cc: message.cc?.join(", "),
        Bcc: message.bcc?.join(", "),
        Headers: message.headers,
      };

      emailLogger.info("Sending Postmark email", {
        provider: this.id,
        recipient: message.to,
      });

      const startTime = Date.now();
      // @ts-expect-error - Postmark SDK type mismatch
      const result = await this.client.sendEmail(mailData);
      const latencyMs = Date.now() - startTime;

      emailLogger.info("Postmark email sent successfully", {
        provider: this.id,
        messageId: result.MessageID,
        recipient: message.to,
        latencyMs,
      });

      return {
        success: true,
        messageId: result.MessageID,
        provider: this.id,
        metadata: { messageId: result.MessageID, errorCode: result.ErrorCode },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown Postmark error";
      emailLogger.error("Postmark send failed", error instanceof Error ? error : undefined, {
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
        subject: "Postmark Validation Test",
        text: "This is a validation test email.",
      };

      const sendResult = await this.send(testMessage);
      if (!sendResult.success) {
        return { success: false, error: sendResult.error };
      }

      emailLogger.info("Postmark provider validated successfully", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Validation failed";
      emailLogger.error("Postmark validation failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.client) {
        throw new Error("Postmark client not initialized");
      }

      await this.client.getServer();
      emailLogger.info("Postmark connection verified", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection test failed";
      emailLogger.error("Postmark connection test failed", error instanceof Error ? error : undefined, {
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

      const server = await this.client.getServer();
      const sent = Number((server as unknown as Record<string, unknown>).SentCount ?? 0);
      const limit = Number((server as unknown as Record<string, unknown>).MaxSentCount ?? 0);

      return { used: sent, total: limit };
    } catch (error) {
      emailLogger.warn("Postmark quota check failed", {
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
  return new PostmarkProvider(params);
}
