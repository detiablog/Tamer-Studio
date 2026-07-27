import { getTranslation } from "@/lib/localization/translations";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { logger } from "@/core/logger/logger";

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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:read")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get("locale") ?? "en";
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Missing translation key" } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        key,
        locale,
        value: getTranslation(locale, key),
      },
    });
  } catch (error) {
    logger.error("Failed to fetch translation", error as Error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch translation" } },
      { status: 500 }
    );
  }
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const { key, locale, value } = body;

    if (!key || !locale || value === undefined) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Missing required fields" } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        key,
        locale,
        value,
        updated: true,
      },
    });
  } catch (error) {
    logger.error("Failed to update translation", error as Error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update translation" } },
      { status: 500 }
    );
  }
}