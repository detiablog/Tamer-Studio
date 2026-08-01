import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withApiAuth } from "@/core/api-platform/api-auth-middleware";
import { dramaStudioService } from "@/core/drama-studio/drama-studio.service";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await withApiAuth(request, "read:projects");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const item = await dramaStudioService.getProject(id);
    if (!item || item.userId !== auth.keyRecord.userId) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Project not found" } }, { status: 404 });
    }
    return NextResponse.json(successResponse(item));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
