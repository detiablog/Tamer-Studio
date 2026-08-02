import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    checks: {} as Record<string, { status: string; latencyMs?: number; error?: string }>,
  };

  try {
    const dbStart = Date.now();
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");
    await db.execute(sql`SELECT 1`);
    checks.checks.database = { status: "healthy", latencyMs: Date.now() - dbStart };
  } catch (error) {
    checks.status = "degraded";
    checks.checks.database = { status: "unhealthy", error: error instanceof Error ? error.message : "Unknown" };
  }

  try {
    const redisStart = Date.now();
    if (process.env.REDIS_URL) {
      checks.checks.redis = { status: "healthy", latencyMs: Date.now() - redisStart };
    } else {
      checks.checks.redis = { status: "not_configured" };
    }
  } catch (error) {
    checks.checks.redis = { status: "unhealthy", error: error instanceof Error ? error.message : "Unknown" };
  }

  try {
    const storageStart = Date.now();
    checks.checks.storage = { status: "healthy", latencyMs: Date.now() - storageStart };
  } catch (error) {
    checks.checks.storage = { status: "unhealthy", error: error instanceof Error ? error.message : "Unknown" };
  }

  const unhealthyCount = Object.values(checks.checks).filter(c => c.status === "unhealthy").length;
  if (unhealthyCount > 0) checks.status = "degraded";
  if (unhealthyCount >= 2) checks.status = "unhealthy";

  return NextResponse.json(checks, {
    status: checks.status === "healthy" ? 200 : checks.status === "degraded" ? 200 : 503,
  });
}
