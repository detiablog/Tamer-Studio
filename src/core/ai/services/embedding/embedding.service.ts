import { BaseAIService } from "../base";
import type { EmbeddingOptions, BatchEmbeddingRequest, BatchEmbeddingResponse, EmbeddingResponse } from "./types";
import { EmbeddingResult } from "../assets";
import type { AssetMetadata } from "../assets";

export class AIServiceEmbedding extends BaseAIService {
  async generate(
    input: string,
    options: EmbeddingOptions = {},
    context: Record<string, unknown> = {},
  ): Promise<EmbeddingResult> {
    const payload: Record<string, unknown> = {
      input,
      model: options.model,
      dimensions: options.dimensions,
    };

    const result = await this.execute<EmbeddingResponse>("embedding.generate", payload, context);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Embedding generation failed");
    }

    const metadata: AssetMetadata = {
      provider: "",
      model: result.data.model,
      prompt: input,
      credits: 0,
      cost: 0,
      currency: "USD",
      workspaceId: (context.workspaceId as string) ?? "",
      projectId: context.projectId as string | undefined,
      generationId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    return new EmbeddingResult(result.data, metadata);
  }

  async batch(
    request: BatchEmbeddingRequest,
    context: Record<string, unknown> = {},
  ): Promise<BatchEmbeddingResponse> {
    const payload: Record<string, unknown> = {
      inputs: request.inputs,
      model: request.model,
      dimensions: request.dimensions,
    };

    const result = await this.execute<BatchEmbeddingResponse>("embedding.batch", payload, context);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Batch embedding failed");
    }

    return result.data;
  }

  async getMetadata(generationId: string): Promise<AssetMetadata> {
    const result = await this.execute<{ metadata: AssetMetadata }>("embedding.metadata", { generationId }, {});

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Failed to retrieve embedding metadata");
    }

    return result.data.metadata;
  }
}
