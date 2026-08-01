import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withApiAuth } from "@/core/api-platform/api-auth-middleware";
import { assetManagementService } from "@/core/assets/asset-management.service";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request, "read:assets");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const kind = url.searchParams.get("kind") || undefined;
    const result = await assetManagementService.list({ userId: auth.keyRecord.userId, page, limit, kind });
    return NextResponse.json(successResponse(result));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await withApiAuth(request, "write:assets");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const body = await request.json();
    const result = await assetManagementService.create({
      kind: body.kind,
      metadata: body.metadata,
      tags: body.tags,
      createdBy: auth.keyRecord.userId,
    });
    return NextResponse.json(successResponse(result, "Asset uploaded"), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
