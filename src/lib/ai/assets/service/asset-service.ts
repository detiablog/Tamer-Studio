import type { Asset, AssetId, AssetKind, AssetMetadata, AssetSearchQuery, AssetSource, StorageReference } from "../types";

export interface AssetService {
  create(input: {
    kind: AssetKind;
    metadata: Partial<AssetMetadata>;
    source: Partial<AssetSource>;
    storageRef: StorageReference;
    createdBy: string;
  }): Promise<Asset>;
  get(assetId: AssetId): Promise<Asset | undefined>;
  update(assetId: AssetId, patch: Partial<Asset>): Promise<Asset | undefined>;
  delete(assetId: AssetId): Promise<void>;
  list(query: Partial<AssetSearchQuery>): Promise<Asset[]>;
}

export class InMemoryAssetService implements AssetService {
  private assets: Map<AssetId, Asset> = new Map();

  async create(input: {
    kind: AssetKind;
    metadata: Partial<AssetMetadata>;
    source: Partial<AssetSource>;
    storageRef: StorageReference;
    createdBy: string;
  }): Promise<Asset> {
    const assetId = `asset_${crypto.randomUUID().replace(/-/g, "")}`;
    const now = new Date().toISOString();
    const asset: Asset = {
      assetId,
      kind: input.kind,
      status: "draft",
      metadata: {
        title: input.metadata.title,
        description: input.metadata.description,
        tags: input.metadata.tags ?? [],
        mimeType: input.metadata.mimeType,
        sizeBytes: input.metadata.sizeBytes,
        dimensions: input.metadata.dimensions,
        durationMs: input.metadata.durationMs,
        format: input.metadata.format,
        encoding: input.metadata.encoding,
        language: input.metadata.language,
        pages: input.metadata.pages,
        custom: input.metadata.custom ?? {},
      },
      source: {
        executionId: input.source.executionId,
        workflowId: input.source.workflowId,
        gatewayId: input.source.gatewayId,
        promptId: input.source.promptId,
        capabilityId: input.source.capabilityId,
      },
      storageRef: input.storageRef,
      currentVersion: "1.0.0",
      preview: {},
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };
    this.assets.set(assetId, asset);
    return asset;
  }

  async get(assetId: AssetId): Promise<Asset | undefined> {
    return this.assets.get(assetId);
  }

  async update(assetId: AssetId, patch: Partial<Asset>): Promise<Asset | undefined> {
    const existing = this.assets.get(assetId);
    if (!existing) return undefined;
    const updated: Asset = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.assets.set(assetId, updated);
    return updated;
  }

  async delete(assetId: AssetId): Promise<void> {
    this.assets.delete(assetId);
  }

  async list(query: Partial<AssetSearchQuery>): Promise<Asset[]> {
    let results = Array.from(this.assets.values());

    if (query.kind) results = results.filter((a) => a.kind === query.kind);
    if (query.status) results = results.filter((a) => a.status === query.status);
    if (query.createdBy) results = results.filter((a) => a.createdBy === query.createdBy);
    if (query.tags?.length) results = results.filter((a) => query.tags!.some((t) => a.metadata.tags.includes(t)));
    if (query.sourceExecutionId) results = results.filter((a) => a.source.executionId === query.sourceExecutionId);
    if (query.sourceWorkflowId) results = results.filter((a) => a.source.workflowId === query.sourceWorkflowId);
    if (query.sourceGatewayId) results = results.filter((a) => a.source.gatewayId === query.sourceGatewayId);
    if (query.sourcePromptId) results = results.filter((a) => a.source.promptId === query.sourcePromptId);
    if (typeof query.limit === "number") results = results.slice(0, query.limit);

    return results;
  }
}
