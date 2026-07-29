import cron from "node-cron";
import { aggregateDailyMetrics } from "@/core/analytics/aggregation-cron";
import { logger } from "@/core/logger";

let isScheduled = false;

/**
 * Setup node-cron jobs for metrics aggregation
 * Alternative to Trigger.dev for self-hosted deployments
 * Call this in your Next.js startup code or API route
 */
export function setupMetricsCronJobs() {
  if (isScheduled) {
    logger.info("Cron jobs already scheduled");
    return;
  }

  // Daily aggregation at 1 AM UTC
  // Cron format: minute hour day month day-of-week
  // 0 1 * * * = 1:00 AM UTC every day
  const aggregationJob = cron.schedule("0 1 * * *", async () => {
    logger.info("[Cron] Running daily metrics aggregation...");

    try {
      const result = await aggregateDailyMetrics();
      logger.info("[Cron] Daily metrics aggregation completed", {
        workspacesProcessed: result.workspacesProcessed,
      });
    } catch (error) {
      logger.error("[Cron] Daily metrics aggregation failed", error instanceof Error ? error : undefined);
    }
  });

  // Optional: Hourly health check (verify cron is running)
  const healthCheckJob = cron.schedule("0 * * * *", () => {
    logger.info("[Cron] Health check: Cron jobs are running");
  });

  isScheduled = true;

  logger.info("✅ Cron jobs scheduled:");
  logger.info("  - Daily metrics aggregation: 1 AM UTC");
  logger.info("  - Hourly health check: Every hour");

  return {
    aggregationJob,
    healthCheckJob,
    stop: () => {
      aggregationJob.stop();
      healthCheckJob.stop();
      isScheduled = false;
      logger.info("⏹️  Cron jobs stopped");
    },
  };
}

/**
 * Get aggregation schedule information
 */
export function getMetricsAggregationSchedule() {
  return {
    frequency: "daily",
    time: "1:00 AM UTC",
    timezone: "UTC",
    description: "Aggregates production metrics from the previous day",
    nextRun: getNextRunTime(),
  };
}

/**
 * Calculate next scheduled run time
 */
function getNextRunTime(): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(1, 0, 0, 0);

  // If it's before 1 AM UTC today, schedule for today
  const todayAt1Am = new Date(now);
  todayAt1Am.setUTCHours(1, 0, 0, 0);

  if (now < todayAt1Am) {
    return todayAt1Am;
  }

  return tomorrow;
}

/**
 * Manually trigger metrics aggregation
 * Useful for testing or immediate aggregation
 */
export async function manuallyTriggerAggregation() {
  logger.info("[Manual] Triggering metrics aggregation...");

  try {
    const result = await aggregateDailyMetrics();
    logger.info("[Manual] Metrics aggregation completed", result as unknown as Record<string, unknown>);
    return result;
  } catch (error) {
    logger.error("[Manual] Metrics aggregation failed", error instanceof Error ? error : undefined);
    throw error;
  }
}
