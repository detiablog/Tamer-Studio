import type { AssetGraph, AssetId, AssetGraphEdge, AssetGraphNode } from "../types";

export interface GraphService {
  buildGraph(_filter?: { assetIds?: AssetId[] }): Promise<AssetGraph>;
  getNeighbors(assetId: AssetId): Promise<{ nodes: AssetGraphNode[]; edges: AssetGraphEdge[] }>;
  findPath(from: AssetId, to: AssetId): Promise<AssetGraphEdge[] | undefined>;
}

export class InMemoryGraphService implements GraphService {
  private nodes: Map<AssetId, AssetGraphNode> = new Map();
  private edges: Map<string, AssetGraphEdge> = new Map();

  addNode(node: AssetGraphNode): void {
    this.nodes.set(node.assetId, node);
  }

  addEdge(edge: AssetGraphEdge): void {
    const key = `${edge.from}->${edge.to}`;
    this.edges.set(key, edge);
  }

  async buildGraph(_filter?: { assetIds?: AssetId[] }): Promise<AssetGraph> {
    const nodes = Array.from(this.nodes.values());
    const edges = Array.from(this.edges.values());
    return { nodes, edges };
  }

  async getNeighbors(assetId: AssetId): Promise<{ nodes: AssetGraphNode[]; edges: AssetGraphEdge[] }> {
    const neighbors: AssetGraphNode[] = [];
    const edges: AssetGraphEdge[] = [];

    for (const edge of this.edges.values()) {
      if (edge.from === assetId) {
        const node = this.nodes.get(edge.to);
        if (node) neighbors.push(node);
        edges.push(edge);
      } else if (edge.to === assetId) {
        const node = this.nodes.get(edge.from);
        if (node) neighbors.push(node);
        edges.push(edge);
      }
    }

    return { nodes: neighbors, edges };
  }

  async findPath(from: AssetId, to: AssetId): Promise<AssetGraphEdge[] | undefined> {
    const visited = new Set<string>();
    const queue: { nodeId: AssetId; path: AssetGraphEdge[] }[] = [{ nodeId: from, path: [] }];
    visited.add(from);

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      if (nodeId === to) return path;

      for (const edge of this.edges.values()) {
        const next = edge.from === nodeId ? edge.to : edge.to === nodeId ? edge.from : null;
        if (next && !visited.has(next)) {
          visited.add(next);
          queue.push({ nodeId: next, path: [...path, edge] });
        }
      }
    }

    return undefined;
  }
}
