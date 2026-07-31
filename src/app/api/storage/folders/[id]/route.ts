import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { storageEngine } from "@/core/storage/storage-engine";

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

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const folder = await storageEngine.getFolder(id);
    if (!folder) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Folder not found"), { status: 404 });
    }
    if (folder.userId !== ctx.state.userSession!.userId) {
      return NextResponse.json(errorResponse("FORBIDDEN", "Access denied"), { status: 403 });
    }
    await storageEngine.deleteFolder(id);
    return NextResponse.json(successResponse({ deleted: true }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
