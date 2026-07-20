import type { AssetId, AssetLineageEntry, AssetRelationshipType } from "../types";

export interface LineageService {
  addParent(assetId: AssetId, parentId: AssetId, relationship: AssetRelationshipType, metadata?: Record<string, unknown>): Promise<void>;
  getParents(assetId: AssetId): Promise<AssetLineageEntry[]>;
  getChildren(assetId: AssetId): Promise<AssetLineageEntry[]>;
  getLineageGraph(assetId: AssetId): Promise<AssetLineageEntry[]>;
}

export class InMemoryLineageService implements LineageService {
  private lineage: Map<string, AssetLineageEntry[]> = new Map();

  private key(assetId: AssetId): string {
    return `lineage:${assetId}`;
  }

  async addParent(assetId: AssetId, parentId: AssetId, relationship: AssetRelationshipType, metadata?: Record<string, unknown>): Promise<void> {
    const entry: AssetLineageEntry = {
      id: `lineage_${crypto.randomUUID().replace(/-/g, "")}`,
      assetId,
      parentId,
      relationship,
      metadata: metadata ?? {},
      createdAt: new Date().toISOString(),
    };

    const list = this.lineage.get(this.key(assetId)) ?? [];
    list.push(entry);
    this.lineage.set(this.key(assetId), list);
  }

  async getParents(assetId: AssetId): Promise<AssetLineageEntry[]> {
    return this.lineage.get(this.key(assetId)) ?? [];
  }

  async getChildren(_assetId: AssetId): Promise<AssetLineageEntry[]> {
    const children: AssetLineageEntry[] = [];
    for (const entry of this.lineage.values()) {
      for (const e of entry) {
        if (e.parentId === _assetId) children.push(e);
      }
    }
    return children;
  }

  async getLineageGraph(assetId: AssetId): Promise<AssetLineageEntry[]> {
    return this.lineage.get(this.key(assetId)) ?? [];
  }
}
