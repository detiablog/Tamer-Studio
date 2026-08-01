import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { learningCollectorService } from "@/core/learning-engine/learning-collector.service";
import { patternAnalyzerService } from "@/core/learning-engine/pattern-analyzer.service";
import { preferenceEngineService } from "@/core/learning-engine/preference-engine.service";
import { recommendationEngineService } from "@/core/learning-engine/recommendation-engine.service";
import { feedbackService } from "@/core/learning-engine/feedback.service";
import { goalService } from "@/core/learning-engine/goal.service";

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

    const [eventsStats, patternsStats, preferencesStats, recommendationsStats, feedbackStats, goalsStats] = await Promise.all([
      learningCollectorService.getStats(userId),
      patternAnalyzerService.getStats(userId),
      preferenceEngineService.getStats(userId),
      recommendationEngineService.getStats(userId),
      feedbackService.getStats(userId),
      goalService.getStats(userId),
    ]);

    const stats = {
      events: eventsStats,
      patterns: patternsStats,
      preferences: preferencesStats,
      recommendations: recommendationsStats,
      feedback: feedbackStats,
      goals: goalsStats,
    };

    return NextResponse.json(successResponse(stats));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
