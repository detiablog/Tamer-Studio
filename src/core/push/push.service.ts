import type { PushMessage, PushProvider, PushResult } from "./push.interface";
import { logger } from "@/core/logger/logger";

export class PushService {
  private provider: PushProvider | null;

  constructor(provider?: PushProvider) {
    this.provider = provider ?? null;
  }

  async send(message: PushMessage): Promise<PushResult> {
    if (!this.provider) {
      logger.warn("Push provider not configured", {
        userId: message.userId,
        title: message.title,
      });
      return {
        success: false,
        error: "No push provider configured",
      };
    }

    try {
      const result = await this.provider.send(message);
      logger.info("Push notification sent", {
        provider: this.provider.name,
        userId: message.userId,
        success: result.success,
        messageId: result.messageId,
      });
      return result;
    } catch (error) {
      logger.error("Push notification failed", error as Error, {
        userId: message.userId,
        provider: this.provider.name,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        provider: this.provider.name,
      };
    }
  }

  async sendBatch(messages: PushMessage[]): Promise<PushResult[]> {
    const results: PushResult[] = [];
    for (const message of messages) {
      results.push(await this.send(message));
    }
    return results;
  }

  async validate(): Promise<boolean> {
    if (!this.provider) {
      logger.warn("Push provider not configured for validation");
      return false;
    }
    try {
      const isValid = await this.provider.validate();
      logger.info("Push provider validation", {
        provider: this.provider.name,
        valid: isValid,
      });
      return isValid;
    } catch (error) {
      logger.error("Push provider validation failed", error as Error, {
        provider: this.provider.name,
      });
      return false;
    }
  }
}
