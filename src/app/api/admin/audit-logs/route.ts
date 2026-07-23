import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { AuditQuery } from "@/core/audit/audit.types";
import { queryAuditLog } from "@/core/audit/audit.repository";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";

export async function GET(request: NextRequest) {
  const ctx: RequestContext = {
    request,
    params: {},
    state: {
      rateLimit: undefined,
      origin: undefined,
      adminSession: undefined,
      userSession: undefined,
      authError: undefined,
      permissionError: undefined,
      csrfError: undefined,
      rateLimitError: undefined,
      auditContext: undefined,
    },
    method: "GET",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([
    adminAuthentication(),
    requireAdminPermission("admin:audit_logs"),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

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
