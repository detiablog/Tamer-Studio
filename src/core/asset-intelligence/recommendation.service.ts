import { db } from "@/lib/db";
import { assetMetadata, assetQualityScore, assetClassification, assetDuplicate } from "@/lib/db/schema/asset-intelligence";
import { eq, and, desc, sql } from "drizzle-orm";

export interface AssetRecommendation {
  type: string;
  title: string;
  description: string;
  assetId?: string;
  priority: number;
}

export class RecommendationService {
  async getRecommendations(userId: string): Promise<AssetRecommendation[]> {
    const recommendations: AssetRecommendation[] = [];

    const lowQuality = await db.select({ assetId: assetQualityScore.assetId, score: assetQualityScore.overallScore }).from(assetQualityScore).where(and(eq(assetQualityScore.userId, userId), sql`${assetQualityScore.overallScore} < 50`)).limit(5);
    for (const lq of lowQuality) {
      recommendations.push({ type: "quality_improvement", title: "Low quality asset", description: `Asset has a quality score of ${lq.score}/100`, assetId: lq.assetId, priority: 30 });
    }

    const duplicates = await db.select().from(assetDuplicate).where(and(eq(assetDuplicate.userId, userId), eq(assetDuplicate.status, "detected"))).limit(5);
    for (const dup of duplicates) {
      recommendations.push({ type: "duplicate_cleanup", title: "Duplicate detected", description: `${dup.matchType} match with ${dup.similarityScore}% similarity`, assetId: dup.assetId, priority: 20 });
    }

    const [assetCount] = await db.select({ count: sql<number>`count(*)` }).from(assetMetadata).where(eq(assetMetadata.userId, userId));
    if (Number(assetCount?.count ?? 0) === 0) {
      recommendations.push({ type: "get_started", title: "Create your first asset", description: "Start by generating or uploading an asset", priority: 50 });
    }

    const topQuality = await db.select({ assetId: assetQualityScore.assetId, score: assetQualityScore.overallScore }).from(assetQualityScore).where(and(eq(assetQualityScore.userId, userId), sql`${assetQualityScore.overallScore} >= 85`)).orderBy(desc(assetQualityScore.overallScore)).limit(3);
    if (topQuality.length > 0) {
      recommendations.push({ type: "reuse_asset", title: "High quality assets available", description: `You have ${topQuality.length} high quality assets to reuse`, priority: 10 });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }
}

export const recommendationService = new RecommendationService();
