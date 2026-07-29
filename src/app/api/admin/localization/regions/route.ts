import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { adminLocalizationService } from "@/core/localization/admin.service";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { logAdminAction } from "@/core/admin/audit";
import { logger } from "@/core/logger";

const CreateRegionSchema = z.object({
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(255),
  nativeName: z.string().nullable().optional(),
  profileCode: z.string().min(1),
  priority: z.number().int().default(0),
});

function getAdminFromContext(ctx: RequestContext) {
  return ctx.state.adminSession;
}

export async function GET(request: NextRequest) {
  const ctx: RequestContext = {
    request, params: {},
    state: { rateLimit: undefined, origin: undefined, adminSession: undefined, userSession: undefined, authError: undefined, permissionError: undefined, csrfError: undefined, rateLimitError: undefined, auditContext: undefined },
    method: "GET", pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };
  const middlewareError = await runMiddleware([adminAuthentication()], ctx);
  if (middlewareError) return middlewareError;
  try {
    const regions = await adminLocalizationService.getRegions();
    return NextResponse.json({
      success: true,
      data: regions,
      count: regions.length,
    });
  } catch (error) {
    logger.error("[API /admin/localization/regions] Error:", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: "Failed to fetch regions", details: String(error) },
      { status: 500 }
    );
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

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const parsed = CreateRegionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors?.code?.[0] || "Invalid input" },
        { status: 400 }
      );
    }

    const region = await adminLocalizationService.upsertRegion(parsed.data);

    const admin = getAdminFromContext(ctx);
    if (admin?.adminId) {
      logAdminAction("settings.updated", admin.adminId, {
        regionId: region.id,
        code: region.code,
        name: region.name,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: region,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create region", details: String(error) },
      { status: 500 }
    );
  }
}
