import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { securitySettingsService } from "@/core/security-hub/settings.service";

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

  const middlewareError = await runMiddleware([adminAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const settings = await securitySettingsService.getSettings();
    return NextResponse.json(successResponse(settings));
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

  const middlewareError = await runMiddleware([adminAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const updated = await securitySettingsService.upsertSettings({
      bruteForceProtection: body.bruteForceProtection,
      maxLoginAttempts: body.maxLoginAttempts,
      lockoutDurationMinutes: body.lockoutDurationMinutes,
      sessionTimeoutMinutes: body.sessionTimeoutMinutes,
      maxConcurrentSessions: body.maxConcurrentSessions,
      ipWhitelist: body.ipWhitelist,
      ipBlacklist: body.ipBlacklist,
      uploadMaxSizeMb: body.uploadMaxSizeMb,
      uploadAllowedTypes: body.uploadAllowedTypes,
      rateLimitEnabled: body.rateLimitEnabled,
      cspEnabled: body.cspEnabled,
      hstsEnabled: body.hstsEnabled,
    });
    return NextResponse.json(successResponse(updated));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
