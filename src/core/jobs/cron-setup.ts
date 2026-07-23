import cron from "node-cron";
import { aggregateDailyMetrics } from "@/core/analytics/aggregation-cron";

let isScheduled = false;

/**
 * Setup node-cron jobs for metrics aggregation
 * Alternative to Trigger.dev for self-hosted deployments
 * Call this in your Next.js startup code or API route
 */
export function setupMetricsCronJobs() {
  if (isScheduled) {
    console.log("Cron jobs already scheduled");
    return;
  }

  // Daily aggregation at 1 AM UTC
  // Cron format: minute hour day month day-of-week
  // 0 1 * * * = 1:00 AM UTC every day
  const aggregationJob = cron.schedule("0 1 * * *", async () => {
    console.log("[Cron] Running daily metrics aggregation...");

    try {
      const result = await aggregateDailyMetrics();
      console.log("[Cron] Daily metrics aggregation completed", {
        workspacesProcessed: result.workspacesProcessed,
      });
    } catch (error) {
      console.error("[Cron] Daily metrics aggregation failed", error);
    }
  });

  // Optional: Hourly health check (verify cron is running)
  const healthCheckJob = cron.schedule("0 * * * *", () => {
    console.log("[Cron] Health check: Cron jobs are running");
  });

  isScheduled = true;

  console.log("✅ Cron jobs scheduled:");
  console.log("  - Daily metrics aggregation: 1 AM UTC");
  console.log("  - Hourly health check: Every hour");

  return {
    aggregationJob,
    healthCheckJob,
    stop: () => {
      aggregationJob.stop();
      healthCheckJob.stop();
      isScheduled = false;
      console.log("⏹️  Cron jobs stopped");
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
  console.log("[Manual] Triggering metrics aggregation...");

  try {
    const result = await aggregateDailyMetrics();
    console.log("[Manual] Metrics aggregation completed", result);
    return result;
  } catch (error) {
    console.error("[Manual] Metrics aggregation failed", error);
    throw error;
  }
}
