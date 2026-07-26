import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { currencyService } from "@/lib/currency/service";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { z } from "zod";

const UpdateRatesSchema = z.object({
  rates: z.record(z.string(), z.number()),
});

export async function GET(request: NextRequest) {
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
    method: "GET",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  const profiles = await currencyService.getEnabledProfiles();
  return NextResponse.json({
    success: true,
    data: profiles.map((p) => ({
      code: p.code,
      name: p.name,
      exchangeRateToUsd: p.exchangeRateToUsd,
      isEnabled: p.isEnabled,
    })),
    count: profiles.length,
  });
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
    const parsed = UpdateRatesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid rates payload" },
        { status: 400 }
      );
    }

    const results = await currencyService.updateExchangeRates(parsed.data.rates);

    return NextResponse.json({
      success: true,
      data: results,
      message: "Exchange rates updated",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update exchange rates", details: String(error) },
      { status: 500 }
    );
  }
}
