import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { videoStudioService } from "@/core/video-studio/video-studio.service";

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
    const storyboardId = searchParams.get("storyboardId");
    if (!storyboardId) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "storyboardId is required"), { status: 400 });
    }

    const result = await videoStudioService.listScenes(storyboardId, {
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
    if (!body.storyboardId || !body.prompt) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "storyboardId and prompt are required"), { status: 400 });
    }

    const scene = await videoStudioService.createScene({
      storyboardId: body.storyboardId,
      order: body.order,
      title: body.title,
      prompt: body.prompt,
      negativePrompt: body.negativePrompt,
      duration: body.duration,
      cameraMotion: body.cameraMotion,
      transition: body.transition,
      characters: body.characters,
      audio: body.audio,
      subtitles: body.subtitles,
      effects: body.effects,
      metadata: body.metadata,
    });
    return NextResponse.json(successResponse(scene), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
