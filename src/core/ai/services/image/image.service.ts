import { BaseAIService } from "../base";
import type {
  ImageGenerationOptions,
  ImageVariationOptions,
  ImageEditOptions,
  ImageUpscaleOptions,
  ImageValidationResult,
  ImageUsageRequest,
  ImageUsageResponse,
} from "./types";
import { GeneratedImage } from "../assets";
import type { AssetMetadata } from "../assets";

export class AIServiceImage extends BaseAIService {
  async generate(
    prompt: string,
    options: ImageGenerationOptions = {},
    context: Record<string, unknown> = {},
  ): Promise<GeneratedImage> {
    const payload: Record<string, unknown> = {
      prompt,
      width: options.width,
      height: options.height,
      steps: options.steps,
      seed: options.seed,
      negativePrompt: options.negativePrompt,
      style: options.style,
    };

    const result = await this.execute<{
      url: string;
      width: number;
      height: number;
      mimeType: string;
      provider: string;
      model: string;
      seed: number;
      credits: number;
      cost: number;
      currency: string;
    }>("image.generate", payload, context, {
      metadata: { capability: "image.generate" },
    });

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Image generation failed");
    }

    const metadata: AssetMetadata = {
      provider: result.data.provider,
      model: result.data.model,
      prompt,
      negativePrompt: options.negativePrompt,
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

    return new GeneratedImage({
      id: result.data.url,
      url: result.data.url,
      width: result.data.width,
      height: result.data.height,
      mimeType: result.data.mimeType,
      metadata,
    });
  }

  async variations(
    imageId: string,
    options: ImageVariationOptions = {},
    context: Record<string, unknown> = {},
  ): Promise<GeneratedImage[]> {
    const payload: Record<string, unknown> = {
      imageId,
      count: options.count ?? 4,
      strength: options.strength ?? 0.7,
      seed: options.seed,
    };

    const result = await this.execute<{
      images: Array<{
        url: string;
        width: number;
        height: number;
        mimeType: string;
        provider: string;
        model: string;
        seed: number;
        credits: number;
        cost: number;
        currency: string;
      }>;
    }>("image.variations", payload, context);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Image variations failed");
    }

    return result.data.images.map((img) => {
      const metadata: AssetMetadata = {
        provider: img.provider,
        model: img.model,
        prompt: "",
        seed: img.seed,
        credits: img.credits,
        cost: img.cost,
        currency: img.currency,
        workspaceId: (context.workspaceId as string) ?? "",
        projectId: context.projectId as string | undefined,
        generationId: img.url,
        createdAt: new Date().toISOString(),
      };
      return new GeneratedImage({
        id: img.url,
        url: img.url,
        width: img.width,
        height: img.height,
        mimeType: img.mimeType,
        metadata,
      });
    });
  }

  async edit(
    prompt: string,
    imageId: string,
    options: ImageEditOptions = {},
    context: Record<string, unknown> = {},
  ): Promise<GeneratedImage> {
    const payload: Record<string, unknown> = {
      prompt,
      imageId,
      mask: options.mask,
      steps: options.steps,
      seed: options.seed,
    };

    const result = await this.execute<{
      url: string;
      width: number;
      height: number;
      mimeType: string;
      provider: string;
      model: string;
      seed: number;
      credits: number;
      cost: number;
      currency: string;
    }>("image.edit", payload, context);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Image edit failed");
    }

    const metadata: AssetMetadata = {
      provider: result.data.provider,
      model: result.data.model,
      prompt,
      seed: result.data.seed,
      credits: result.data.credits,
      cost: result.data.cost,
      currency: result.data.currency,
      workspaceId: (context.workspaceId as string) ?? "",
      projectId: context.projectId as string | undefined,
      generationId: result.data.url,
      createdAt: new Date().toISOString(),
    };

    return new GeneratedImage({
      id: result.data.url,
      url: result.data.url,
      width: result.data.width,
      height: result.data.height,
      mimeType: result.data.mimeType,
      metadata,
    });
  }

  async upscale(
    imageId: string,
    options: ImageUpscaleOptions = {},
    context: Record<string, unknown> = {},
  ): Promise<GeneratedImage> {
    const payload: Record<string, unknown> = {
      imageId,
      scale: options.scale ?? 2,
      model: options.model,
    };

    const result = await this.execute<{
      url: string;
      width: number;
      height: number;
      mimeType: string;
      provider: string;
      model: string;
      credits: number;
      cost: number;
      currency: string;
    }>("image.upscale", payload, context);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Image upscale failed");
    }

    const metadata: AssetMetadata = {
      provider: result.data.provider,
      model: result.data.model,
      prompt: "",
      credits: result.data.credits,
      cost: result.data.cost,
      currency: result.data.currency,
      workspaceId: (context.workspaceId as string) ?? "",
      projectId: context.projectId as string | undefined,
      generationId: result.data.url,
      createdAt: new Date().toISOString(),
    };

    return new GeneratedImage({
      id: result.data.url,
      url: result.data.url,
      width: result.data.width,
      height: result.data.height,
      mimeType: result.data.mimeType,
      metadata,
    });
  }

  async getMetadata(imageId: string): Promise<AssetMetadata> {
    const result = await this.execute<{ metadata: AssetMetadata }>("image.metadata", { imageId }, {});

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Failed to retrieve image metadata");
    }

    return result.data.metadata;
  }

  async validatePrompt(prompt: string): Promise<ImageValidationResult> {
    try {
      await this.execute<ImageValidationResult>("image.validate", { prompt }, {});
      return { valid: true, errors: [], warnings: [] };
    } catch {
      return { valid: false, errors: ["Prompt validation failed"], warnings: [] };
    }
  }

  async getUsage(request: ImageUsageRequest): Promise<ImageUsageResponse> {
    const payload: Record<string, unknown> = {
      workspaceId: request.workspaceId,
      projectId: request.projectId,
      startDate: request.startDate,
      endDate: request.endDate,
    };

    const result = await this.execute<ImageUsageResponse>("image.usage", payload, {});

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Failed to retrieve image usage");
    }

    return result.data;
  }
}
