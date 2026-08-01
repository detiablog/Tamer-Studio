import { qualityRecommendation } from "@/lib/db/schema/quality-assurance";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";

export interface Recommendation {
  type: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  impact: number;
  action: string;
}

export class RecommendationEngineService {
  async generateRecommendations(reportId: string, userId: string, scores: Record<string, number>, issues: string[]): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    const scoreMap: Record<string, number> = scores;

    if ((scoreMap.image ?? 100) < 60) {
      recommendations.push({
        type: "regenerate_image",
        title: "Regenerate Image",
        description: "Image quality score is below threshold. Regenerate with improved prompt.",
        severity: "warning",
        impact: 30,
        action: "regenerate",
      });
    }

    if ((scoreMap.video ?? 100) < 60) {
      recommendations.push({
        type: "regenerate_video",
        title: "Regenerate Video",
        description: "Video quality score is below threshold. Consider regeneration.",
        severity: "warning",
        impact: 35,
        action: "regenerate",
      });
    }

    if ((scoreMap.brand ?? 100) < 60) {
      recommendations.push({
        type: "brand_fix",
        title: "Fix Brand Consistency",
        description: "Brand consistency score below threshold. Adjust colors, tone, or style to match brand.",
        severity: "warning",
        impact: 25,
        action: "fix_brand",
      });
    }

    if ((scoreMap.story ?? 100) < 60) {
      recommendations.push({
        type: "story_fix",
        title: "Fix Story Consistency",
        description: "Story consistency issues detected. Review narrative elements.",
        severity: "warning",
        impact: 25,
        action: "fix_story",
      });
    }

    if ((scoreMap.publishing ?? 100) < 60) {
      recommendations.push({
        type: "publishing_fix",
        title: "Improve Publishing Readiness",
        description: "Publishing readiness below threshold. Check captions, hashtags, thumbnails.",
        severity: "warning",
        impact: 20,
        action: "fix_publishing",
      });
    }

    if ((scoreMap.prompt ?? 100) < 60) {
      recommendations.push({
        type: "improve_prompt",
        title: "Improve Prompt",
        description: "Prompt quality could be improved for better results.",
        severity: "info",
        impact: 20,
        action: "optimize_prompt",
      });
    }

    for (const issue of issues.slice(0, 5)) {
      recommendations.push({
        type: "manual_review",
        title: issue,
        description: `Detected issue: ${issue}`,
        severity: "info",
        impact: 10,
        action: "review",
      });
    }

    await this.persistRecommendations(reportId, userId, recommendations);
    return recommendations;
  }

  private async persistRecommendations(reportId: string, userId: string, recommendations: Recommendation[]) {
    for (const rec of recommendations) {
      await db.insert(qualityRecommendation).values({
        id: `qrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        reportId,
        userId,
        type: rec.type,
        title: rec.title,
        description: rec.description,
        severity: rec.severity,
        impact: rec.impact,
        action: rec.action,
      });
    }
  }

  async listRecommendations(reportId: string) {
    return db.select().from(qualityRecommendation).where(eq(qualityRecommendation.reportId, reportId)).orderBy(desc(qualityRecommendation.impact));
  }

  async updateStatus(id: string, status: string) {
    return db.update(qualityRecommendation).set({ status }).where(eq(qualityRecommendation.id, id)).returning().then(r => r[0]);
  }
}

export const recommendationEngineService = new RecommendationEngineService();
