import { logger } from "@/core/logger/logger";

export type EmailLogLevel = "debug" | "info" | "warn" | "error";

export interface EmailLogContext extends Record<string, unknown> {
  messageId?: string;
  provider?: string;
  recipient?: string;
  type?: string;
  attempt?: number;
  latencyMs?: number;
  error?: string;
  tokenId?: string;
  templateId?: string;
  queueId?: string;
  email?: string;
  token?: string;
  mode?: string;
  providerCount?: number;
}

export class EmailLogger {
  debug(message: string, context?: EmailLogContext): void {
    logger.debug(`[Email] ${message}`, context);
  }

  info(message: string, context?: EmailLogContext): void {
    logger.info(`[Email] ${message}`, context);
  }

  warn(message: string, context?: EmailLogContext): void {
    logger.warn(`[Email] ${message}`, context);
  }

  error(message: string, error?: Error, context?: EmailLogContext): void {
    logger.error(`[Email] ${message}`, error, context);
  }

  audit(action: string, context?: Record<string, unknown>): void {
    logger.audit(`[EmailAudit] ${action}`, context);
  }
}

export const emailLogger = new EmailLogger();
