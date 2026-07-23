import { db } from "@/lib/db";
import {
  productionMetrics,
  userActivityMetrics,
  workspaceMetrics,
} from "@/lib/db/schema/analytics";
import { sql, eq, gte, lte, and, count, sum } from "drizzle-orm";

export async function aggregateDailyMetrics() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate());
    tomorrow.setHours(0, 0, 0, 0);

    // Get unique workspaces with metrics yesterday
    const workspaces = await db
      .selectDistinct({
        workspaceId: productionMetrics.workspaceId,
      })
      .from(productionMetrics)
      .where(
        and(
          gte(productionMetrics.createdAt, yesterday),
          lte(productionMetrics.createdAt, tomorrow)
        )
      );

    for (const { workspaceId } of workspaces) {
      // Production metrics
      const prodMetrics = await db
        .select({
          count: count(),
          succeeded: count(
            sql`CASE WHEN ${productionMetrics.status} = 'completed' THEN 1 END`
          ),
          failed: count(
            sql`CASE WHEN ${productionMetrics.status} = 'failed' THEN 1 END`
          ),
          totalCost: sum(sql`${productionMetrics.costUsd}::numeric`),
          totalTokens: sum(
            sql`(${productionMetrics.inputTokens} + ${productionMetrics.outputTokens})::bigint`
          ),
        })
        .from(productionMetrics)
        .where(
          and(
            eq(productionMetrics.workspaceId, workspaceId),
            gte(productionMetrics.createdAt, yesterday),
            lte(productionMetrics.createdAt, tomorrow)
          )
        );

      // User activity - active users
      const activeUsers = await db
        .selectDistinct({
          userId: userActivityMetrics.userId,
        })
        .from(userActivityMetrics)
        .where(
          and(
            eq(userActivityMetrics.workspaceId, workspaceId),
            gte(userActivityMetrics.createdAt, yesterday),
            lte(userActivityMetrics.createdAt, tomorrow)
          )
        );

      const [pm] = prodMetrics;

      // Insert or update workspace metrics
      await db.insert(workspaceMetrics).values({
        workspaceId,
        date: yesterday,
        productionsRun: pm?.count || 0,
        productionsSucceeded: pm?.succeeded || 0,
        productionsFailed: pm?.failed || 0,
        totalCostUsd: pm?.totalCost?.toString() || "0",
        totalTokensUsed: BigInt(pm?.totalTokens || 0),
        activeUsers: activeUsers.length,
      });

      console.log(
        `Aggregated metrics for workspace ${workspaceId} on ${yesterday.toISOString()}`
      );
    }

    return { success: true, workspacesProcessed: workspaces.length };
  } catch (error) {
    console.error("Daily metrics aggregation failed:", error);
    throw error;
  }
}

// Schedule with Trigger.dev or node-cron
// export async function setupMetricsSchedule() {
//   if (process.env.NODE_ENV === "production") {
//     cron.schedule("0 1 * * *", aggregateDailyMetrics); // 1 AM UTC daily
//   }
// }
