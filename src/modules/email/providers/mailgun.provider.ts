import Mailgun from "mailgun.js";
import FormData from "form-data";
import type { EmailProvider, EmailMessage, EmailResult, EmailProviderConfig, EmailProviderHealth, ProviderType, ProviderStatus } from "../email.interface";
import { decrypt } from "../email.encryption";
import { emailLogger } from "../email.logger";

export interface MailgunCredentials {
  apiKey: string;
  domain: string;
  region?: string;
}

export class MailgunProvider implements EmailProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType = "mailgun";
  readonly status: ProviderStatus;
  readonly isActive: boolean;
  readonly priority: number;
  config: EmailProviderConfig;

  private credentials: MailgunCredentials | null = null;
  private client: ReturnType<Mailgun["client"]> | null = null;

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

  private decryptCredentials(credentials: Record<string, unknown>): MailgunCredentials {
    const apiKey = typeof credentials.apiKey === "string" ? decrypt(credentials.apiKey) : "";
    const domain = typeof credentials.domain === "string" ? decrypt(credentials.domain) : "";
    const region = typeof credentials.region === "string" ? decrypt(credentials.region) : undefined;

    return { apiKey, domain, region };
  }

  private initializeClient(): void {
    if (!this.credentials) {
      throw new Error("Mailgun credentials not initialized");
    }

    const mailgun = new Mailgun({ FormData: FormData } as never);
    this.client = mailgun.client({ username: "api", key: this.credentials.apiKey });

    emailLogger.info("Mailgun client initialized", { provider: this.id });
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      if (!this.client) {
        throw new Error("Mailgun client not initialized");
      }

      const from = message.from ?? `${this.config.senderName} <${this.config.senderEmail}>`;
      const replyTo = message.replyTo ?? this.config.replyTo;

      const mailData: Record<string, unknown> = {
        from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        "h:Reply-To": replyTo,
        cc: message.cc,
        bcc: message.bcc,
        headers: message.headers,
      };

      emailLogger.info("Sending Mailgun email", {
        provider: this.id,
        recipient: message.to,
      });

      const startTime = Date.now();
      // @ts-expect-error - Mailgun SDK type mismatch
      const result = await this.client.messages.create(this.credentials!.domain, mailData);
      const latencyMs = Date.now() - startTime;

      emailLogger.info("Mailgun email sent successfully", {
        provider: this.id,
        messageId: result.id,
        recipient: message.to,
        latencyMs,
      });

      return {
        success: true,
        messageId: result.id,
        provider: this.id,
        metadata: { id: result.id, message: result.message },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown Mailgun error";
      emailLogger.error("Mailgun send failed", error instanceof Error ? error : undefined, {
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
        subject: "Mailgun Validation Test",
        text: "This is a validation test email.",
      };

      const sendResult = await this.send(testMessage);
      if (!sendResult.success) {
        return { success: false, error: sendResult.error };
      }

      emailLogger.info("Mailgun provider validated successfully", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Validation failed";
      emailLogger.error("Mailgun validation failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.client) {
        throw new Error("Mailgun client not initialized");
      }

      // @ts-expect-error - Mailgun SDK list method type mismatch
      await this.client.messages.list(this.credentials!.domain, { limit: 1 });
      emailLogger.info("Mailgun connection verified", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection test failed";
      emailLogger.error("Mailgun connection test failed", error instanceof Error ? error : undefined, {
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

      // @ts-expect-error - Mailgun SDK stats method type mismatch
      const result = await this.client.stats.get(this.credentials!.domain, { event: "sent", duration: "30d" });
      const stats = result as { stats?: Array<{ time?: { t?: number }; email?: { total?: number } }> } | undefined;
      let used = 0;
      if (stats?.stats && stats.stats.length > 0) {
        used = stats.stats.reduce((sum, stat) => sum + (stat.email?.total ?? 0), 0);
      }

      return { used, total: 0 };
    } catch (error) {
      emailLogger.warn("Mailgun quota check failed", {
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
  return new MailgunProvider(params);
}
