import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { errorResponse } from "@/app/api/mappers/response";
import { storageEngine } from "@/core/storage/storage-engine";

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

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const file = await storageEngine.getFile(id);
    if (!file) {
      return NextResponse.json(errorResponse("NOT_FOUND", "File not found"), { status: 404 });
    }
    const buffer = await storageEngine.download(id);
    if (!buffer) {
      return NextResponse.json(errorResponse("NOT_FOUND", "File content not found"), { status: 404 });
    }
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${file.originalName}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
