import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db";
import { deploymentRelease } from "@/lib/db/schema/devops";
import { desc, sql, eq } from "drizzle-orm";
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:read")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 20;
    const status = url.searchParams.get("status") || undefined;

    const where = status ? eq(deploymentRelease.status, status) : undefined;

    const totalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(deploymentRelease)
      .where(where);

    const total = totalResult[0]?.count || 0;

    const data = await db
      .select()
      .from(deploymentRelease)
      .where(where)
      .orderBy(desc(deploymentRelease.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return NextResponse.json(paginatedResponse(data, total, page, limit));
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const { version, name, description, notes, metadata } = body;

    if (!version || !name) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "version and name are required" } },
        { status: 400 }
      );
    }

    const adminId = ctx.state.adminSession?.adminId;
    const id = generateId("release");

    const result = await db.insert(deploymentRelease).values({
      id,
      version,
      name,
      description: description || null,
      notes: notes || null,
      status: "draft",
      metadata: metadata || {},
      createdBy: adminId || null,
    }).returning();

    return NextResponse.json(successResponse(result[0]));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
