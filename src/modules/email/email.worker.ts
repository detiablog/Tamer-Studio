import type { EmailMessage, EmailProvider, EmailQueueItem, EmailResult, EmailWorker } from "./email.interface";
import { emailLogger } from "./email.logger";
import { emailHealthMonitor } from "./email.health";
import { emailStatisticsManager } from "./email.statistics";

export class DefaultEmailWorker implements EmailWorker {
  async process(job: EmailQueueItem): Promise<EmailResult> {
    const start = Date.now();
    emailLogger.info("Processing email job", { queueId: job.id, type: job.type, providerId: job.providerId, attempt: job.attempts + 1 });

    for (let attempt = 1; attempt <= job.maxAttempts; attempt++) {
      const provider = job.providerId ? this.resolveProvider(job.providerId) : null;
      if (!provider) {
        return {
          success: false,
          error: `Provider ${job.providerId || "unknown"} not found`,
          provider: job.providerName || "unknown",
        };
      }

      try {
        const result = await provider.send({
          to: job.to,
          subject: job.subject,
          html: job.html,
          text: job.text,
          from: job.from,
          replyTo: job.replyTo,
          cc: job.cc,
          bcc: job.bcc,
          headers: job.headers,
          metadata: { ...job.metadata, attempt, jobId: job.id },
        });

        const latencyMs = Date.now() - start;
        const isRetry = attempt > 1;

        if (result.success) {
          emailHealthMonitor.resetConsecutiveFailures(provider.id);
          emailStatisticsManager.recordSend(provider, true, latencyMs, false, isRetry);
          emailLogger.info("Email sent successfully", {
            queueId: job.id,
            provider: provider.name,
            messageId: result.messageId,
            attempt,
            latencyMs,
          });
          return { ...result, provider: provider.name };
        }

        const isBounce = result.error?.toLowerCase().includes("bounce");
        if (isBounce) {
          emailStatisticsManager.recordSend(provider, false, latencyMs, true, isRetry);
        } else {
          emailStatisticsManager.recordSend(provider, false, latencyMs, false, isRetry);
        }

        if (attempt < job.maxAttempts) {
          emailLogger.warn("Email send failed, retrying", {
            queueId: job.id,
            provider: provider.name,
            attempt,
            error: result.error,
          });
          await this.delay(1000 * attempt);
          continue;
        }

        emailHealthMonitor.updateProviderStatus(provider.id, "offline", {
          code: "send_failed",
          message: result.error,
        });

        emailLogger.error("Email send failed permanently", undefined, {
          queueId: job.id,
          provider: provider.name,
          attempts: attempt,
          error: result.error,
        });

        return { ...result, provider: provider.name, metadata: { ...result.metadata, final: true, attempts: attempt } };
      } catch (error) {
        const latencyMs = Date.now() - start;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        if (attempt < job.maxAttempts) {
          emailLogger.warn("Email send exception, retrying", {
            queueId: job.id,
            provider: provider.name,
            attempt,
            error: errorMessage,
          });
          await this.delay(1000 * attempt);
          continue;
        }

        emailHealthMonitor.updateProviderStatus(provider.id, "offline", {
          code: "send_exception",
          message: errorMessage,
        });

        emailLogger.error("Email send exception permanently", error as Error, {
          queueId: job.id,
          provider: provider.name,
          attempts: attempt,
        });

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

  private resolveProvider(providerId: string): EmailProvider | null {
    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const defaultEmailWorker = new DefaultEmailWorker();
