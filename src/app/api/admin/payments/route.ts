import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";
import { paymentEngineService } from "@/core/payment/payment-engine.service";
import { generateId } from "@/modules/email/email.encryption";

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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:billing")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 20;
    const status = url.searchParams.get("status") || undefined;
    const providerId = url.searchParams.get("providerId") || undefined;
    const userId = url.searchParams.get("userId") || undefined;

    const result = await paymentEngineService.listPayments({ userId, status, providerId, page, limit });
    return NextResponse.json(paginatedResponse(result.data, result.total, result.page, result.limit));
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:billing")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const { userId, providerCode, method, currency, items, discount, tax, serviceFee } = body;

    if (!userId || !providerCode || !method || !items || !items.length) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "userId, providerCode, method, and items are required" } },
        { status: 400 }
      );
    }

    const adminId = ctx.state.adminSession?.adminId;

    const result = await paymentEngineService.createCheckout({
      userId,
      providerCode,
      method,
      currency: currency || "USD",
      items,
      discount,
      tax,
      serviceFee,
      createdBy: adminId,
      ipAddress: ctx.ip,
    });

    return NextResponse.json(successResponse(result));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
