import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { NotificationRepository } from "@/core/notifications";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication, csrfMiddleware } from "@/core/middleware";

const repository = new NotificationRepository();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  try {
    const body = await request.json().catch(() => ({}));
    const action = typeof body.action === "string" ? body.action : undefined;
    const userId = ctx.state.userSession?.userId;

    const allowedActions = ["read", "archive", "delete"];
    if (!action || !allowedActions.includes(action)) {
      return NextResponse.json({ error: "valid action is required (read|archive|delete)" }, { status: 400 });
    }

    const { id } = await params;
    const notification = await repository.getById(id);
    if (!notification || notification.userId !== userId) {
      return NextResponse.json({ error: "notification not found" }, { status: 404 });
    }

    let updated;
    if (action === "read") {
      updated = await repository.markAsRead(id, userId);
    } else if (action === "archive") {
      updated = await repository.archive(id, userId);
    } else if (action === "delete") {
      await repository.softDelete(id);
      updated = notification;
    }

    return NextResponse.json({ notification: updated });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}
