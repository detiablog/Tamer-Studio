import { db } from "@/lib/db";
import { workspace, workspaceTransfer } from "@/lib/db/schema/identity";
import { eq, desc } from "drizzle-orm";
import type { Workspace, CreateWorkspaceInput, UpdateWorkspaceInput } from "./workspace.types";
import { randomUUID } from "crypto";
import { logAction } from "@/core/audit";

export class WorkspaceRepository {
  async getWorkspace(workspaceId: string): Promise<Workspace | undefined> {
    const rows = await db.select().from(workspace).where(eq(workspace.id, workspaceId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapWorkspace(rows[0]);
  }

  async getWorkspacesByOwner(ownerId: string): Promise<Workspace[]> {
    const rows = await db.select().from(workspace).where(eq(workspace.ownerId, ownerId)).orderBy(desc(workspace.createdAt));
    return rows.map(this.mapWorkspace);
  }

  async getWorkspacesByOrganization(organizationId: string): Promise<Workspace[]> {
    const rows = await db.select().from(workspace).where(eq(workspace.organizationId, organizationId)).orderBy(desc(workspace.createdAt));
    return rows.map(this.mapWorkspace);
  }

  async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    const id = `ws_${randomUUID()}`;
    const now = new Date();
    const ws: Workspace = {
      id,
      name: input.name,
      slug: input.slug,
      type: input.type,
      ownerId: input.ownerId,
      organizationId: input.organizationId ?? null,
      settings: input.settings ?? {},
      limits: input.limits ?? {},
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(workspace).values({
      id,
      name: input.name,
      slug: input.slug,
      type: input.type,
      ownerId: input.ownerId,
      organizationId: input.organizationId ?? undefined,
      settings: ws.settings,
      limits: ws.limits,
      status: ws.status,
      createdAt: now,
      updatedAt: now,
    });
    logAction("workspace.created", undefined, undefined, {  workspaceId: id, ownerId: input.ownerId, type: input.type  });
    return ws;
  }

  async updateWorkspace(workspaceId: string, input: UpdateWorkspaceInput): Promise<Workspace> {
    const existing = await this.getWorkspace(workspaceId);
    if (!existing) throw new Error("Workspace not found");
    const now = new Date();
    const updates: Record<string, unknown> = { updatedAt: now };
    if (input.name !== undefined) updates.name = input.name;
    if (input.settings !== undefined) updates.settings = input.settings;
    if (input.limits !== undefined) updates.limits = input.limits;
    if (input.status !== undefined) updates.status = input.status;
    await db.update(workspace).set(updates).where(eq(workspace.id, workspaceId));
    logAction("workspace.updated", undefined, undefined, {  workspaceId, changes: input  });
    return { ...existing, ...updates } as Workspace;
  }

  async transferOwnership(workspaceId: string, fromOwnerId: string, toOwnerId: string): Promise<void> {
    const existing = await this.getWorkspace(workspaceId);
    if (!existing) throw new Error("Workspace not found");
    if (existing.ownerId !== fromOwnerId) throw new Error("Only owner can transfer workspace");
    const now = new Date();
    await db.update(workspace).set({ ownerId: toOwnerId, updatedAt: now }).where(eq(workspace.id, workspaceId));
    await db.insert(workspaceTransfer).values({
      id: `wt_${randomUUID()}`,
      workspaceId,
      fromOwnerId,
      toOwnerId,
      transferredAt: now,
    });
    logAction("workspace.transferred", undefined, undefined, {  workspaceId, fromOwnerId, toOwnerId  });
  }

  async softDelete(workspaceId: string, deletedBy: string): Promise<void> {
    const now = new Date();
    await db.update(workspace).set({ status: "deleted", updatedAt: now }).where(eq(workspace.id, workspaceId));
    logAction("workspace.deleted", undefined, undefined, {  workspaceId, deletedBy  });
  }

  async isOwner(workspaceId: string, userId: string): Promise<boolean> {
    const ws = await this.getWorkspace(workspaceId);
    return ws?.ownerId === userId;
  }

  private mapWorkspace(row: typeof workspace.$inferSelect): Workspace {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      type: row.type as Workspace["type"],
      ownerId: row.ownerId,
      organizationId: row.organizationId,
      settings: row.settings as Record<string, unknown>,
      limits: row.limits as Record<string, unknown>,
      status: row.status as Workspace["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
