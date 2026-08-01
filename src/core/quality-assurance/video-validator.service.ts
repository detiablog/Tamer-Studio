export interface VideoValidationResult {
  resolution: number;
  fps: number;
  frameConsistency: number;
  sceneContinuity: number;
  audioPresence: number;
  subtitleTiming: number;
  renderingErrors: number;
  transitionQuality: number;
  endingQuality: number;
  thumbnailAvailability: number;
  overallScore: number;
  issues: string[];
  recommendations: string[];
}

export class VideoValidatorService {
  async validateVideo(asset: Record<string, unknown>): Promise<VideoValidationResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const width = (asset.width as number) || 0;
    const height = (asset.height as number) || 0;
    const resolution = width > 0 && height > 0 ? this.scoreResolution(width, height) : 50;

    if (width > 0 && height > 0 && width < 480) {
      issues.push("Video resolution is below 480px");
      recommendations.push("Generate video at 720p or 1080p");
    }

    const fps = (asset.fps as number) || 0;
    let fpsScore = 50;
    if (fps >= 60) fpsScore = 100;
    else if (fps >= 30) fpsScore = 90;
    else if (fps >= 24) fpsScore = 75;
    else if (fps > 0) {
      fpsScore = 40;
      issues.push(`Low frame rate (${fps}fps)`);
      recommendations.push("Generate at 30fps or higher");
    }

    const frameConsistency = (asset.frameConsistency as number) || 70;
    if (frameConsistency < 50) {
      issues.push("Frame inconsistencies detected");
      recommendations.push("Use a more stable video model or seed");
    }

    const sceneContinuity = (asset.sceneContinuity as number) || 70;
    if (sceneContinuity < 50) {
      issues.push("Scene continuity issues");
      recommendations.push("Describe scene transitions explicitly in the prompt");
    }

    const audioPresence = (asset.audioPresent as number) || (asset.hasAudio ? 100 : 30);
    if (audioPresence < 50) {
      issues.push("Missing or low audio");
      recommendations.push("Generate with audio track or add background music");
    }

    const subtitleTiming = (asset.subtitleTiming as number) || 80;
    const renderingErrors = (asset.renderingErrors as number) || 0;
    if (renderingErrors > 0) {
      issues.push(`${renderingErrors} rendering error(s) detected`);
      recommendations.push("Re-render the video");
    }

    const transitionQuality = (asset.transitionQuality as number) || 75;
    const endingQuality = (asset.endingQuality as number) || 70;
    const thumbnailAvailability = (asset.hasThumbnail ? 100 : 20) as number;
    if (thumbnailAvailability < 50) {
      issues.push("No thumbnail generated");
      recommendations.push("Generate a thumbnail for the video");
    }

    const overallScore = Math.round(
      resolution * 0.15 +
        fpsScore * 0.15 +
        frameConsistency * 0.15 +
        sceneContinuity * 0.15 +
        audioPresence * 0.1 +
        (100 - Math.min(renderingErrors * 20, 100)) * 0.1 +
        transitionQuality * 0.05 +
        endingQuality * 0.05 +
        thumbnailAvailability * 0.1
    );

    return {
      resolution,
      fps: fpsScore,
      frameConsistency,
      sceneContinuity,
      audioPresence,
      subtitleTiming,
      renderingErrors,
      transitionQuality,
      endingQuality,
      thumbnailAvailability,
      overallScore,
      issues,
      recommendations,
    };
  }

  private scoreResolution(width: number, height: number): number {
    if (width >= 1920) return 100;
    if (width >= 1280) return 85;
    if (width >= 720) return 65;
    return 40;
  }
}

export const videoValidatorService = new VideoValidatorService();
