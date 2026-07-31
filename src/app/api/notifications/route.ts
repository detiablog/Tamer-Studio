import { NextRequest, NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { NotificationRepository } from "@/core/notifications/notification.repository";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

const repository = new NotificationRepository();

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

  const middlewareError = await runMiddleware([
    userAuthentication(),
  ], ctx);

  if (middlewareError) return middlewareError;

  try {
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }
    const notifications = await repository.getByUser(userId);
    return NextResponse.json(successResponse(notifications));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
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
    method: "PATCH",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([
    userAuthentication(),
  ], ctx);

  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json(errorResponse("BAD_REQUEST", "Missing id or action"), { status: 400 });
    }

    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    let notification;
    switch (action) {
      case "read":
        notification = await repository.markAsRead(id, userId);
        break;
      case "archive":
        notification = await repository.archive(id, userId);
        break;
      case "delete":
        await repository.softDelete(id);
        notification = { id };
        break;
      default:
        return NextResponse.json(errorResponse("BAD_REQUEST", "Invalid action"), { status: 400 });
    }

    return NextResponse.json(successResponse(notification));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}