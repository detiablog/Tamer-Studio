import { NextRequest, NextResponse } from "next/server";
import { recordProductionMetric, recordUserActivity } from "@/core/analytics/aggregation";

/**
 * Webhook endpoint for production completion
 * Called by production worker/queue system when a production finishes
 * Can be triggered by: Trigger.dev, Bull Queue, Custom Workers, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      productionId,
      workspaceId,
      userId,
      status,
      aiModel,
      inputTokens,
      outputTokens,
      costUsd,
      executionTimeMs,
      metadata,
    } = body;

    // Validate required fields
    const required = ["productionId", "workspaceId", "userId", "status"];
    const missing = required.filter((field) => !body[field]);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // Record production metric
    const metricResult = await recordProductionMetric({
      productionId,
      workspaceId,
      status,
      aiModel,
      inputTokens,
      outputTokens,
      costUsd,
      executionTimeMs,
      metadata,
    });

    // Record user activity
    const activityResult = await recordUserActivity({
      userId,
      workspaceId,
      action: status === "completed" ? "production_completed" : "production_failed",
      resourceId: productionId,
      resourceType: "production",
    });

    console.log(`[Production Webhook] Recorded metrics for production ${productionId}`, {
      status,
      cost: costUsd,
      time: executionTimeMs,
    });

    return NextResponse.json({
      success: true,
      message: "Production metrics recorded successfully",
      data: {
        metric: metricResult,
        activity: activityResult,
      },
    });
  } catch (error) {
    console.error("Production webhook error:", error);
    return NextResponse.json(
      {
        error: "Failed to record production metrics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
