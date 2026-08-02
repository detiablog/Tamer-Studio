import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db";
import { performanceMetric } from "@/lib/db/schema/performance";
import { eq, desc } from "drizzle-orm";
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
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 200);

    const metrics = category
      ? await db.select().from(performanceMetric).where(eq(performanceMetric.category, category)).orderBy(desc(performanceMetric.recordedAt)).limit(limit)
      : await db.select().from(performanceMetric).orderBy(desc(performanceMetric.recordedAt)).limit(limit);
    return NextResponse.json(successResponse({ metrics }));
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
    const { category, metricName, value, unit, metadata } = body;

    if (!category || !metricName || !value) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "category, metricName, and value are required" } }, { status: 422 });
    }

    const id = generateId("perf");
    const [recorded] = await db.insert(performanceMetric).values({
      id,
      category,
      metricName,
      value,
      unit: unit || null,
      metadata: metadata || {},
    }).returning();

    return NextResponse.json(successResponse({ metric: recorded }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
