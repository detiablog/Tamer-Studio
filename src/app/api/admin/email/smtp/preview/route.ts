import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { previewTemplate, getTemplates, getSampleVariables } from "@/lib/email/templates";

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

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const key = request.nextUrl.searchParams.get("key");
    const action = request.nextUrl.searchParams.get("action");

    if (action === "list") {
      const templates = getTemplates().map((t) => ({
        key: t.key,
        name: t.name,
        type: t.type,
        subject: t.subject,
        variables: t.variables,
      }));
      return NextResponse.json(successResponse({ templates, sampleVariables: getSampleVariables() }));
    }

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Template key is required" },
        { status: 400 }
      );
    }

    const preview = previewTemplate(key);
    if (!preview) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse(preview));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
