import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withApiAuth } from "@/core/api-platform/api-auth-middleware";
import { campaignService } from "@/core/campaign/campaign.service";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request, "read:profile");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const status = url.searchParams.get("status") || undefined;
    const result = await campaignService.listCampaigns({ page, limit, status });
    return NextResponse.json(successResponse(result));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await withApiAuth(request, "write:projects");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const body = await request.json();
    const result = await campaignService.createCampaign({
      name: body.name,
      code: body.code,
      type: body.type,
      description: body.description,
      status: body.status,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      config: body.config,
      rules: body.rules,
      targetAudience: body.targetAudience,
      createdBy: auth.keyRecord.userId,
    });
    return NextResponse.json(successResponse(result, "Campaign created"), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
