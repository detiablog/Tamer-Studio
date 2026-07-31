import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db";
import { affiliate } from "@/lib/db/schema/dashboard";
import { eq } from "drizzle-orm";

function buildContext(request: NextRequest, method: string): RequestContext {
  return {
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
    method,
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };
}

export async function GET(request: NextRequest) {
  const ctx = buildContext(request, "GET");

  const errorResponse = await runMiddleware([
    userAuthentication(),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const userId = ctx.state.userSession!.userId;

    const existingAffiliate = await db
      .select()
      .from(affiliate)
      .where(eq(affiliate.userId, userId))
      .limit(1);

    if (existingAffiliate.length === 0) {
      return NextResponse.json(successResponse({
        status: "none",
        affiliate: null,
      }));
    }

    const aff = existingAffiliate[0];

    return NextResponse.json(successResponse({
      status: aff.status,
      affiliate: {
        id: aff.id,
        affiliateCode: aff.affiliateCode,
        status: aff.status,
        commissionRate: aff.commissionRate,
        totalClicks: aff.totalClicks,
        totalConversions: aff.totalConversions,
        totalRevenue: aff.totalRevenue,
        totalCommission: aff.totalCommission,
        pendingCommission: aff.pendingCommission,
        paidCommission: aff.paidCommission,
        affiliateLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://tamer.ai"}/affiliate/${aff.affiliateCode}`,
        createdAt: aff.createdAt,
      },
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const ctx = buildContext(request, "POST");

  const errorResponse = await runMiddleware([
    userAuthentication(),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const userId = ctx.state.userSession!.userId;

    const existingAffiliate = await db
      .select()
      .from(affiliate)
      .where(eq(affiliate.userId, userId))
      .limit(1);

    if (existingAffiliate.length > 0) {
      return NextResponse.json(successResponse({
        affiliateCode: existingAffiliate[0].affiliateCode,
        status: existingAffiliate[0].status,
      }));
    }

    const code = `AFF-${userId.slice(0, 8).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const id = `aff_${crypto.randomUUID()}`;

    await db.insert(affiliate).values({
      id,
      userId,
      affiliateCode: code,
      status: "pending",
    });

    return NextResponse.json(successResponse({
      affiliateCode: code,
      status: "pending",
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
