import { NextRequest, NextResponse } from "next/server";
import { recordProductionMetric, recordUserActivity } from "@/core/analytics/aggregation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === "production") {
      await recordProductionMetric(data);
      return NextResponse.json({ success: true });
    }

    if (type === "user-activity") {
      await recordUserActivity(data);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid metric type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Metrics recording error:", error);
    return NextResponse.json(
      { error: "Failed to record metric" },
      { status: 500 }
    );
  }
}
