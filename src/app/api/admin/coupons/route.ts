import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";

const MOCK_COUPONS = [
  { id: "1", code: "LAUNCH2026", type: "Percentage", value: "20%", uses: 145, limit: 500, expires: "Dec 31, 2026", status: "Active" },
  { id: "2", code: "WELCOME50", type: "Fixed", value: "$50", uses: 89, limit: 200, expires: "Nov 30, 2026", status: "Active" },
  { id: "3", code: "BLACKFRIDAY", type: "Percentage", value: "30%", uses: 0, limit: 1000, expires: "Nov 28, 2026", status: "Scheduled" },
];

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

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:coupons")], ctx);
  if (errorResponse) return errorResponse;

  try {
    return NextResponse.json(paginatedResponse(MOCK_COUPONS, MOCK_COUPONS.length, 1, MOCK_COUPONS.length));
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

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:coupons")], ctx);
  if (errorResponse) return errorResponse;

  try {
    return NextResponse.json(successResponse({ message: "Coupon created successfully" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
