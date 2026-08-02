import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { invitationService } from "@/core/beta-program/invitation.service";
import { betaUserService } from "@/core/beta-program/beta-user.service";
import { betaFeedbackService } from "@/core/beta-program/feedback.service";
import { bugReportService } from "@/core/beta-program/bug-report.service";
import { featureRequestService } from "@/core/beta-program/feature-request.service";
import { betaRatingService } from "@/core/beta-program/rating.service";

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
    const [invitationStats, userStats, feedbackStats, bugStats, featureStats, ratingStats] = await Promise.all([
      invitationService.getStats(),
      betaUserService.getStats(),
      betaFeedbackService.getStats(),
      bugReportService.getStats(),
      featureRequestService.getStats(),
      betaRatingService.getStats(),
    ]);

    const stats = {
      invitations: invitationStats,
      users: userStats,
      feedback: feedbackStats,
      bugs: bugStats,
      featureRequests: featureStats,
      ratings: ratingStats,
    };

    return NextResponse.json(successResponse(stats));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
