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

    let regionProfile = null;
    try {
      const { regionService } = await import("@/core/localization/region.service");
      regionProfile = country
        ? await regionService.getProfileByCountry(country)
        : await regionService.getDefaultProfile();
    } catch {
      regionProfile = null;
    }

    const whereClause = regionProfile?.pricingProfile
      ? eq(landingSection.sectionKey, "pricing")
      : eq(landingSection.sectionKey, "pricing");

    const section = await db.select().from(landingSection).where(whereClause).limit(1);

    if (!section || section.length === 0) {
      return NextResponse.json({ success: true, data: { plans: [] } });
    }

    const config = (section[0].config ?? {}) as Record<string, unknown>;
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

    return NextResponse.json({ success: true, data: { plans } });
  } catch (error) {
    console.error("[GET /api/landing/subscription] Error:", error);
    return NextResponse.json({ success: true, data: { plans: [] } });
  }
}