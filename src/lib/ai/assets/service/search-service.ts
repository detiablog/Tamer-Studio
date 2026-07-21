import type { AssetId, AssetSearchQuery, AssetSearchResult } from "../types";

export interface SearchService {
  indexAsset(asset: {
    assetId: AssetId;
    kind: string;
    status: string;
    metadata: Record<string, unknown>;
  }): Promise<void>;
  search(query: AssetSearchQuery): Promise<AssetSearchResult[]>;
  removeFromIndex(assetId: AssetId): Promise<void>;
}

export class InMemorySearchService implements SearchService {
  private index: Map<string, { assetId: string; kind: string; status: string; metadata: Record<string, unknown> }> = new Map();

  async indexAsset(asset: {
    assetId: AssetId;
    kind: string;
    status: string;
    metadata: Record<string, unknown>;
  }): Promise<void> {
    this.index.set(asset.assetId, {
      assetId: asset.assetId,
      kind: asset.kind,
      status: asset.status,
      metadata: asset.metadata,
    });
  }

  async search(query: AssetSearchQuery): Promise<AssetSearchResult[]> {
    let results = Array.from(this.index.values()).map((item) => ({
      assetId: item.assetId,
      kind: item.kind as AssetSearchResult["kind"],
      status: item.status as AssetSearchResult["status"],
      metadata: item.metadata,
      score: 1,
    }));

    if (query.query) {
      const q = query.query.toLowerCase();
      results = results.filter((r) => {
        const text = JSON.stringify(r.metadata).toLowerCase();
        return text.includes(q);
      });
    }
    if (query.kind) results = results.filter((r) => r.kind === query.kind);
    if (query.status) results = results.filter((r) => r.status === query.status);
    if (query.tags?.length) {
      results = results.filter((r) => query.tags!.some((t) => (r.metadata.tags as string[])?.includes(t)));
    }
    if (query.createdBy) results = results.filter((r) => (r.metadata.createdBy as string) === query.createdBy);
    if (query.limit) results = results.slice(0, query.limit);

    return results;
  }

  async removeFromIndex(assetId: AssetId): Promise<void> {
    this.index.delete(assetId);
  }
}
