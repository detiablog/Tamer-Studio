import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { trustedDevice } from "@/lib/db/schema/auth";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { z } from "zod";

const DeleteSchema = z.union([
  z.object({ deviceId: z.string().min(1) }),
  z.object({ all: z.literal(true) }),
]);

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

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const userId = ctx.state.userSession!.userId;

    const devices = await db
      .select()
      .from(trustedDevice)
      .where(eq(trustedDevice.userId, userId));

    return NextResponse.json(successResponse({ devices }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
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
    method: "DELETE",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const userId = ctx.state.userSession!.userId;
    const body = await request.json();
    const parsed = DeleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", parsed.error.issues.map((i) => i.message).join("; ")),
        { status: 422 }
      );
    }

    if ("all" in parsed.data && parsed.data.all) {
      await db.delete(trustedDevice).where(eq(trustedDevice.userId, userId));
    } else if ("deviceId" in parsed.data) {
      await db
        .delete(trustedDevice)
        .where(
          and(
            eq(trustedDevice.id, parsed.data.deviceId),
            eq(trustedDevice.userId, userId)
          )
        );
    }

    return NextResponse.json(successResponse({ success: true }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
