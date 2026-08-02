import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema/billing";
import { z } from "zod";

const UpdateSubscriptionSchema = z.object({
  status: z.string().min(1).optional(),
  planId: z.string().min(1).optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  currentPeriodStart: z.string().datetime().optional(),
  currentPeriodEnd: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:commerce")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const [row] = await db.select().from(subscription).where(eq(subscription.id, id)).limit(1);

    if (!row) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Subscription not found"), { status: 404 });
    }

    return NextResponse.json(successResponse(row));
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:commerce")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateSubscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Invalid input", { fieldErrors: parsed.error.flatten().fieldErrors }), { status: 422 });
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "No fields to update"), { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    const { currentPeriodStart, currentPeriodEnd, ...rest } = parsed.data;

    Object.assign(updateData, rest);

    if (currentPeriodStart !== undefined) {
      updateData.currentPeriodStart = new Date(currentPeriodStart);
    }
    if (currentPeriodEnd !== undefined) {
      updateData.currentPeriodEnd = new Date(currentPeriodEnd);
    }

    const [updated] = await db
      .update(subscription)
      .set(updateData)
      .where(eq(subscription.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Subscription not found"), { status: 404 });
    }

    return NextResponse.json(successResponse(updated));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function DELETE(
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
    method: "DELETE",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:commerce")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const [deleted] = await db.delete(subscription).where(eq(subscription.id, id)).returning();

    if (!deleted) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Subscription not found"), { status: 404 });
    }

    return NextResponse.json(successResponse({ message: "Subscription deleted successfully" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
