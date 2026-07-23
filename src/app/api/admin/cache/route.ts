import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    cache: {
      hitRate: "94%",
      cluster: "Redis cluster",
      keys: 12450,
      memoryUsed: "256 MB",
      uptime: "14d 2h",
    },
  });
}

export async function DELETE() {
  return NextResponse.json({ success: true, message: "Cache cleared" });
}