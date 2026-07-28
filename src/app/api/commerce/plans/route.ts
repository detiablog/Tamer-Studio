import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPlans, ensureSeeded } from "@/core/commerce";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

export async function GET(_request: NextRequest) {
  try {
    await ensureSeeded();
    const plans = await getPlans();
    return NextResponse.json(successResponse(plans));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
