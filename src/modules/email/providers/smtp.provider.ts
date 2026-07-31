import nodemailer from "nodemailer";
import type { EmailProvider, EmailMessage, EmailResult, EmailProviderConfig, EmailProviderHealth, ProviderType, ProviderStatus } from "../email.interface";
import { decrypt } from "../email.encryption";
import { emailLogger } from "../email.logger";

export interface SmtpProviderCredentials {
  host: string;
  port: number;
  secure: boolean;
  username?: string;
  password?: string;
}

export class SmtpProvider implements EmailProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType = "smtp";
  readonly status: ProviderStatus;
  readonly isActive: boolean;
  readonly priority: number;
  config: EmailProviderConfig;

  private transporter: nodemailer.Transporter | null = null;
  private credentials: SmtpProviderCredentials | null = null;

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
  }

  private decryptCredentials(credentials: Record<string, unknown>): SmtpProviderCredentials {
    const host = typeof credentials.host === "string" ? credentials.host : "";
    const port = typeof credentials.port === "string" ? parseInt(credentials.port, 10) : typeof credentials.port === "number" ? credentials.port : 587;
    const secure = credentials.secure === true || credentials.secure === "true";
    const username = typeof credentials.username === "string" ? credentials.username : undefined;
    const password = typeof credentials.password === "string" ? credentials.password : undefined;

    return { host, port, secure, username, password };
  }

  private buildTransporter(): nodemailer.Transporter {
    if (!this.credentials) {
      throw new Error("SMTP credentials not initialized");
    }

    this.transporter = nodemailer.createTransport({
      host: this.credentials.host,
      port: this.credentials.port,
      secure: this.credentials.secure,
      auth: this.credentials.username && this.credentials.password
        ? { user: this.credentials.username, pass: this.credentials.password }
        : undefined,
      connectionTimeout: this.config.timeout ?? 10000,
      greetingTimeout: this.config.timeout ?? 10000,
      socketTimeout: this.config.timeout ?? 10000,
    });

    return this.transporter;
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      const transporter = this.transporter ?? this.buildTransporter();
      const from = message.from ?? `${this.config.senderName} <${this.config.senderEmail}>`;
      const replyTo = message.replyTo ?? this.config.replyTo;

      const mailOptions: nodemailer.SendMailOptions = {
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

      emailLogger.info("Sending SMTP email", {
        provider: this.id,
        recipient: message.to,
      });

      const startTime = Date.now();
      const info = await transporter.sendMail(mailOptions);
      const latencyMs = Date.now() - startTime;

      emailLogger.info("SMTP email sent successfully", {
        provider: this.id,
        messageId: info.messageId,
        recipient: message.to,
        latencyMs,
      });

      return {
        success: true,
        messageId: info.messageId,
        provider: this.id,
        metadata: { response: info.response, envelope: info.envelope },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown SMTP error";
      emailLogger.error("SMTP send failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        recipient: message.to,
        error: errorMessage,
      });

      return {
        success: false,
        provider: this.id,
        error: errorMessage,
      };
    }
  }

  async validate(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.testConnection();
      if (!result.success) {
        return { success: false, error: result.error };
      }

      const testMessage: EmailMessage = {
        to: this.config.senderEmail,
        subject: "SMTP Validation Test",
        text: "This is a validation test email.",
      };

      const sendResult = await this.send(testMessage);
      if (!sendResult.success) {
        return { success: false, error: sendResult.error };
      }

      emailLogger.info("SMTP provider validated successfully", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Validation failed";
      emailLogger.error("SMTP validation failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const transporter = this.transporter ?? this.buildTransporter();
      await transporter.verify();

      emailLogger.info("SMTP connection verified", { provider: this.id });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection test failed";
      emailLogger.error("SMTP connection test failed", error instanceof Error ? error : undefined, {
        provider: this.id,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async getQuota(): Promise<{ used: number; total: number }> {
    return { used: 0, total: 0 };
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
  return new SmtpProvider(params);
}
