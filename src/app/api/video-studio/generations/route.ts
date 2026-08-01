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
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const isFavoriteStr = searchParams.get("isFavorite");
    const result = await videoStudioService.listGenerations(userId, {
      projectId: searchParams.get("projectId") || undefined,
      storyboardId: searchParams.get("storyboardId") || undefined,
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      isFavorite: isFavoriteStr !== null ? isFavoriteStr === "true" : undefined,
      search: searchParams.get("search") || undefined,
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
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    if (!body.prompt) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "prompt is required"), { status: 400 });
    }

    const generation = await videoStudioService.createGeneration({
      userId,
      projectId: body.projectId,
      storyboardId: body.storyboardId,
      sceneId: body.sceneId,
      type: body.type,
      prompt: body.prompt,
      negativePrompt: body.negativePrompt,
      style: body.style,
      aspectRatio: body.aspectRatio,
      resolution: body.resolution,
      frameRate: body.frameRate,
      duration: body.duration,
      quality: body.quality,
      seed: body.seed,
      model: body.model,
      provider: body.provider,
      referenceImage: body.referenceImage,
      referenceVideo: body.referenceVideo,
    });
    return NextResponse.json(successResponse(generation), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
