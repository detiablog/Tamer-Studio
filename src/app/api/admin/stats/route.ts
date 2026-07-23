import { NextResponse } from "next/server";
import { metrics } from "@/core/observability/metrics";
import { healthDashboard } from "@/core/observability/health";
import { jobStore } from "@/core/jobs/job-store";

export async function GET() {
  const systemMetrics = metrics.getSystemMetrics();
  const jobStats = jobStore.getStats();

  return NextResponse.json({
    metrics: systemMetrics,
    jobs: jobStats,
    timestamp: new Date().toISOString(),
  });
}