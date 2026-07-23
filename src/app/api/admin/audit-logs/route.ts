import { NextRequest, NextResponse } from "next/server";
import type { AuditQuery } from "@/core/audit/audit.types";
import { queryAuditLog } from "@/core/audit/audit.repository";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query: AuditQuery = {};

  if (searchParams.has("action")) {
    query.action = searchParams.get("action") as any;
  }
  if (searchParams.has("actorId")) {
    query.actorId = searchParams.get("actorId")!;
  }
  if (searchParams.has("resourceType")) {
    query.resourceType = searchParams.get("resourceType")!;
  }
  if (searchParams.has("limit")) {
    query.limit = parseInt(searchParams.get("limit")!);
  }
  if (searchParams.has("offset")) {
    query.offset = parseInt(searchParams.get("offset")!);
  }

  const entries = await queryAuditLog(query);
  return NextResponse.json({ entries });
}
