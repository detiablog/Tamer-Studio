import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { loadTestService } from "@/core/scaling/load-test.service";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

export async function POST(
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
    method: "POST",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponseMw = await runMiddleware([
    adminAuthentication(),
    requireAdminPermission("admin:write"),
  ], ctx);

  if (errorResponseMw) {
    return errorResponseMw;
  }

  try {
    const { id } = await params;
    const test = await loadTestService.getTest(id);
    if (!test) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Load test not found"), { status: 404 });
    }
    if (test.status === "running") {
      return NextResponse.json(errorResponse("CONFLICT", "Load test is already running"), { status: 409 });
    }
    const started = await loadTestService.startTest(id);
    return NextResponse.json(successResponse(started));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
