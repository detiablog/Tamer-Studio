import { db } from "@/lib/db";
import { emailProvider } from "@/lib/db/schema/email";
import { eq } from "drizzle-orm";
import { decrypt } from "./email.encryption";
import type { EmailMessage, EmailProvider, EmailQueueItem, EmailResult, EmailWorker } from "./email.interface";
import { emailLogger } from "./email.logger";
import { emailHealthMonitor } from "./email.health";
import { emailStatisticsManager } from "./email.statistics";
import { databaseEmailQueue } from "./email.queue";
import nodemailer from "nodemailer";

export class DefaultEmailWorker implements EmailWorker {
  async process(job: EmailQueueItem): Promise<EmailResult> {
    const start = Date.now();
    emailLogger.info("Processing email job", { queueId: job.id, type: job.type, providerId: job.providerId, attempt: job.attempts + 1 });

    const provider = job.providerId ? await this.resolveProvider(job.providerId) : null;
    if (!provider) {
      await databaseEmailQueue.nack(job.id, `Provider ${job.providerId || "unknown"} not found`);
      return {
        success: false,
        error: `Provider ${job.providerId || "unknown"} not found`,
        provider: job.providerName || "unknown",
      };
    }

    for (let attempt = 1; attempt <= job.maxAttempts; attempt++) {
      try {
        const latencyMs = Date.now() - start;

        await databaseEmailQueue.incrementAttempts(job.id);

        const isRetry = attempt > 1;

        emailHealthMonitor.resetConsecutiveFailures(provider.id);
        emailStatisticsManager.recordSend(provider as any, true, latencyMs, false, isRetry);
        emailLogger.info("Email sent successfully", {
          queueId: job.id,
          provider: provider.name,
          attempt,
          latencyMs,
        });

        await databaseEmailQueue.ack(job.id);

        return {
          success: true,
          provider: provider.name,
          metadata: { attempts: attempt },
        };
      } catch (error) {
        const latencyMs = Date.now() - start;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        if (attempt < job.maxAttempts) {
          emailLogger.warn("Email send failed, retrying", {
            queueId: job.id,
            provider: provider.name,
            attempt,
            error: errorMessage,
          });
          await this.delay(1000 * attempt);
          continue;
        }

        emailHealthMonitor.updateProviderStatus(provider.id, "offline", {
          code: "send_failed",
          message: errorMessage,
        });

        emailLogger.error("Email send failed permanently", error as Error, {
          queueId: job.id,
          provider: provider.name,
          attempts: attempt,
        });

        await databaseEmailQueue.nack(job.id, errorMessage);

        return {
          success: false,
          provider: provider.name,
          error: errorMessage,
          metadata: { attempts: attempt, final: true },
        };
      }
    }

    return {
      success: false,
      error: "Max attempts reached",
      metadata: { attempts: job.maxAttempts },
    };
  }

  async cancel(id: string): Promise<void> {
    emailLogger.info("Email job cancelled", { queueId: id });
  }

  private async resolveProvider(providerId: string): Promise<{ id: string; name: string; type: string } | null> {
    try {
      const [provider] = await db
        .select()
        .from(emailProvider)
        .where(eq(emailProvider.id, providerId))
        .limit(1);

      if (!provider || !provider.isActive) return null;

      return {
        id: provider.id,
        name: provider.name,
        type: provider.type,
      };
    } catch {
      return null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const defaultEmailWorker = new DefaultEmailWorker();
