import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db";
import { performanceReport } from "@/lib/db/schema/performance";
import { desc } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

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

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:read")], ctx);
  if (errorResponse) return errorResponse;

  try {
    const reports = await db.select().from(performanceReport).orderBy(desc(performanceReport.createdAt)).limit(50);
    return NextResponse.json(successResponse({ reports }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(request: NextRequest) {
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
    method: "POST",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:write")], ctx);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { name, scores, recommendations, metadata } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "name is required" } }, { status: 422 });
    }

    const id = generateId("prpt");
    const [report] = await db.insert(performanceReport).values({
      id,
      name,
      scores: scores || {},
      recommendations: recommendations || [],
      metadata: metadata || {},
    }).returning();

    return NextResponse.json(successResponse({ report }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
