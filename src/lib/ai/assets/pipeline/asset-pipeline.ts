import type { Asset, AssetKind, AssetPipelineContext } from "../types";
import { DefaultAssetNormalizer } from "./normalizer";

export interface AssetPipeline {
  normalize(input: unknown, kind: string): Promise<ReturnType<DefaultAssetNormalizer["normalize"]>>;
  extractMetadata(normalized: ReturnType<DefaultAssetNormalizer["normalize"]>, ctx: AssetPipelineContext): Promise<Partial<Asset["metadata"]>>;
  generatePreview(normalized: ReturnType<DefaultAssetNormalizer["normalize"]>): Promise<Partial<Asset["preview"]>>;
  process(ctx: AssetPipelineContext, rawResult: Record<string, unknown>): Promise<Asset[]>;
}

export class DefaultAssetPipeline implements AssetPipeline {
  constructor(
    private storage: { store: (assetId: string, data: Buffer, kind: string, version: string) => Promise<{ path: string; url?: string }> },
    private lifecycleEmitter: (event: { assetId: string; from: string; to: string; trigger: string; timestamp: string }) => void | Promise<void>,
  ) {}

  async normalize(input: unknown, kind: string): Promise<ReturnType<DefaultAssetNormalizer["normalize"]>> {
    const normalizer = new DefaultAssetNormalizer();
    return normalizer.normalize(input, kind as AssetKind);
  }

  async extractMetadata(normalized: ReturnType<DefaultAssetNormalizer["normalize"]>, _ctx: AssetPipelineContext): Promise<Partial<Asset["metadata"]>> {
    return normalized.metadata;
  }

  async generatePreview(normalized: ReturnType<DefaultAssetNormalizer["normalize"]>): Promise<Partial<Asset["preview"]>> {
    return normalized.preview ?? {};
  }

  async process(ctx: AssetPipelineContext, rawResult: Record<string, unknown>): Promise<Asset[]> {
    const assets: Asset[] = [];
    const kind = this.inferKind(rawResult);
    const normalized = await this.normalize(rawResult, kind);
    const metadata = await this.extractMetadata(normalized, ctx);
    const preview = await this.generatePreview(normalized);

    const dataBuffer = this.serialize(normalized.data);
    const storageRef = await this.storage.store(normalized.assetId, dataBuffer, kind, "1.0.0");

    const asset: Asset = {
      assetId: normalized.assetId,
      kind: kind as AssetKind,
      status: "ready",
      metadata: {
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags ?? [],
        mimeType: metadata.mimeType,
        sizeBytes: metadata.sizeBytes,
        dimensions: metadata.dimensions,
        durationMs: metadata.durationMs,
        format: metadata.format,
        encoding: metadata.encoding,
        language: metadata.language,
        pages: metadata.pages,
        custom: metadata.custom ?? {},
      },
      source: {
        executionId: ctx.executionId,
        workflowId: ctx.workflowId,
        gatewayId: ctx.gatewayId,
        promptId: ctx.promptId,
        capabilityId: ctx.capabilityId,
      },
      storageRef: {
        provider: "memory",
        path: storageRef.path,
        url: storageRef.url,
      },
      currentVersion: "1.0.0",
      preview: {
        thumbnailUrl: preview.thumbnailUrl,
        previewUrl: preview.previewUrl,
        embedUrl: preview.embedUrl,
        width: preview.width,
        height: preview.height,
        durationMs: preview.durationMs,
        format: preview.format,
      },
      createdBy: ctx.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.lifecycleEmitter({
      assetId: asset.assetId,
      from: "draft",
      to: "ready",
      trigger: "complete",
      timestamp: asset.createdAt,
    });

    assets.push(asset);
    return assets;
  }

  private inferKind(result: Record<string, unknown>): string {
    const type = typeof result.type === "string" ? result.type.toLowerCase() : "";
    const validKinds = ["image", "video", "audio", "voice", "subtitle", "prompt", "storyboard", "script", "caption", "translation", "workflow", "document", "template"];
    if (validKinds.includes(type)) return type;

    if (typeof result.url === "string") {
      const url = result.url.toLowerCase();
      if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return "image";
      if (url.match(/\.(mp4|mov|avi|webm)$/)) return "video";
      if (url.match(/\.(mp3|wav|ogg|aac|flac)$/)) return "audio";
      if (url.match(/\.(srt|vtt|ass)$/)) return "subtitle";
      if (url.match(/\.(pdf|doc|docx|txt|md)$/)) return "document";
    }

    if (typeof result.text === "string" && result.text.length > 0) {
      if (type === "script") return "script";
      if (type === "storyboard") return "storyboard";
      if (type === "prompt") return "prompt";
      return "document";
    }

    return "document";
  }

  private serialize(data: unknown): Buffer {
    if (data instanceof Buffer) return data;
    if (typeof data === "string") return Buffer.from(data, "utf-8");
    return Buffer.from(JSON.stringify(data), "utf-8");
  }
}
