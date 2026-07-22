import { NextResponse } from "next/server";
import { metrics } from "@/core/observability/metrics";

export async function GET() {
  const systemMetrics = metrics.getSystemMetrics();

  return NextResponse.json(
    {
      metrics: systemMetrics,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}