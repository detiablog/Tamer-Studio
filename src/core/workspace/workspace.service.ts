import type { Workspace, CreateWorkspaceInput, UpdateWorkspaceInput } from "./workspace.types";
import { WorkspaceRepository } from "./workspace.repository";

export class WorkspaceService {
  private repository = new WorkspaceRepository();

  async getWorkspace(workspaceId: string): Promise<Workspace> {
    const ws = await this.repository.getWorkspace(workspaceId);
    if (!ws) throw new Error("Workspace not found");
    return ws;
  }

  async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    return this.repository.createWorkspace(input);
  }

  async updateWorkspace(workspaceId: string, input: UpdateWorkspaceInput): Promise<Workspace> {
    return this.repository.updateWorkspace(workspaceId, input);
  }

  async transferOwnership(workspaceId: string, fromOwnerId: string, toOwnerId: string): Promise<void> {
    return this.repository.transferOwnership(workspaceId, fromOwnerId, toOwnerId);
  }

  async softDelete(workspaceId: string, deletedBy: string): Promise<void> {
    return this.repository.softDelete(workspaceId, deletedBy);
  }

  async isOwner(workspaceId: string, userId: string): Promise<boolean> {
    return this.repository.isOwner(workspaceId, userId);
  }
}
