import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withApiAuth } from "@/core/api-platform/api-auth-middleware";
import { videoStudioService } from "@/core/video-studio/video-studio.service";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request, "read:assets");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const userId = auth.keyRecord.userId;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const result = await videoStudioService.listGenerations(userId, { page, limit });
    return NextResponse.json(successResponse(result));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await withApiAuth(request, "generate:video");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const userId = auth.keyRecord.userId;
    const body = await request.json();
    const result = await videoStudioService.createGeneration({
      userId,
      prompt: body.prompt,
      negativePrompt: body.negativePrompt,
      type: body.type,
      style: body.style,
      aspectRatio: body.aspectRatio,
      resolution: body.resolution,
      frameRate: body.frameRate,
      duration: body.duration,
      quality: body.quality,
      seed: body.seed,
      model: body.model,
      provider: body.provider,
      projectId: body.projectId,
      storyboardId: body.storyboardId,
      sceneId: body.sceneId,
      referenceImage: body.referenceImage,
      referenceVideo: body.referenceVideo,
    });
    return NextResponse.json(successResponse(result, "Video generation started"), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
