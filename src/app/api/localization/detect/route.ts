import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { regionService } from "@/core/localization/region.service";
import { logger } from "@/core/logger";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const country = request.headers.get("cf-ipcountry") ||
                    request.headers.get("x-vercel-ip-country") ||
                    cookieStore.get("tamer_country")?.value ||
                    null;

    const profile = country
      ? await regionService.getProfileByCountry(country)
      : await regionService.getDefaultProfile();

    if (!profile) {
      return NextResponse.json({
        locale: "en",
        currency: "USD",
        country: null,
        timezone: "UTC",
        source: "fallback",
      });
    }

    const region = profile.country ?? country;

    return NextResponse.json({
      locale: profile.locale,
      currency: profile.currency,
      country: region,
      timezone: profile.timezone,
      source: "business-engine",
      supportedCurrencies: profile.supportedCurrencies,
      supportedLanguages: profile.supportedLanguages,
    });
  } catch (error) {
    logger.error("[GET /api/localization/detect] Error:", error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        locale: "en",
        currency: "USD",
        country: null,
        timezone: "UTC",
        source: "fallback",
      }
    );
  }
}
