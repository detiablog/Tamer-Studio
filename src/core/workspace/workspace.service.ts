import type { Workspace, CreateWorkspaceInput, UpdateWorkspaceInput } from "./workspace.types";
import { WorkspaceRepository } from "./workspace.repository";
import { logAction } from "@/core/audit";

export class WorkspaceService {
  private repository = new WorkspaceRepository();

  async getWorkspace(workspaceId: string): Promise<Workspace> {
    const ws = await this.repository.getWorkspace(workspaceId);
    if (!ws) throw new Error("Workspace not found");
    return ws;
  }

  async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    const ws = await this.repository.createWorkspace(input);
    logAction("workspace.created", undefined, undefined, { workspaceId: ws.id, ownerId: input.ownerId, type: input.type });
    return ws;
  }

  async updateWorkspace(workspaceId: string, input: UpdateWorkspaceInput): Promise<Workspace> {
    const ws = await this.repository.updateWorkspace(workspaceId, input);
    logAction("workspace.updated", undefined, undefined, { workspaceId, changes: input });
    return ws;
  }

  async transferOwnership(workspaceId: string, fromOwnerId: string, toOwnerId: string): Promise<void> {
    await this.repository.transferOwnership(workspaceId, fromOwnerId, toOwnerId);
    logAction("workspace.transferred", undefined, undefined, { workspaceId, fromOwnerId, toOwnerId });
  }

  async softDelete(workspaceId: string, deletedBy: string): Promise<void> {
    await this.repository.softDelete(workspaceId, deletedBy);
    logAction("workspace.deleted", undefined, undefined, { workspaceId, deletedBy });
  }

  async isOwner(workspaceId: string, userId: string): Promise<boolean> {
    return this.repository.isOwner(workspaceId, userId);
  }
}
