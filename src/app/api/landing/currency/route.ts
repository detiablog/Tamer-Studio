import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { regionService } from "@/core/localization/region.service";
import { currencyService } from "@/lib/currency/service";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const country =
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country") ||
      cookieStore.get("tamer_country")?.value ||
      null;

    let profile = null;
    try {
      profile = country
        ? await regionService.getProfileByCountry(country)
        : await regionService.getDefaultProfile();
    } catch {
      profile = null;
    }

    if (!profile) {
      return NextResponse.json({
        success: true,
        data: {
          code: "USD",
          name: "US Dollar",
          symbol: "$",
          locale: "en-US",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          exchangeRateToUsd: 1,
          source: "fallback",
        },
      });
    }

    let currencyProfile = null;
    try {
      currencyProfile = await currencyService.getProfile(profile.currency);
    } catch {
      currencyProfile = null;
    }

    return NextResponse.json({
      success: true,
      data: {
        code: currencyProfile?.code ?? profile.currency ?? "USD",
        name: currencyProfile?.name ?? profile.currency ?? "US Dollar",
        symbol: currencyProfile?.symbol ?? "$",
        locale: currencyProfile?.locale ?? "en-US",
        minimumFractionDigits: currencyProfile?.minimumFractionDigits ?? 2,
        maximumFractionDigits: currencyProfile?.maximumFractionDigits ?? 2,
        exchangeRateToUsd: currencyProfile?.exchangeRateToUsd ?? 1,
        source: "business-engine",
      },
    });
  } catch (error) {
    console.error("[GET /api/landing/currency] Error:", error);
    return NextResponse.json(
      {
        success: true,
        data: {
          code: "USD",
          name: "US Dollar",
          symbol: "$",
          locale: "en-US",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          exchangeRateToUsd: 1,
          source: "fallback",
        },
      },
      { status: 200 }
    );
  }
}