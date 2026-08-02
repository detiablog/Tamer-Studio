import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const start = Date.now();
    const result = await db.execute(sql`SELECT NOW() as time, current_database() as database`);
    const latencyMs = Date.now() - start;
    return NextResponse.json({ status: "healthy", latencyMs, database: result.rows?.[0]?.database, time: result.rows?.[0]?.time });
  } catch (error) {
    return NextResponse.json({ status: "unhealthy", error: error instanceof Error ? error.message : "Unknown" }, { status: 503 });
  }
}
