import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { FeatureFlagsService } from "@/core/admin/feature-flags";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const CreateFlagSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  rollout: z.string().optional(),
  enabled: z.boolean().optional(),
  scope: z.enum(["global", "workspace", "user"]).optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
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

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:read")], ctx);
  if (errorResponse) return errorResponse;

  try {
    const service = new FeatureFlagsService();
    const flags = await service.listFlags();
    return NextResponse.json(successResponse(flags));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(request: NextRequest) {
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
    method: "POST",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:write")], ctx);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const parsed = CreateFlagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }

    const session = ctx.state.adminSession;
    const adminId = session?.adminId || "system";

    const service = new FeatureFlagsService();
    const flag = await service.createFlag(
      {
        key: parsed.data.key,
        description: parsed.data.description || "",
        enabled: parsed.data.enabled ?? parsed.data.status !== "Disabled",
        scope: parsed.data.scope || "global",
        rolloutPercentage: parsed.data.rolloutPercentage,
      },
      adminId
    );

    return NextResponse.json(successResponse(flag));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
