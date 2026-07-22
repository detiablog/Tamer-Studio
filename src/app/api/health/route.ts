import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { metrics } from "@/core/observability/metrics";
import { logger } from "@/core/logger";
import { sql } from "drizzle-orm";

export async function GET() {
  const health: Record<string, { status: string; latencyMs?: number }> = {};
  const overallChecks: string[] = [];

  const dbStart = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    health.database = { status: "healthy", latencyMs: Date.now() - dbStart };
  } catch (error) {
    health.database = { status: "unhealthy" };
    logger.error("Health check: database unreachable", error instanceof Error ? error : undefined);
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
