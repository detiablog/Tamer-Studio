import { type NextRequest, NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { MediaService } from "@/core/media/media.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";

const mediaService = new MediaService();

function buildContext(request: NextRequest, method: string): RequestContext {
  return {
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
    method,
    pathname: request.nextUrl.pathname,
    ip:
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      undefined,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const ctx = buildContext(request, "GET");
  ctx.params = resolvedParams;

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "AUTHENTICATION_ERROR", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const media = await mediaService.getById(resolvedParams.id);
    if (!media) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Media not found" } },
        { status: 404 }
      );
    }

    if (media.userId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    return NextResponse.json(successResponse(media));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const ctx = buildContext(request, "DELETE");
  ctx.params = resolvedParams;

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "AUTHENTICATION_ERROR", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    await mediaService.delete(userId, resolvedParams.id);
    return NextResponse.json(successResponse({ id: resolvedParams.id }, "Media deleted successfully"));
  } catch (error) {
    if (error instanceof Error && error.message === "Media not found") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Media not found" } },
        { status: 404 }
      );
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }
    return mapErrorToResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const ctx = buildContext(request, "PUT");
  ctx.params = resolvedParams;

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "AUTHENTICATION_ERROR", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filename } = body;

    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "filename is required" } },
        { status: 422 }
      );
    }

    const updated = await mediaService.updateMetadata(resolvedParams.id, userId, { filename });
    if (!updated) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Media not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse(updated, "Media updated successfully"));
  } catch (error) {
    if (error instanceof Error && error.message === "Media not found") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Media not found" } },
        { status: 404 }
      );
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }
    return mapErrorToResponse(error);
  }
}
