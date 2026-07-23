import { NextRequest, NextResponse } from "next/server";
import { getMetricsAggregationSchedule, manuallyTriggerAggregation } from "@/core/jobs/cron-setup";

export async function GET(request: NextRequest) {
  try {
    const action = request.nextUrl.searchParams.get("action");

    if (action === "status") {
      // Return cron job status
      const schedule = getMetricsAggregationSchedule();
      return NextResponse.json({
        status: "active",
        schedule,
        message: "Metrics aggregation cron job is active",
      });
    }

    if (action === "trigger") {
      // Manually trigger aggregation (admin only)
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      try {
        const result = await manuallyTriggerAggregation();
        return NextResponse.json({
          success: true,
          message: "Metrics aggregation triggered successfully",
          result,
        });
      } catch (error) {
        return NextResponse.json(
          {
            error: "Failed to trigger metrics aggregation",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    }

    // Default: return schedule info
    const schedule = getMetricsAggregationSchedule();
    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Cron endpoint error:", error);
    return NextResponse.json(
      {
        error: "Cron endpoint error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
