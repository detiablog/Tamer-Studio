import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { dramaStudioService } from "@/core/drama-studio/drama-studio.service";

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
    const searchParams = request.nextUrl.searchParams;
    const episodeId = searchParams.get("episodeId");
    if (!episodeId) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "episodeId is required"), { status: 400 });
    }

    const result = await dramaStudioService.listScenes(episodeId, {
      page: Number(searchParams.get("page")) || undefined,
      limit: Number(searchParams.get("limit")) || undefined,
    });
    return NextResponse.json(successResponse(result));
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
    const body = await request.json();
    if (!body.episodeId) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "episodeId is required"), { status: 400 });
    }

    const scene = await dramaStudioService.createScene({
      episodeId: body.episodeId,
      order: body.order,
      title: body.title,
      description: body.description,
      dialogue: body.dialogue,
      narration: body.narration,
      locationId: body.locationId,
      characters: body.characters,
      cameraDirection: body.cameraDirection,
      transition: body.transition,
      duration: body.duration,
      emotion: body.emotion,
      metadata: body.metadata,
    });
    return NextResponse.json(successResponse(scene), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
