import sgMail from "@sendgrid/mail";
import type { EmailProvider, EmailMessage, EmailResult, EmailProviderConfig, EmailProviderHealth, ProviderType, ProviderStatus } from "../email.interface";
import { decrypt } from "../email.encryption";
import { emailLogger } from "../email.logger";

export interface SendGridCredentials {
  apiKey: string;
}

export class SendGridProvider implements EmailProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType = "sendgrid";
  readonly status: ProviderStatus;
  readonly isActive: boolean;
  readonly priority: number;
  config: EmailProviderConfig;

  private credentials: SendGridCredentials | null = null;

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

  private decryptCredentials(credentials: Record<string, unknown>): SendGridCredentials {
    const apiKey = typeof credentials.apiKey === "string" ? decrypt(credentials.apiKey) : "";
    return { apiKey };
  }

  private initializeClient(): void {
    if (!this.credentials) {
      throw new Error("SendGrid credentials not initialized");
    }

    (sgMail as unknown as { setApiKey: (key: string) => void }).setApiKey(this.credentials.apiKey);
    emailLogger.info("SendGrid client initialized", { provider: this.id });
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      if (!this.credentials) {
        throw new Error("SendGrid credentials not initialized");
      }

      const from = message.from ?? `${this.config.senderName} <${this.config.senderEmail}>`;
      const replyTo = message.replyTo ?? this.config.replyTo;

      const msg = {
        from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: replyTo ? { email: replyTo } : undefined,
        cc: message.cc,
        bcc: message.bcc,
        headers: message.headers,
      };

      emailLogger.info("Sending SendGrid email", {
        provider: this.id,
        recipient: message.to,
      });

      const startTime = Date.now();
      const [response] = await sgMail.send(msg as sgMail.MailDataRequired);
      const latencyMs = Date.now() - startTime;

      emailLogger.info("SendGrid email sent successfully", {
        provider: this.id,
        messageId: response.headers?.["x-message-id"],
        recipient: message.to,
        latencyMs,
      });

      return {
        success: true,
        messageId: response.headers?.["x-message-id"],
        provider: this.id,
        metadata: { statusCode: response.statusCode },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown SendGrid error";
      emailLogger.error("SendGrid send failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        recipient: message.to,
        error: errorMessage,
      });

      if (error && typeof error === "object" && "response" in error) {
        const response = (error as { response?: { body?: { errors?: Array<{ message?: string }> } } }).response;
        const apiError = response?.body?.errors?.[0]?.message;
        if (apiError) {
          return { success: false, provider: this.id, error: apiError };
        }
      }

      return { success: false, provider: this.id, error: errorMessage };
    }
  }

  async validate(): Promise<{ success: boolean; error?: string }> {
    try {
      const testMessage: EmailMessage = {
        to: this.config.senderEmail,
        subject: "SendGrid Validation Test",
        text: "This is a validation test email.",
      };

      const sendResult = await this.send(testMessage);
      if (!sendResult.success) {
        return { success: false, error: sendResult.error };
      }

      emailLogger.info("SendGrid provider validated successfully", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Validation failed";
      emailLogger.error("SendGrid validation failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await (sgMail as unknown as { client: { request: (opts: { url: string; method: string }) => Promise<unknown> } }).client.request({
        url: "/user/profile",
        method: "GET",
      });

      emailLogger.info("SendGrid connection verified", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection test failed";
      emailLogger.error("SendGrid connection test failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async getQuota(): Promise<{ used: number; total: number }> {
    try {
      const [response] = await (sgMail as unknown as { client: { request: (opts: { url: string; method: string }) => Promise<[unknown, unknown]> } }).client.request({
        url: "/user/credits",
        method: "GET",
      });

      const body = response as { remaining?: string; total?: string } | undefined;
      const remaining = Number.parseInt(body?.remaining ?? "0", 10);
      const total = Number.parseInt(body?.total ?? "0", 10);
      const used = total - remaining;

      return { used, total };
    } catch (error) {
      emailLogger.warn("SendGrid quota check failed", {
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
  return new SendGridProvider(params);
}
