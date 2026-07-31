import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db";
import { deployment } from "@/lib/db/schema/devops";
import { eq, desc, sql } from "drizzle-orm";
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
    const environment = url.searchParams.get("environment") || undefined;
    const status = url.searchParams.get("status") || undefined;

    const conditions = [];
    if (environment) conditions.push(eq(deployment.environment, environment));
    if (status) conditions.push(eq(deployment.status, status));

    const where = conditions.length > 0 ? sql`${conditions[0]}` : undefined;

    const totalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(deployment)
      .where(where);

    const total = totalResult[0]?.count || 0;

    const data = await db
      .select()
      .from(deployment)
      .where(where)
      .orderBy(desc(deployment.createdAt))
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
    const { version, environment, commitSha, commitMessage, branch, metadata } = body;

    if (!version || !environment) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "version and environment are required" } },
        { status: 400 }
      );
    }

    const adminId = ctx.state.adminSession?.adminId;
    const id = generateId("deploy");

    const result = await db.insert(deployment).values({
      id,
      version,
      environment,
      status: "pending",
      commitSha: commitSha || null,
      commitMessage: commitMessage || null,
      branch: branch || null,
      deployedBy: adminId || null,
      metadata: metadata || {},
      startedAt: new Date(),
    }).returning();

    return NextResponse.json(successResponse(result[0]));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
