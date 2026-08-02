import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { NotificationRepository } from "@/core/notifications/notification.repository";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse, errorResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const repository = new NotificationRepository();

const ListNotificationsSchema = z.object({
  limit: z.string().default("20"),
  offset: z.string().default("0"),
  unreadOnly: z.string().optional(),
});

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
    const session = ctx.state.adminSession;
    if (!session?.adminId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const notifications = await repository.getByUser(session.adminId, {
      status: unreadOnly ? "queued" : undefined,
      limit,
      offset,
    });

    const stats = await repository.getStats(session.adminId);

    return NextResponse.json(paginatedResponse(
      notifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        category: n.category,
        status: n.status,
        priority: n.priority,
        createdAt: n.createdAt,
        read: n.status === "read" || n.status === "archived",
      })),
      stats.total,
      offset / limit + 1,
      limit
    ));
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

  const middlewareError = await runMiddleware([adminAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const session = ctx.state.adminSession;
    if (!session?.adminId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, id } = body;

    if (!id || !action) {
      return NextResponse.json(errorResponse("BAD_REQUEST", "Missing id or action"), { status: 400 });
    }

    const allowedActions = ["read", "archive", "delete"];
    if (!allowedActions.includes(action)) {
      return NextResponse.json(errorResponse("BAD_REQUEST", "Invalid action"), { status: 400 });
    }

    let notification;
    switch (action) {
      case "read":
        notification = await repository.markAsRead(session.adminId, id);
        break;
      case "archive":
        notification = await repository.archive(session.adminId, id);
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