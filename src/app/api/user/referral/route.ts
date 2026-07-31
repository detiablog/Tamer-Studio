import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db";
import { referral } from "@/lib/db/schema/dashboard";
import { eq, count, sql } from "drizzle-orm";

function buildContext(request: NextRequest): RequestContext {
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
    method: "GET",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };
}

export async function GET(request: NextRequest) {
  const ctx = buildContext(request);

  const errorResponse = await runMiddleware([
    userAuthentication(),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const userId = ctx.state.userSession!.userId;

    const existingReferrals = await db
      .select()
      .from(referral)
      .where(eq(referral.referrerUserId, userId));

    const existingCode = existingReferrals.length > 0 ? existingReferrals[0] : null;

    const [totalReferred] = await db
      .select({ count: sql<number>`count(*)` })
      .from(referral)
      .where(eq(referral.referrerUserId, userId));

    const [rewardedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(referral)
      .where(sql`${referral.referrerUserId} = ${userId} AND ${referral.status} = 'rewarded'`);

    const [totalRewards] = await db
      .select({ sum: sql<string>`coalesce(sum(${referral.rewardCredits}::numeric), 0)` })
      .from(referral)
      .where(eq(referral.referrerUserId, userId));

    return NextResponse.json(successResponse({
      referralCode: existingCode?.referralCode || null,
      referralLink: existingCode ? `${process.env.NEXT_PUBLIC_APP_URL || "https://tamer.ai"}/ref/${existingCode.referralCode}` : null,
      stats: {
        totalReferred: totalReferred?.count ?? 0,
        rewardedCount: rewardedCount?.count ?? 0,
        totalRewardsEarned: totalRewards?.sum ?? "0",
      },
      referrals: existingReferrals.slice(0, 20).map((r) => ({
        id: r.id,
        referredUserId: r.referredUserId,
        status: r.status,
        rewardCredits: r.rewardCredits,
        createdAt: r.createdAt,
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
    const userId = ctx.state.userSession!.userId;

    const existingReferral = await db
      .select()
      .from(referral)
      .where(eq(referral.referrerUserId, userId))
      .limit(1);

    if (existingReferral.length > 0) {
      return NextResponse.json(successResponse({
        referralCode: existingReferral[0].referralCode,
        referralLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://tamer.ai"}/ref/${existingReferral[0].referralCode}`,
      }));
    }

    const code = `REF-${userId.slice(0, 8).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const id = `ref_${crypto.randomUUID()}`;

    await db.insert(referral).values({
      id,
      referrerUserId: userId,
      referralCode: code,
      status: "active",
    });

    return NextResponse.json(successResponse({
      referralCode: code,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://tamer.ai"}/ref/${code}`,
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
