import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { cookies } from "next/headers";
import { resolveCurrencyInfo } from "@/lib/currency/formatter";
import { DefaultBillingEngine } from "@/core/billing/service";
import { config } from "@/core/config";

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

  const workspaceId = request.nextUrl.searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "workspaceId query parameter is required" } },
      { status: 400 }
    );
  }

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

  try {
    const billing = new DefaultBillingEngine();

    const wallet = await billing.getWallet(workspaceId).catch(() => null);
    const subscription = await billing.getSubscription(workspaceId);
    const invoices = await billing.listInvoices(workspaceId);
    const plans = await billing.listPlans();

    const currentPlan = subscription
      ? plans.find((p) => p.id === subscription.planId)
      : undefined;

    const formattedInvoices = invoices.map((inv) => ({
      id: inv.id,
      date: new Date(inv.createdAt).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" }),
      amount: fmt(inv.total),
      status: inv.status === "paid" ? "Paid" : inv.status === "open" ? "Pending" : "Draft",
      plan: inv.lineItems[0]?.description ?? "Purchase",
    }));

    return NextResponse.json(successResponse({
      plan: currentPlan?.name ?? "Free",
      planId: currentPlan?.id ?? "free",
      nextInvoice: subscription ? fmt(
        (currentPlan?.pricePerCredit ?? 0) * (currentPlan?.monthlyCredits ?? 0)
      ) : null,
      nextInvoiceDate: subscription?.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })
        : null,
      creditsRemaining: wallet?.availableCredits ?? 0,
      creditsValue: wallet
        ? fmt(wallet.availableCredits * 0.01)
        : fmt(0),
      invoices: formattedInvoices,
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        monthlyCredits: p.monthlyCredits,
        pricePerCredit: p.pricePerCredit ?? 0,
        monthlyPrice: p.pricePerCredit ? fmt(p.pricePerCredit * p.monthlyCredits) : fmt(0),
        features: p.features,
      })),
    }));
  } catch (error) {
    return mapErrorToResponse(error);
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
      invoiceUrl: invoiceUrl || `${config.app.url}/billing`,
      dashboardUrl: dashboardUrl || `${config.app.url}/dashboard`,
    });

    return NextResponse.json(successResponse({ message: "Payment confirmation email sent successfully" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
