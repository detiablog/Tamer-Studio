import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const runtime = {
    status: "healthy",
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: Math.round(process.uptime()),
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
    },
    cpu: process.cpuUsage(),
    env: process.env.NODE_ENV || "development",
  };
  return NextResponse.json(runtime);
}
