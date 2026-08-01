export interface PublishingValidationResult {
  platformRequirements: number;
  aspectRatio: number;
  duration: number;
  captionQuality: number;
  hashtagsQuality: number;
  thumbnailQuality: number;
  titleQuality: number;
  descriptionQuality: number;
  localization: number;
  publishingReadinessScore: number;
  issues: string[];
  recommendations: string[];
}

export class PublishingValidatorService {
  async validatePublishing(asset: Record<string, unknown>): Promise<PublishingValidationResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const platformRequirements = (asset.platformRequirements as number) || 70;
    const aspectRatio = (asset.aspectRatio as number) || 70;
    const duration = (asset.duration as number) || 70;
    const captionQuality = (asset.caption as string) ? 80 : 30;
    const hashtagsQuality = (asset.hashtags as string[])?.length ? 80 : 30;
    const thumbnailQuality = asset.hasThumbnail ? 80 : 30;
    const titleQuality = (asset.title as string) ? 75 : 30;
    const descriptionQuality = (asset.description as string) ? 75 : 30;
    const localization = (asset.localization as number) || 60;

    if (captionQuality < 50) {
      issues.push("Missing or weak caption");
      recommendations.push("Add a compelling caption with a clear CTA");
    }
    if (hashtagsQuality < 50) {
      issues.push("Missing hashtags");
      recommendations.push("Add relevant hashtags for the target platform");
    }
    if (thumbnailQuality < 50) {
      issues.push("Missing thumbnail");
      recommendations.push("Generate a platform-optimized thumbnail");
    }
    if (aspectRatio < 50) {
      issues.push("Aspect ratio not optimized for platform");
      recommendations.push("Use platform-recommended aspect ratio (e.g. 9:16 for TikTok)");
    }

    const publishingReadinessScore = Math.round(
      platformRequirements * 0.15 +
        aspectRatio * 0.1 +
        duration * 0.1 +
        captionQuality * 0.15 +
        hashtagsQuality * 0.1 +
        thumbnailQuality * 0.15 +
        titleQuality * 0.1 +
        descriptionQuality * 0.1 +
        localization * 0.05
    );

    return {
      platformRequirements,
      aspectRatio,
      duration,
      captionQuality,
      hashtagsQuality,
      thumbnailQuality,
      titleQuality,
      descriptionQuality,
      localization,
      publishingReadinessScore,
      issues,
      recommendations,
    };
  }
}

export const publishingValidatorService = new PublishingValidatorService();
