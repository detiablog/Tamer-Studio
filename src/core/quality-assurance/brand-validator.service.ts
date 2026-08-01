import { db } from "@/lib/db";
import { creativeBrandProfile } from "@/lib/db/schema/creative-memory";
import { eq, and } from "drizzle-orm";

export interface BrandValidationResult {
  logoPresent: number;
  colorMatch: number;
  typographyMatch: number;
  toneMatch: number;
  watermarkPresent: number;
  ctaMatch: number;
  thumbnailStyleMatch: number;
  overallBrandScore: number;
  issues: string[];
  recommendations: string[];
}

export class BrandValidatorService {
  async validateBrand(userId: string, asset: Record<string, unknown>): Promise<BrandValidationResult> {
    const [brand] = await db.select().from(creativeBrandProfile).where(and(eq(creativeBrandProfile.userId, userId), eq(creativeBrandProfile.isActive, true))).orderBy(creativeBrandProfile.updatedAt).limit(1);

    const issues: string[] = [];
    const recommendations: string[] = [];

    const logoPresent = (asset.hasLogo ? 100 : 30) as number;
    const watermarkPresent = (asset.hasWatermark ? 100 : 20) as number;

    if (brand) {
      const expectedColors = [...(brand.primaryColors || []), ...(brand.secondaryColors || [])];
      const assetColors = (asset.colors as string[]) || [];
      const colorMatch = this.calculateColorMatch(expectedColors, assetColors);
      if (colorMatch < 50) {
        issues.push("Brand colors not matched in asset");
        recommendations.push("Adjust color palette to match brand colors");
      }

      const toneMatch = (asset.tone as string) === brand.tone ? 100 : 50;
      if (toneMatch < 60 && brand.tone) {
        issues.push(`Tone '${asset.tone}' does not match brand tone '${brand.tone}'`);
      }

      const ctaMatch = asset.preferredCta === brand.preferredCta ? 100 : 50;

      return {
        logoPresent,
        colorMatch,
        typographyMatch: (asset.typography as string) === brand.typography ? 90 : 40,
        toneMatch,
        watermarkPresent,
        ctaMatch,
        thumbnailStyleMatch: 70,
        overallBrandScore: Math.round((logoPresent * 0.15 + watermarkPresent * 0.1 + colorMatch * 0.25 + (asset.typography === brand.typography ? 90 : 40) * 0.15 + toneMatch * 0.2 + ctaMatch * 0.15)),
        issues,
        recommendations,
      };
    }

    const fallback = Math.round(logoPresent * 0.4 + watermarkPresent * 0.4 + 60 * 0.2);
    return {
      logoPresent,
      colorMatch: 60,
      typographyMatch: 60,
      toneMatch: 60,
      watermarkPresent,
      ctaMatch: 60,
      thumbnailStyleMatch: 60,
      overallBrandScore: fallback,
      issues,
      recommendations,
    };
  }

  private calculateColorMatch(expected: string[], actual: string[]): number {
    if (expected.length === 0 || actual.length === 0) return 50;
    let matches = 0;
    for (const expectedColor of expected) {
      if (actual.some(ac => ac.toLowerCase() === expectedColor.toLowerCase())) {
        matches++;
      }
    }
    return Math.round((matches / expected.length) * 100);
  }
}

export const brandValidatorService = new BrandValidatorService();
