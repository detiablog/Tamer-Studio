import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withApiAuth } from "@/core/api-platform/api-auth-middleware";
import { imageStudioService } from "@/core/image-studio/image-studio.service";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request, "read:assets");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const userId = auth.keyRecord.userId;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const result = await imageStudioService.listGenerations(userId, { page, limit });
    return NextResponse.json(successResponse(result));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await withApiAuth(request, "generate:image");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const userId = auth.keyRecord.userId;
    const body = await request.json();
    const result = await imageStudioService.createGeneration({
      userId,
      prompt: body.prompt,
      negativePrompt: body.negativePrompt,
      type: body.type,
      style: body.style,
      aspectRatio: body.aspectRatio,
      resolution: body.resolution,
      quality: body.quality,
      seed: body.seed,
      model: body.model,
      provider: body.provider,
      projectId: body.projectId,
    });
    return NextResponse.json(successResponse(result, "Image generation started"), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
