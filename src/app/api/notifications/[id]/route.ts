import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication, csrfMiddleware } from "@/core/middleware";
import { NotificationRepository } from "@/core/notifications/notification.repository";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const repository = new NotificationRepository();

const UpdateNotificationSchema = z.object({
  action: z.enum(["read", "archive", "delete"]),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const ctx: RequestContext = {
    request,
    params: resolvedParams,
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
    csrfMiddleware(),
  ], ctx);

  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = UpdateNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Invalid input", { fieldErrors: parsed.error.flatten().fieldErrors }),
        { status: 422 }
      );
    }

    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    let notification;
    switch (parsed.data.action) {
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