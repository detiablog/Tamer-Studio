import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db";
import { qualityReport, qualityValidation, qualityRecommendation } from "@/lib/db/schema/quality-assurance";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

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

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;
    const conditions = [eq(qualityReport.userId, userId)];
    if (startDate) conditions.push(gte(qualityReport.createdAt, startDate));
    if (endDate) conditions.push(lte(qualityReport.createdAt, endDate));
    const where = and(...conditions);

    const [totalReports, passedReports, failedReports, avgScore, totalValidations, failedValidations, totalRecommendations, typeBreakdown, dailyTrend] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(qualityReport).where(where),
      db.select({ count: sql<number>`count(*)` }).from(qualityReport).where(and(where, eq(qualityReport.passed, true))),
      db.select({ count: sql<number>`count(*)` }).from(qualityReport).where(and(where, eq(qualityReport.passed, false))),
      db.select({ avg: sql<number>`coalesce(avg(${qualityReport.overallScore}), 0)` }).from(qualityReport).where(where),
      db.select({ count: sql<number>`count(*)` }).from(qualityValidation).where(eq(qualityValidation.userId, userId)),
      db.select({ count: sql<number>`count(*)` }).from(qualityValidation).where(and(eq(qualityValidation.userId, userId), eq(qualityValidation.passed, false))),
      db.select({ count: sql<number>`count(*)` }).from(qualityRecommendation).where(eq(qualityRecommendation.userId, userId)),
      db.select({ assetType: qualityReport.assetType, count: sql<number>`count(*)`, avgScore: sql<number>`avg(${qualityReport.overallScore})` }).from(qualityReport).where(where).groupBy(qualityReport.assetType),
      db.select({ date: sql<string>`date_trunc('day', ${qualityReport.createdAt})`, count: sql<number>`count(*)` }).from(qualityReport).where(where).groupBy(sql`date_trunc('day', ${qualityReport.createdAt})`).orderBy(sql`date_trunc('day', ${qualityReport.createdAt})`),
    ]);

    const totalCount = Number(totalReports[0].count ?? 0);
    const analytics = {
      totalReports: totalCount,
      passedReports: Number(passedReports[0].count ?? 0),
      failedReports: Number(failedReports[0].count ?? 0),
      avgOverallScore: Math.round(Number(avgScore[0].avg ?? 0)),
      totalValidations: Number(totalValidations[0].count ?? 0),
      failedValidations: Number(failedValidations[0].count ?? 0),
      totalRecommendations: Number(totalRecommendations[0].count ?? 0),
      approvalRate: totalCount > 0 ? Math.round((Number(passedReports[0].count ?? 0) / totalCount) * 100) : 0,
      typeBreakdown,
      dailyTrend,
    };
    return NextResponse.json(successResponse(analytics));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
