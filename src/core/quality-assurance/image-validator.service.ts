export interface ImageValidationResult {
  resolution: number;
  sharpness: number;
  blur: number;
  noise: number;
  compression: number;
  artifacts: number;
  lighting: number;
  exposure: number;
  contrast: number;
  cropping: number;
  composition: number;
  subjectVisibility: number;
  textReadability: number;
  watermarkPresence: number;
  overallScore: number;
  issues: string[];
  recommendations: string[];
}

export class ImageValidatorService {
  async validateImage(asset: Record<string, unknown>): Promise<ImageValidationResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const width = (asset.width as number) || 0;
    const height = (asset.height as number) || 0;
    const resolution = width > 0 && height > 0 ? this.scoreResolution(width, height) : 40;

    if (width > 0 && height > 0 && width < 640 && height < 640) {
      issues.push("Resolution is below 640px minimum");
      recommendations.push("Regenerate at 1024x1024 or higher resolution");
    }

    if (resolution < 50) {
      recommendations.push("Use a higher resolution generation setting");
    }

    const blur = (asset.blur as number) || 0;
    const sharpness = Math.max(0, 100 - blur);
    if (blur > 30) {
      issues.push("Image appears blurry");
      recommendations.push("Regenerate with a sharper prompt or higher quality setting");
    }

    const noise = (asset.noise as number) || 0;
    const compression = (asset.compression as number) || 0;
    const artifacts = Math.max(0, 100 - (compression > 80 ? 80 : compression));
    if (noise > 40) {
      issues.push("High noise detected");
      recommendations.push("Use noise reduction during generation");
    }

    const lighting = (asset.lighting as number) || 60;
    if (lighting < 30) {
      issues.push("Poor lighting detected");
      recommendations.push("Specify lighting conditions in the prompt (e.g. 'well-lit', 'golden hour')");
    }
    if (lighting > 95) {
      issues.push("Overexposed lighting");
      recommendations.push("Balance exposure with softer lighting terminology");
    }

    const exposure = (asset.exposure as number) || 60;
    const contrast = (asset.contrast as number) || 50;
    if (contrast < 20) {
      issues.push("Very low contrast");
      recommendations.push("Add contrast descriptors like 'high contrast' or 'vivid'");
    }

    const cropping = (asset.cropping as number) || 80;
    if (cropping < 40) {
      issues.push("Unusual cropping detected");
      recommendations.push("Specify subject placement in the prompt");
    }

    const composition = (asset.composition as number) || 70;
    if (composition < 40) {
      recommendations.push("Use composition terms like 'rule of thirds' or 'centered'");
    }

    const subjectVisibility = (asset.subjectVisibility as number) || 75;
    if (subjectVisibility < 40) {
      issues.push("Subject is not clearly visible");
      recommendations.push("Describe the subject more prominently at the start of the prompt");
    }

    const textReadability = (asset.textReadability as number) || 80;
    const watermarkPresence = (asset.watermarkPresence as number) || 0;

    const scores = { resolution, sharpness, exposure, contrast, composition, subjectVisibility, textReadability };
    const overallScore = Math.round(
      (resolution * 0.2 +
        sharpness * 0.15 +
        (100 - Math.min(noise, 100)) * 0.1 +
        exposure * 0.1 +
        contrast * 0.1 +
        cropping * 0.05 +
        composition * 0.1 +
        subjectVisibility * 0.15 +
        textReadability * 0.05) *
        (watermarkPresence > 0 ? 0.98 : 1)
    );

    return {
      resolution,
      sharpness,
      blur,
      noise,
      compression,
      artifacts,
      lighting,
      exposure,
      contrast,
      cropping,
      composition,
      subjectVisibility,
      textReadability,
      watermarkPresence,
      overallScore: Math.min(100, overallScore),
      issues,
      recommendations,
    };
  }

  private scoreResolution(width: number, height: number): number {
    if (width >= 2048 && height >= 2048) return 100;
    if (width >= 1024 && height >= 1024) return 85;
    if (width >= 640 && height >= 640) return 65;
    return 40;
  }
}

export const imageValidatorService = new ImageValidatorService();
