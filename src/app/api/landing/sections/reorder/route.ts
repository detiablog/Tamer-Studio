import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { LandingService } from "@/core/landing/landing.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { z } from "zod";
import { logAdminAction } from "@/core/admin/audit";

const ReorderSchema = z.object({
  sections: z.array(
    z.object({
      sectionKey: z.string().min(1),
      order: z.number().int(),
    })
  ).min(1),
});

function getAdminFromContext(ctx: RequestContext) {
  return ctx.state.adminSession;
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
    const body = await request.json();
    const parsed = ReorderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    const service = new LandingService();
    await service.reorderSections(parsed.data.sections);

    const admin = getAdminFromContext(ctx);
    if (admin?.adminId) {
      logAdminAction("landing.sections.reordered", admin.adminId, {
        sections: parsed.data.sections,
      }).catch(() => {});
    }

    return NextResponse.json(successResponse({ message: "Sections reordered successfully" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
