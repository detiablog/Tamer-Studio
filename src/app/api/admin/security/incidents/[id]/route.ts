import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { db } from "@/lib/db";
import { securityIncident } from "@/lib/db/schema/security";
import { eq } from "drizzle-orm";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

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

  const middlewareError = await runMiddleware([adminAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const [incident] = await db.select().from(securityIncident).where(eq(securityIncident.id, id)).limit(1);

    if (!incident) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Incident not found"), { status: 404 });
    }

    return NextResponse.json(successResponse(incident));
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

  const middlewareError = await runMiddleware([adminAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const body = await request.json();

    const [existing] = await db.select().from(securityIncident).where(eq(securityIncident.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Incident not found"), { status: 404 });
    }

    const session = ctx.state.adminSession;
    const updateData: Record<string, any> = { updatedAt: new Date() };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.severity !== undefined) updateData.severity = body.severity;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.affectedUsers !== undefined) updateData.affectedUsers = body.affectedUsers;
    if (body.affectedServices !== undefined) updateData.affectedServices = body.affectedServices;
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;
    if (body.resolution !== undefined) updateData.resolution = body.resolution;
    if (body.status === "resolved") updateData.resolvedAt = new Date();

    const currentTimeline = (existing.timeline as any[]) || [];
    const newTimelineEntry = {
      timestamp: new Date().toISOString(),
      action: body.status || "updated",
      note: body.note || `Incident ${body.status || "updated"}`,
      admin: session?.adminId || "system",
    };
    updateData.timeline = [...currentTimeline, newTimelineEntry];

    const [updated] = await db.update(securityIncident).set(updateData).where(eq(securityIncident.id, id)).returning();
    return NextResponse.json(successResponse(updated));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
