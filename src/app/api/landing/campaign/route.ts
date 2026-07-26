import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { landingSection } from "@/lib/db/schema/landing";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

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

    const section = await db
      .select()
      .from(landingSection)
      .where(eq(landingSection.sectionKey, "campaign-banner"))
      .limit(1);

    if (!section || section.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const config = (section[0].config ?? {}) as Record<string, unknown>;
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
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        sectionKey: section[0].sectionKey,
        title: section[0].title,
        description: section[0].description,
        badge: (config.badge as string) || "Campaign",
        ctaText: (config.ctaText as string) || "Claim Now",
        ctaHref: (config.ctaHref as string) || "/register",
        discount,
        countdownEnd,
        visible,
      },
    });
  } catch (error) {
    console.error("[GET /api/landing/campaign] Error:", error);
    return NextResponse.json({ success: true, data: null });
  }
}