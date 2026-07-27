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

    let countryCode = country;
    try {
      const { regionService } = await import("@/core/localization/region.service");
      const profile = country
        ? await regionService.getProfileByCountry(country)
        : await regionService.getDefaultProfile();
      if (profile) {
        countryCode = profile.country || country;
      }
    } catch {
      countryCode = country;
    }

    const service = new LandingService();
    const section = await service.getSectionByKey("campaign-banner");

    if (!section) {
      return NextResponse.json(successResponse({ data: null }));
    }

    const config = (section.config ?? {}) as Record<string, unknown>;
    const discount = (config.discount as number) || 0;
    const countdownEnd = (config.countdownEnd as string) || "";
    const visible = config.visible !== false;

    let isActive = false;
    if (visible && countdownEnd) {
      const end = new Date(countdownEnd).getTime();
      const now = Date.now();
      isActive = end > now;
    } else if (visible) {
      isActive = true;
    }

    if (!isActive) {
      return NextResponse.json(successResponse({ data: null }));
    }

    return NextResponse.json(successResponse({
      data: {
        sectionKey: section.sectionKey,
        title: section.title,
        description: section.description,
        badge: (config.badge as string) || "Campaign",
        ctaText: (config.ctaText as string) || "Claim Now",
        ctaHref: (config.ctaHref as string) || "/register",
        discount,
        countdownEnd,
        visible,
      },
    }));
  } catch (error) {
    return NextResponse.json(successResponse({ data: null }));
  }
}
