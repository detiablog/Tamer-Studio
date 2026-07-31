import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db";
import { deployment } from "@/lib/db/schema/devops";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx: RequestContext = {
    request,
    params: await params,
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
    const { id } = await params;
    const rows = await db.select().from(deployment).where(eq(deployment.id, id)).limit(1);

    if (!rows.length) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Deployment not found"), { status: 404 });
    }

    return NextResponse.json(successResponse(rows[0]));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx: RequestContext = {
    request,
    params: await params,
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
    method: "PUT",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, metadata } = body;

    const rows = await db.select().from(deployment).where(eq(deployment.id, id)).limit(1);

    if (!rows.length) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Deployment not found"), { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
      if (status === "completed" || status === "failed") {
        updateData.completedAt = new Date();
      }
    }
    if (metadata) updateData.metadata = metadata;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "No fields to update"), { status: 400 });
    }

    const updated = await db.update(deployment).set(updateData).where(eq(deployment.id, id)).returning();
    return NextResponse.json(successResponse(updated[0]));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
