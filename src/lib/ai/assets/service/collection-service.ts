import type { Asset, AssetId, AssetCollection, CollectionVisibility } from "../types";

export interface CollectionService {
  createCollection(input: {
    name: string;
    description?: string;
    visibility: CollectionVisibility;
    createdBy: string;
  }): Promise<AssetCollection>;
  getCollection(collectionId: string): Promise<AssetCollection | undefined>;
  listCollections(): Promise<AssetCollection[]>;
  addToCollection(collectionId: string, assetId: AssetId): Promise<void>;
  removeFromCollection(collectionId: string, assetId: AssetId): Promise<void>;
  getCollectionAssets(collectionId: string): Promise<Asset[]>;
}

export class InMemoryCollectionService implements CollectionService {
  private collections: Map<string, AssetCollection> = new Map();
  private items: Map<string, Set<string>> = new Map();

  async createCollection(input: {
    name: string;
    description?: string;
    visibility: CollectionVisibility;
    createdBy: string;
  }): Promise<AssetCollection> {
    const id = `collection_${crypto.randomUUID().replace(/-/g, "")}`;
    const now = new Date().toISOString();
    const collection: AssetCollection = {
      id,
      name: input.name,
      description: input.description,
      visibility: input.visibility,
      assetIds: [],
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };
    this.collections.set(id, collection);
    this.items.set(id, new Set());
    return collection;
  }

  async getCollection(collectionId: string): Promise<AssetCollection | undefined> {
    return this.collections.get(collectionId);
  }

  async listCollections(): Promise<AssetCollection[]> {
    return Array.from(this.collections.values());
  }

  async addToCollection(collectionId: string, assetId: AssetId): Promise<void> {
    const collection = this.collections.get(collectionId);
    if (!collection) return;
    const itemSet = this.items.get(collectionId) ?? new Set();
    itemSet.add(assetId);
    this.items.set(collectionId, itemSet);
    collection.assetIds = Array.from(itemSet);
    collection.updatedAt = new Date().toISOString();
    this.collections.set(collectionId, collection);
  }

  async removeFromCollection(collectionId: string, assetId: AssetId): Promise<void> {
    const collection = this.collections.get(collectionId);
    if (!collection) return;
    const itemSet = this.items.get(collectionId) ?? new Set();
    itemSet.delete(assetId);
    this.items.set(collectionId, itemSet);
    collection.assetIds = Array.from(itemSet);
    collection.updatedAt = new Date().toISOString();
    this.collections.set(collectionId, collection);
  }

  async getCollectionAssets(_collectionId: string): Promise<Asset[]> {
    return [];
  }
}
