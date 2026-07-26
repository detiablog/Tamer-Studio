import { SESClient, SendEmailCommand, GetSendQuotaCommand, ListIdentitiesCommand } from "@aws-sdk/client-ses";
import type { EmailProvider, EmailMessage, EmailResult, EmailProviderConfig, EmailProviderHealth, ProviderType, ProviderStatus } from "../email.interface";
import { decrypt } from "../email.encryption";
import { emailLogger } from "../email.logger";

export interface AmazonCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export class AmazonProvider implements EmailProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType = "amazon";
  readonly status: ProviderStatus;
  readonly isActive: boolean;
  readonly priority: number;
  config: EmailProviderConfig;

  private credentials: AmazonCredentials | null = null;
  private client: SESClient | null = null;

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

  private decryptCredentials(credentials: Record<string, unknown>): AmazonCredentials {
    const accessKeyId = typeof credentials.accessKeyId === "string" ? decrypt(credentials.accessKeyId) : "";
    const secretAccessKey = typeof credentials.secretAccessKey === "string" ? decrypt(credentials.secretAccessKey) : "";
    const region = typeof credentials.region === "string" ? decrypt(credentials.region) : "us-east-1";

    return { accessKeyId, secretAccessKey, region };
  }

  private initializeClient(): void {
    if (!this.credentials) {
      throw new Error("Amazon SES credentials not initialized");
    }

    this.client = new SESClient({
      region: this.credentials.region,
      credentials: {
        accessKeyId: this.credentials.accessKeyId,
        secretAccessKey: this.credentials.secretAccessKey,
      },
    });

    emailLogger.info("Amazon SES client initialized", { provider: this.id });
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      if (!this.client) {
        throw new Error("Amazon SES client not initialized");
      }

      const from = message.from ?? this.config.senderEmail;
      const replyTo = message.replyTo ?? this.config.replyTo;

      const params = {
        Source: from,
        Destination: {
          ToAddresses: [message.to],
          CcAddresses: message.cc ?? [],
          BccAddresses: message.bcc ?? [],
        },
        Message: {
          Subject: { Data: message.subject, Charset: "UTF-8" },
          Body: {
            Html: message.html ? { Data: message.html, Charset: "UTF-8" } : undefined,
            Text: message.text ? { Data: message.text, Charset: "UTF-8" } : undefined,
          },
        },
        ReplyToAddresses: replyTo ? [replyTo] : undefined,
        Tags: message.headers
          ? Object.entries(message.headers).map(([name, value]) => ({ Name: name, Value: value }))
          : undefined,
      };

      emailLogger.info("Sending Amazon SES email", {
        provider: this.id,
        recipient: message.to,
      });

      const startTime = Date.now();
      const command = new SendEmailCommand(params);
      const response = await this.client.send(command);
      const latencyMs = Date.now() - startTime;

      emailLogger.info("Amazon SES email sent successfully", {
        provider: this.id,
        messageId: response.MessageId,
        recipient: message.to,
        latencyMs,
      });

      return {
        success: true,
        messageId: response.MessageId,
        provider: this.id,
        metadata: { messageId: response.MessageId },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown Amazon SES error";
      emailLogger.error("Amazon SES send failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        recipient: message.to,
        error: errorMessage,
      });

      return { success: false, provider: this.id, error: errorMessage };
    }
  }

  async validate(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.testConnection();
      if (!result.success) {
        return { success: false, error: result.error };
      }

      const quotaResult = await this.getQuota();
      if (quotaResult.total > 0) {
        emailLogger.info("Amazon SES provider validated successfully", { provider: this.id });
        return { success: true };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Validation failed";
      emailLogger.error("Amazon SES validation failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.client) {
        throw new Error("Amazon SES client not initialized");
      }

      const command = new ListIdentitiesCommand({});
      await this.client.send(command);

      emailLogger.info("Amazon SES connection verified", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection test failed";
      emailLogger.error("Amazon SES connection test failed", error instanceof Error ? error : undefined, {
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

      const command = new GetSendQuotaCommand({});
      const response = await this.client.send(command);

      const used = Number(response.SentLast24Hours ?? 0);
      const total = Number(response.Max24HourSend ?? 0);

      return { used, total };
    } catch (error) {
      emailLogger.warn("Amazon SES quota check failed", {
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
  return new AmazonProvider(params);
}
