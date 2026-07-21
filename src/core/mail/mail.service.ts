import type { MailMessage, MailProvider, MailResult } from "./mail.interface";
import { logger } from "@/core/logger/logger";

export class MailRenderer {
  async renderHtml(
    subject: string,
    body: string,
    variables: Record<string, string>
  ): Promise<{ subject: string; html: string }> {
    const replacedSubject = this.replaceVariables(subject, variables);
    const replacedBody = this.replaceVariables(body, variables);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(replacedSubject)}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; padding: 24px; }
  </style>
</head>
<body>
  <div class="container">
    ${replacedBody}
  </div>
</body>
</html>`;
    return { subject: replacedSubject, html };
  }

  private replaceVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      result = result.replace(regex, this.escapeHtml(value));
    }
    return result;
  }

  private escapeHtml(value: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return value.replace(/[&<>"']/g, (char) => map[char] ?? char);
  }
}

export class MailService {
  private provider: MailProvider | null;
  private renderer: MailRenderer;

  constructor(provider?: MailProvider) {
    this.provider = provider ?? null;
    this.renderer = new MailRenderer();
  }

  async send(message: MailMessage): Promise<MailResult> {
    if (!this.provider) {
      logger.warn("Mail provider not configured", {
        to: message.to,
        subject: message.subject,
      });
      return {
        success: false,
        error: "No mail provider configured",
      };
    }

    try {
      const result = await this.provider.send(message);
      logger.info("Mail sent", {
        provider: this.provider.name,
        to: message.to,
        success: result.success,
        messageId: result.messageId,
      });
      return result;
    } catch (error) {
      logger.error("Mail send failed", error as Error, {
        to: message.to,
        provider: this.provider.name,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        provider: this.provider.name,
      };
    }
  }

  async sendBatch(messages: MailMessage[]): Promise<MailResult[]> {
    const results: MailResult[] = [];
    for (const message of messages) {
      results.push(await this.send(message));
    }
    return results;
  }

  async validate(): Promise<boolean> {
    if (!this.provider) {
      logger.warn("Mail provider not configured for validation");
      return false;
    }
    try {
      const isValid = await this.provider.validate();
      logger.info("Mail provider validation", {
        provider: this.provider.name,
        valid: isValid,
      });
      return isValid;
    } catch (error) {
      logger.error("Mail provider validation failed", error as Error, {
        provider: this.provider.name,
      });
      return false;
    }
  }

  getRenderer(): MailRenderer {
    return this.renderer;
  }
}
