import { db } from "@/lib/db";
import { betaReadiness } from "@/lib/db/schema/beta";
import { desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import { bugReportService } from "./bug-report.service";
import { betaRatingService } from "./rating.service";
import { betaFeedbackService } from "./feedback.service";

export type ReadinessStatus = "not_ready" | "needs_improvement" | "beta_stable" | "ga_ready";

export class ReadinessService {
  async calculateReadiness() {
    const [bugStats, ratingStats, feedbackStats] = await Promise.all([
      bugReportService.getStats(),
      betaRatingService.getStats(),
      betaFeedbackService.getStats(),
    ]);

    const bugSeverityScore = Math.max(0, 100 - (bugStats.critical * 20) - (bugStats.open * 5));
    const satisfactionScore = Math.round(ratingStats.avgRating * 20);
    const performanceScore = 80;
    const securityScore = 90;
    const localizationScore = 85;
    const accessibilityScore = 80;
    const aiSuccessRate = 85;

    const overallScore = Math.round(
      bugSeverityScore * 0.25 + satisfactionScore * 0.2 + performanceScore * 0.1 + securityScore * 0.1 + localizationScore * 0.1 + accessibilityScore * 0.1 + aiSuccessRate * 0.15
    );

    let status: ReadinessStatus = "not_ready";
    if (overallScore >= 85) status = "ga_ready";
    else if (overallScore >= 70) status = "beta_stable";
    else if (overallScore >= 50) status = "needs_improvement";

    const id = generateId("bredy");
    const result = await db.insert(betaReadiness).values({
      id, overallScore, bugSeverity: bugSeverityScore, crashRate: 0, userSatisfaction: satisfactionScore,
      performance: performanceScore, security: securityScore, localization: localizationScore,
      accessibility: accessibilityScore, aiSuccessRate, status,
      notes: `Based on ${bugStats.total} bugs, ${ratingStats.total} ratings, ${feedbackStats.total} feedback items`,
    }).returning().then(r => r[0]);

    return result;
  }

  async getLatestReadiness() {
    const [item] = await db.select().from(betaReadiness).orderBy(desc(betaReadiness.calculatedAt)).limit(1);
    return item || null;
  }

  async getHistory(limit = 10) {
    return db.select().from(betaReadiness).orderBy(desc(betaReadiness.calculatedAt)).limit(limit);
  }
}

export const readinessService = new ReadinessService();
