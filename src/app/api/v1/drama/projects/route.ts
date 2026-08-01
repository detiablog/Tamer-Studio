import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withApiAuth } from "@/core/api-platform/api-auth-middleware";
import { dramaStudioService } from "@/core/drama-studio/drama-studio.service";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request, "read:projects");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const userId = auth.keyRecord.userId;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const status = url.searchParams.get("status") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const result = await dramaStudioService.listProjects(userId, { page, limit, status, search });
    return NextResponse.json(successResponse(result));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await withApiAuth(request, "write:projects");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const userId = auth.keyRecord.userId;
    const body = await request.json();
    const result = await dramaStudioService.createProject(userId, {
      name: body.name,
      description: body.description,
      genre: body.genre,
      coverImage: body.coverImage,
      metadata: body.metadata,
    });
    return NextResponse.json(successResponse(result, "Project created"), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
