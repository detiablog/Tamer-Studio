import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { NotificationRepository } from "@/core/notifications/notification.repository";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication, csrfMiddleware } from "@/core/middleware";

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

  const errorResponse = await runMiddleware([
    userAuthentication(),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  const searchParams = request.nextUrl.searchParams;
  const userId = ctx.state.userSession?.userId || "demo-user";
  const filter = searchParams.has("status") ? { status: searchParams.get("status") as any } : undefined;
  const category = searchParams.get("category");

  const notifications = await repository.getByUser(userId, { ...filter, category: category as any });
  return NextResponse.json({ notifications });
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

  const errorResponse = await runMiddleware([
    userAuthentication(),
    csrfMiddleware(),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const action = searchParams.get("action");

  if (!id || !action) {
    return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
  }

  const userId = ctx.state.userSession?.userId || "demo-user";
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
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ notification });
}
