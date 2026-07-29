import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { adminLocalizationService } from "@/core/localization/admin.service";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { logAdminAction } from "@/core/admin/audit";
import { logger } from "@/core/logger";

const CreateCurrencySchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  symbol: z.string().min(1).max(20),
  locale: z.string().min(1).max(20),
  minimumFractionDigits: z.number().int().default(2),
  maximumFractionDigits: z.number().int().default(2),
  exchangeRateToUsd: z.string().default("1"),
});

function getAdminFromContext(ctx: RequestContext) {
  return ctx.state.adminSession;
}

export async function GET(request: NextRequest) {
  const ctx: RequestContext = {
    request, params: {},
    state: { rateLimit: undefined, origin: undefined, adminSession: undefined, userSession: undefined, authError: undefined, permissionError: undefined, csrfError: undefined, rateLimitError: undefined, auditContext: undefined },
    method: "GET", pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };
  const middlewareError = await runMiddleware([adminAuthentication()], ctx);
  if (middlewareError) return middlewareError;
  try {
    const currencies = await adminLocalizationService.getCurrencyProfiles();
    return NextResponse.json({
      success: true,
      data: currencies,
      count: currencies.length,
    });
  } catch (error) {
    logger.error("[API /admin/localization/currencies] Error:", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: "Failed to fetch currencies", details: String(error) },
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
    const parsed = CreateCurrencySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors?.code?.[0] || "Invalid input" },
        { status: 400 }
      );
    }

    const currency = await adminLocalizationService.upsertCurrencyProfile(parsed.data);

    const admin = getAdminFromContext(ctx);
    if (admin?.adminId) {
      logAdminAction("settings.updated", admin.adminId, {
        currencyId: currency.id,
        code: currency.code,
        name: currency.name,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: currency,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create currency", details: String(error) },
      { status: 500 }
    );
  }
}
