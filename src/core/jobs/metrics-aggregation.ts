import { logger, task } from "@trigger.dev/sdk/v3";
import { aggregateDailyMetrics } from "@/core/analytics/aggregation-cron";

/**
 * Daily Metrics Aggregation Job
 * Runs every day at 1 AM UTC
 * Aggregates production metrics from the previous day into workspace_metrics table
 */
export const dailyMetricsAggregation = task({
  id: "daily-metrics-aggregation",
  run: async () => {
    logger.info("Starting daily metrics aggregation...");

    try {
      const result = await aggregateDailyMetrics();

      logger.info("Metrics aggregation completed", {
        workspacesProcessed: result.workspacesProcessed,
      });

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      logger.error("Daily metrics aggregation failed", {
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  },
});

/**
 * Schedule the daily metrics aggregation
 * Runs at 1 AM UTC every day
 */
export const scheduledAggregation = task({
  id: "scheduled-daily-metrics",
  cron: "0 1 * * *", // 1 AM UTC daily
  run: async () => {
    logger.info("Triggering daily metrics aggregation...");

    try {
      const result = await aggregateDailyMetrics();

      logger.info("Daily metrics aggregation triggered successfully", result);

      return result;
    } catch (error) {
      logger.error("Failed to trigger daily metrics aggregation", {
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  },
});
