import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { adminLocalizationService } from "@/core/localization/admin.service";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { logAdminAction } from "@/core/admin/audit";

const CreateProfileSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  locale: z.string().min(1).max(20).default("en"),
  currency: z.string().min(1).max(20).default("USD"),
  country: z.string().nullable().optional(),
  timezone: z.string().default("UTC"),
  pricingProfile: z.string().default("default"),
  paymentProfile: z.string().default("default"),
  supportedCurrencies: z.array(z.string()).default(["USD"]),
  supportedLanguages: z.array(z.string()).default(["en"]),
});

function getAdminFromContext(ctx: RequestContext) {
  return ctx.state.adminSession;
}

export async function GET(request: NextRequest) {
  try {
    const profiles = await adminLocalizationService.getProfiles();
    return NextResponse.json({
      success: true,
      data: profiles,
      count: profiles.length,
    });
  } catch (error) {
    console.error("[API /admin/localization/profiles] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch localization profiles", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const ctx: RequestContext = {
    request,
    params: {},
    state: {
      rateLimit: undefined,
      origin: undefined,
      adminSession: undefined,
      userSession: undefined,
      authError: undefined,
      permissionError: undefined,
      csrfError: undefined,
      rateLimitError: undefined,
      auditContext: undefined,
    },
    method: "POST",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const parsed = CreateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors?.code?.[0] || "Invalid input" },
        { status: 400 }
      );
    }

    const existing = await adminLocalizationService.getProfiles();
    const isFirst = existing.length === 0;
    const profile = await adminLocalizationService.upsertProfile({
      ...parsed.data,
      isDefault: isFirst || parsed.data.code === "default",
    });

    const admin = getAdminFromContext(ctx);
    if (admin?.adminId) {
      logAdminAction("settings.updated", admin.adminId, {
        profileId: profile.id,
        code: profile.code,
        name: profile.name,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create profile", details: String(error) },
      { status: 500 }
    );
  }
}
