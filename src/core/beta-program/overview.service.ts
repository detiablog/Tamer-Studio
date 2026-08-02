import { invitationService } from "./invitation.service";
import { betaUserService } from "./beta-user.service";
import { betaFeedbackService } from "./feedback.service";
import { bugReportService } from "./bug-report.service";
import { featureRequestService } from "./feature-request.service";
import { betaRatingService } from "./rating.service";
import { readinessService } from "./readiness.service";

export class BetaOverviewService {
  async getOverview() {
    const [invitationStats, userStats, feedbackStats, bugStats, featureStats, ratingStats, readiness] = await Promise.all([
      invitationService.getStats(),
      betaUserService.getStats(),
      betaFeedbackService.getStats(),
      bugReportService.getStats(),
      featureRequestService.getStats(),
      betaRatingService.getStats(),
      readinessService.getLatestReadiness(),
    ]);

    return {
      invitations: invitationStats,
      users: userStats,
      feedback: feedbackStats,
      bugs: bugStats,
      featureRequests: featureStats,
      ratings: ratingStats,
      readiness,
    };
  }
}

export const betaOverviewService = new BetaOverviewService();
