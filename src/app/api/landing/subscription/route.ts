import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { LandingService } from "@/core/landing/landing.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const country =
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country") ||
      cookieStore.get("tamer_country")?.value ||
      null;

    let regionProfile = null;
    try {
      const { regionService } = await import("@/core/localization/region.service");
      regionProfile = country
        ? await regionService.getProfileByCountry(country)
        : await regionService.getDefaultProfile();
    } catch {
      regionProfile = null;
    }

    const service = new LandingService();
    const whereClause = regionProfile?.pricingProfile
      ? { sectionKey: "pricing" }
      : { sectionKey: "pricing" };

    const section = await service.getSectionByKey("pricing");

    if (!section) {
      return NextResponse.json(successResponse({ data: { plans: [] } }));
    }

    const config = (section.config ?? {}) as Record<string, unknown>;
    const plans = (config.plans as Array<{
      id: string;
      name: string;
      price: number | null;
      currency: string;
      billingCycle: string;
      features: string[];
      cta: string;
      href: string;
      popular?: boolean;
      topUp?: boolean;
      campaignBadge?: string;
    }>) || [];

    return NextResponse.json(successResponse({ data: { plans } }));
  } catch (error) {
    return NextResponse.json(successResponse({ data: { plans: [] } }));
  }
}
