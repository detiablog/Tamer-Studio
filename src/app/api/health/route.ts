import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SystemService } from "@/core/admin/system/system.service";
import { metrics } from "@/core/observability/metrics";

export async function GET() {
  const systemService = new SystemService();
  const dbHealth = await systemService.checkDatabaseHealth();

  const health: Record<string, { status: string; latencyMs?: number }> = {
    database: dbHealth,
  };

  const overallChecks: string[] = [];
  if (dbHealth.status !== "healthy") {
    overallChecks.push("database");
  }

  const status = overallChecks.length === 0 ? "healthy" : "degraded";
  const statusCode = status === "healthy" ? 200 : 503;

  return NextResponse.json(
    {
      status,
      checks: health,
      system: metrics.getSystemMetrics(),
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}
