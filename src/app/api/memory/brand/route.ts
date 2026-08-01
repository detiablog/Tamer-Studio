import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { creativeMemoryService } from "@/core/creative-memory/creative-memory.service";

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

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const profiles = await creativeMemoryService.listBrandProfiles(userId);
    return NextResponse.json(successResponse(profiles));
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

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    if (!body.name) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "name is required"), { status: 400 });
    }

    const profile = await creativeMemoryService.createBrandProfile(userId, {
      name: body.name,
      logo: body.logo,
      primaryColors: body.primaryColors,
      secondaryColors: body.secondaryColors,
      typography: body.typography,
      watermark: body.watermark,
      voice: body.voice,
      tone: body.tone,
      audience: body.audience,
      preferredCta: body.preferredCta,
      preferredPlatforms: body.preferredPlatforms,
      keywords: body.keywords,
      rules: body.rules,
      isActive: body.isActive,
      metadata: body.metadata,
    });
    return NextResponse.json(successResponse(profile), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
