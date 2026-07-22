import type { Workspace } from '@/core/workspace/workspace.types';

export class MockWorkspaceRepository {
  private data: Map<string, Workspace> = new Map();

  async getWorkspace(workspaceId: string): Promise<Workspace | undefined> {
    return this.data.get(workspaceId);
  }

  async getWorkspacesByOwner(_ownerId: string): Promise<Workspace[]> {
    return Array.from(this.data.values());
  }

  async getWorkspacesByOrganization(_organizationId: string): Promise<Workspace[]> {
    return Array.from(this.data.values());
  }

  async createWorkspace(input: { name: string; slug: string; type: string; ownerId: string; organizationId?: string | null; settings?: Record<string, unknown>; limits?: Record<string, unknown> }): Promise<Workspace> {
    const id = `ws_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    const workspace: Workspace = {
      id,
      name: input.name,
      slug: input.slug,
      type: input.type as Workspace['type'],
      ownerId: input.ownerId,
      organizationId: input.organizationId ?? null,
      settings: input.settings ?? {},
      limits: input.limits ?? {},
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.data.set(id, workspace);
    return workspace;
  }

  async updateWorkspace(workspaceId: string, input: Partial<Workspace>): Promise<Workspace> {
    const existing = this.data.get(workspaceId);
    if (!existing) throw new Error('Workspace not found');
    const updated = { ...existing, ...input, updatedAt: new Date() };
    this.data.set(workspaceId, updated);
    return updated;
  }

  async transferOwnership(_workspaceId: string, _fromOwnerId: string, _toOwnerId: string): Promise<void> {
    return;
  }

  async softDelete(workspaceId: string, _deletedBy: string): Promise<void> {
    const existing = this.data.get(workspaceId);
    if (!existing) throw new Error('Workspace not found');
    const deleted = { ...existing, status: 'deleted' as const, updatedAt: new Date() } as Workspace;
    this.data.set(workspaceId, deleted);
  }

  async isOwner(workspaceId: string, userId: string): Promise<boolean> {
    const ws = this.data.get(workspaceId);
    return ws?.ownerId === userId;
  }

  seed(workspace: Workspace) {
    this.data.set(workspace.id, workspace);
  }

  clear() {
    this.data.clear();
  }
}
