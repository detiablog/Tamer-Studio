import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { cookies } from "next/headers";
import { resolveCurrencyInfo } from "@/lib/currency/formatter";

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

  const middlewareError = await runMiddleware([
    userAuthentication(),
  ], ctx);

  if (middlewareError) return middlewareError;

  const cookieStore = await cookies();
  const locale = cookieStore.get("tamer_locale")?.value || "en";
  const currency = cookieStore.get("tamer_currency")?.value || "USD";
  const info = resolveCurrencyInfo(currency, null);

  const fmt = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: info.minimumFractionDigits,
      maximumFractionDigits: info.maximumFractionDigits,
    }).format(amount);

  return NextResponse.json(successResponse({
    plan: "Pro",
    nextInvoice: fmt(49.0),
    nextInvoiceDate: "Nov 1, 2026",
    paymentMethod: "•••• 4242",
    paymentExpiry: "12/27",
    creditsRemaining: 8432,
    creditsValue: fmt(120.5),
    invoices: [
      { id: "1", date: "Oct 1, 2026", amount: fmt(49.0), status: "Paid", plan: "Pro" },
      { id: "2", date: "Sep 1, 2026", amount: fmt(49.0), status: "Paid", plan: "Pro" },
      { id: "3", date: "Aug 1, 2026", amount: fmt(29.0), status: "Paid", plan: "Starter" },
      { id: "4", date: "Nov 1, 2026", amount: fmt(49.0), status: "Upcoming", plan: "Pro" },
    ],
    usage: {
      aiGenerations: { used: 1248, limit: 5000 },
      storage: { used: 24.5, limit: 100, unit: "GB" },
      apiCalls: { used: 3420, limit: 10000 },
    },
  }));
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

  const errorResponse = await runMiddleware([
    userAuthentication(),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await request.json();
    const {
      email,
      userName,
      invoiceNumber,
      transactionNumber,
      paymentMethod,
      paymentDate,
      purchasedItem,
      totalPayment,
      invoiceUrl,
      dashboardUrl,
    } = body;

    if (!email || !userName || !invoiceNumber || !totalPayment) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Missing required payment fields" } },
        { status: 400 }
      );
    }

    const { defaultEmailService } = await import("@/modules/email");
    await defaultEmailService.sendPaymentSuccess({
      email,
      userName,
      invoiceNumber: invoiceNumber || "INV-000",
      transactionNumber: transactionNumber || "TXN-000",
      paymentMethod: paymentMethod || "Card",
      paymentDate: paymentDate || new Date().toISOString(),
      purchasedItem: purchasedItem || "Subscription",
      totalPayment: String(totalPayment),
      invoiceUrl: invoiceUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing`,
      dashboardUrl: dashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
    });

    return NextResponse.json(successResponse({ message: "Payment confirmation email sent successfully" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
