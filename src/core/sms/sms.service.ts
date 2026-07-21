import type { SmsMessage, SmsProvider, SmsResult } from "./sms.interface";
import { logger } from "@/core/logger/logger";

export class SmsService {
  private provider: SmsProvider | null;

  constructor(provider?: SmsProvider) {
    this.provider = provider ?? null;
  }

  async send(message: SmsMessage): Promise<SmsResult> {
    if (!this.provider) {
      logger.warn("SMS provider not configured", {
        to: message.to,
        body: message.body.slice(0, 50),
      });
      return {
        success: false,
        error: "No SMS provider configured",
      };
    }

    try {
      const result = await this.provider.send(message);
      logger.info("SMS sent", {
        provider: this.provider.name,
        to: message.to,
        success: result.success,
        messageId: result.messageId,
      });
      return result;
    } catch (error) {
      logger.error("SMS send failed", error as Error, {
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

  async sendBatch(messages: SmsMessage[]): Promise<SmsResult[]> {
    const results: SmsResult[] = [];
    for (const message of messages) {
      results.push(await this.send(message));
    }
    return results;
  }

  async validate(): Promise<boolean> {
    if (!this.provider) {
      logger.warn("SMS provider not configured for validation");
      return false;
    }
    try {
      const isValid = await this.provider.validate();
      logger.info("SMS provider validation", {
        provider: this.provider.name,
        valid: isValid,
      });
      return isValid;
    } catch (error) {
      logger.error("SMS provider validation failed", error as Error, {
        provider: this.provider.name,
      });
      return false;
    }
  }
}
