import { BaseAIService } from "../base";
import type {
  VideoGenerationOptions,
  ImageToVideoOptions,
  TextToVideoOptions,
  VideoProgressResponse,
  VideoMetadataResponse,
  VideoUsageRequest,
  VideoUsageResponse,
} from "./types";
import { GeneratedVideo } from "../assets";
import type { AssetMetadata } from "../assets";

export class AIServiceVideo extends BaseAIService {
  async generate(
    options: VideoGenerationOptions = {},
    context: Record<string, unknown> = {},
  ): Promise<GeneratedVideo> {
    const payload: Record<string, unknown> = {
      durationSeconds: options.durationSeconds,
      width: options.width,
      height: options.height,
      fps: options.fps,
      seed: options.seed,
      motionStrength: options.motionStrength,
    };

    const result = await this.execute<{
      url: string;
      durationSeconds: number;
      width: number;
      height: number;
      mimeType: string;
      provider: string;
      model: string;
      seed: number;
      credits: number;
      cost: number;
      currency: string;
    }>("video.generate", payload, context);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Video generation failed");
    }

    const metadata: AssetMetadata = {
      provider: result.data.provider,
      model: result.data.model,
      prompt: "",
      duration: result.data.durationSeconds,
      resolution: `${result.data.width}x${result.data.height}`,
      seed: result.data.seed,
      credits: result.data.credits,
      cost: result.data.cost,
      currency: result.data.currency,
      workspaceId: (context.workspaceId as string) ?? "",
      projectId: context.projectId as string | undefined,
      generationId: result.data.url,
      createdAt: new Date().toISOString(),
    };

    return new GeneratedVideo({
      id: result.data.url,
      url: result.data.url,
      durationSeconds: result.data.durationSeconds,
      width: result.data.width,
      height: result.data.height,
      mimeType: result.data.mimeType,
      metadata,
    });
  }

  async imageToVideo(
    imageId: string,
    options: ImageToVideoOptions = {},
    context: Record<string, unknown> = {},
  ): Promise<GeneratedVideo> {
    const payload: Record<string, unknown> = {
      imageId,
      durationSeconds: options.durationSeconds,
      motionStrength: options.motionStrength,
      seed: options.seed,
    };

    const result = await this.execute<{
      url: string;
      durationSeconds: number;
      width: number;
      height: number;
      mimeType: string;
      provider: string;
      model: string;
      seed: number;
      credits: number;
      cost: number;
      currency: string;
    }>("video.image-to-video", payload, context);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Image-to-video failed");
    }

    const metadata: AssetMetadata = {
      provider: result.data.provider,
      model: result.data.model,
      prompt: `Image-to-video: ${imageId}`,
      duration: result.data.durationSeconds,
      resolution: `${result.data.width}x${result.data.height}`,
      seed: result.data.seed,
      credits: result.data.credits,
      cost: result.data.cost,
      currency: result.data.currency,
      workspaceId: (context.workspaceId as string) ?? "",
      projectId: context.projectId as string | undefined,
      generationId: result.data.url,
      createdAt: new Date().toISOString(),
    };

    return new GeneratedVideo({
      id: result.data.url,
      url: result.data.url,
      durationSeconds: result.data.durationSeconds,
      width: result.data.width,
      height: result.data.height,
      mimeType: result.data.mimeType,
      metadata,
    });
  }

  async textToVideo(
    prompt: string,
    options: TextToVideoOptions = {},
    context: Record<string, unknown> = {},
  ): Promise<GeneratedVideo> {
    const payload: Record<string, unknown> = {
      prompt,
      durationSeconds: options.durationSeconds,
      width: options.width,
      height: options.height,
      fps: options.fps,
      seed: options.seed,
    };

    const result = await this.execute<{
      url: string;
      durationSeconds: number;
      width: number;
      height: number;
      mimeType: string;
      provider: string;
      model: string;
      seed: number;
      credits: number;
      cost: number;
      currency: string;
    }>("video.text-to-video", payload, context);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Text-to-video failed");
    }

    const metadata: AssetMetadata = {
      provider: result.data.provider,
      model: result.data.model,
      prompt,
      duration: result.data.durationSeconds,
      resolution: `${result.data.width}x${result.data.height}`,
      seed: result.data.seed,
      credits: result.data.credits,
      cost: result.data.cost,
      currency: result.data.currency,
      workspaceId: (context.workspaceId as string) ?? "",
      projectId: context.projectId as string | undefined,
      generationId: result.data.url,
      createdAt: new Date().toISOString(),
    };

    return new GeneratedVideo({
      id: result.data.url,
      url: result.data.url,
      durationSeconds: result.data.durationSeconds,
      width: result.data.width,
      height: result.data.height,
      mimeType: result.data.mimeType,
      metadata,
    });
  }

  async getProgress(executionId: string): Promise<VideoProgressResponse> {
    const result = await this.execute<VideoProgressResponse>("video.progress", { executionId }, {});

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Failed to retrieve video progress");
    }

    return result.data;
  }

  async getMetadata(videoId: string): Promise<VideoMetadataResponse> {
    const result = await this.execute<{ metadata: VideoMetadataResponse }>("video.metadata", { videoId }, {});

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Failed to retrieve video metadata");
    }

    return result.data.metadata;
  }

  async cancel(executionId: string): Promise<void> {
    await this.execute("video.cancel", { executionId }, {});
  }

  async getUsage(request: VideoUsageRequest): Promise<VideoUsageResponse> {
    const payload: Record<string, unknown> = {
      workspaceId: request.workspaceId,
      projectId: request.projectId,
      startDate: request.startDate,
      endDate: request.endDate,
    };

    const result = await this.execute<VideoUsageResponse>("video.usage", payload, {});

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Failed to retrieve video usage");
    }

    return result.data;
  }
}
