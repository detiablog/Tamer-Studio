import type { Asset, AssetId, AssetKind, AssetMetadata, AssetPipelineContext, AssetSearchQuery, AssetSource, AssetVersionInfo, AssetLineageEntry, AssetRelationshipType, AssetGraph, AssetSearchResult, AssetCollection, CollectionVisibility, AssetLifecycleEvent, AssetLifecycleTransition, StorageReference } from "./types";
import type { AssetPipeline } from "./pipeline/asset-pipeline";
import type { AssetService } from "./service/asset-service";
import type { VersionService } from "./service/version-service";
import type { LineageService } from "./service/lineage-service";
import type { GraphService } from "./service/graph-service";
import type { SearchService } from "./service/search-service";
import type { CollectionService } from "./service/collection-service";
import type { LifecycleService } from "./service/lifecycle-service";
import type { PreviewService } from "./service/preview-service";

export interface AssetManager {
  createAsset(input: {
    kind: AssetKind;
    metadata: Partial<AssetMetadata>;
    source: Partial<AssetSource>;
    storageRef: StorageReference;
    createdBy: string;
  }): Promise<Asset>;
  getAsset(assetId: AssetId): Promise<Asset | undefined>;
  updateAsset(assetId: AssetId, patch: Partial<Asset>): Promise<Asset | undefined>;
  deleteAsset(assetId: AssetId): Promise<void>;
  listAssets(query: Partial<AssetSearchQuery>): Promise<Asset[]>;
  createVersion(assetId: string, input: Parameters<VersionService["createVersion"]>[1]): Promise<AssetVersionInfo>;
  listVersions(assetId: string): Promise<AssetVersionInfo[]>;
  addParent(assetId: string, parentId: string, relationship: string, metadata?: Record<string, unknown>): Promise<void>;
  getParents(assetId: string): Promise<AssetLineageEntry[]>;
  getChildren(assetId: string): Promise<AssetLineageEntry[]>;
  buildGraph(filter?: { assetIds?: AssetId[] }): Promise<AssetGraph>;
  indexAsset(asset: { assetId: AssetId; kind: string; status: string; metadata: Record<string, unknown> }): Promise<void>;
  search(query: AssetSearchQuery): Promise<AssetSearchResult[]>;
  createCollection(input: { name: string; description?: string; visibility: CollectionVisibility; createdBy: string }): Promise<AssetCollection>;
  addToCollection(collectionId: string, assetId: AssetId): Promise<void>;
  getCollectionAssets(collectionId: string): Promise<Asset[]>;
  transitionAsset(assetId: string, transition: AssetLifecycleTransition, metadata?: Record<string, unknown>): Promise<AssetLifecycleEvent | undefined>;
  getAssetHistory(assetId: string): Promise<AssetLifecycleEvent[]>;
  generatePreview(asset: Asset): Promise<Asset["preview"]>;
  processPipeline(ctx: AssetPipelineContext, rawResult: Record<string, unknown>): Promise<Asset[]>;
}

export class DefaultAssetManager implements AssetManager {
  constructor(
    private assetService: AssetService,
    private versionService: VersionService,
    private lineageService: LineageService,
    private graphService: GraphService,
    private searchService: SearchService,
    private collectionService: CollectionService,
    private lifecycleService: LifecycleService,
    private previewService: PreviewService,
    private pipeline: AssetPipeline,
  ) {}

  async createAsset(input: Parameters<AssetService["create"]>[0]): Promise<Asset> {
    return this.assetService.create(input);
  }

  async getAsset(assetId: AssetId): Promise<Asset | undefined> {
    return this.assetService.get(assetId);
  }

  async updateAsset(assetId: AssetId, patch: Parameters<AssetService["update"]>[1]): Promise<Asset | undefined> {
    return this.assetService.update(assetId, patch);
  }

  async deleteAsset(assetId: AssetId): Promise<void> {
    return this.assetService.delete(assetId);
  }

  async listAssets(query: Parameters<AssetService["list"]>[0]): Promise<Asset[]> {
    return this.assetService.list(query);
  }

  async createVersion(assetId: string, input: Parameters<VersionService["createVersion"]>[1]): Promise<AssetVersionInfo> {
    return this.versionService.createVersion(assetId, input);
  }

  async listVersions(assetId: string): Promise<AssetVersionInfo[]> {
    return this.versionService.listVersions(assetId);
  }

  async addParent(assetId: string, parentId: string, relationship: string, metadata?: Record<string, unknown>): Promise<void> {
    return this.lineageService.addParent(assetId, parentId, relationship as AssetRelationshipType, metadata);
  }

  async getParents(assetId: string): Promise<AssetLineageEntry[]> {
    return this.lineageService.getParents(assetId);
  }

  async getChildren(assetId: string): Promise<AssetLineageEntry[]> {
    return this.lineageService.getChildren(assetId);
  }

  async buildGraph(filter?: Parameters<GraphService["buildGraph"]>[0]): Promise<AssetGraph> {
    return this.graphService.buildGraph(filter);
  }

  async indexAsset(asset: Parameters<SearchService["indexAsset"]>[0]): Promise<void> {
    return this.searchService.indexAsset(asset);
  }

  async search(query: AssetSearchQuery): Promise<AssetSearchResult[]> {
    return this.searchService.search(query);
  }

  async createCollection(input: Parameters<CollectionService["createCollection"]>[0]): Promise<AssetCollection> {
    return this.collectionService.createCollection(input);
  }

  async addToCollection(collectionId: string, assetId: AssetId): Promise<void> {
    return this.collectionService.addToCollection(collectionId, assetId);
  }

  async getCollectionAssets(collectionId: string): Promise<Asset[]> {
    return this.collectionService.getCollectionAssets(collectionId);
  }

  async transitionAsset(assetId: string, transition: AssetLifecycleTransition, metadata?: Record<string, unknown>): Promise<AssetLifecycleEvent | undefined> {
    return this.lifecycleService.transition(assetId, transition, metadata);
  }

  async getAssetHistory(assetId: string): Promise<AssetLifecycleEvent[]> {
    return this.lifecycleService.getHistory(assetId);
  }

  async generatePreview(asset: Asset): Promise<Asset["preview"]> {
    return this.previewService.generatePreview(asset);
  }

  async processPipeline(ctx: AssetPipelineContext, rawResult: Record<string, unknown>): Promise<Asset[]> {
    return this.pipeline.process(ctx, rawResult);
  }
}

export { InMemoryAssetService as InMemoryAssetManager } from "./service/asset-service";
export type { AssetService } from "./service/asset-service";
