import { db } from "@/lib/db";
import { invitation, workspaceMember, organizationMember } from "@/lib/db/schema/identity";
import { eq, and, desc } from "drizzle-orm";
import type { Invitation, InviteInput, AcceptInvitationInput, MembershipResult, WorkspaceMember, OrganizationMember } from "./membership.types";
import { randomUUID } from "crypto";
import { logAction } from "@/core/audit";

export class MembershipRepository {
  async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    const rows = await db.select().from(invitation).where(eq(invitation.token, token)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapInvitation(rows[0]);
  }

  async getPendingInvitations(email: string): Promise<Invitation[]> {
    const rows = await db.select().from(invitation)
      .where(and(eq(invitation.email, email), eq(invitation.status, "pending")))
      .orderBy(desc(invitation.createdAt));
    return rows.map(this.mapInvitation);
  }

  async getWorkspaceMember(workspaceId: string, userId: string): Promise<WorkspaceMember | undefined> {
    const rows = await db.select().from(workspaceMember).where(and(eq(workspaceMember.workspaceId, workspaceId), eq(workspaceMember.userId, userId))).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapWorkspaceMember(rows[0]);
  }

  async getOrganizationMember(organizationId: string, userId: string): Promise<OrganizationMember | undefined> {
    const rows = await db.select().from(organizationMember).where(and(eq(organizationMember.organizationId, organizationId), eq(organizationMember.userId, userId))).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapOrganizationMember(rows[0]);
  }

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const rows = await db.select().from(workspaceMember).where(eq(workspaceMember.workspaceId, workspaceId)).orderBy(workspaceMember.joinedAt);
    return rows.map(this.mapWorkspaceMember);
  }

  async getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
    const rows = await db.select().from(organizationMember).where(eq(organizationMember.organizationId, organizationId)).orderBy(organizationMember.joinedAt);
    return rows.map(this.mapOrganizationMember);
  }

  async inviteToWorkspace(input: InviteInput): Promise<Invitation> {
    const id = `inv_${randomUUID()}`;
    const token = `inv_${randomUUID()}`;
    const expiresAt = new Date(Date.now() + (input.expiresInHours ?? 72) * 60 * 60 * 1000);
    const inv: Invitation = {
      id,
      email: input.email,
      workspaceId: input.workspaceId ?? null,
      organizationId: input.organizationId ?? null,
      roleId: input.roleId ?? null,
      token,
      invitedBy: input.invitedBy,
      status: "pending",
      expiresAt,
      acceptedAt: null,
      createdAt: new Date(),
    };
    await db.insert(invitation).values({
      id,
      email: input.email,
      workspaceId: input.workspaceId ?? undefined,
      organizationId: input.organizationId ?? undefined,
      roleId: input.roleId ?? undefined,
      token,
      invitedBy: input.invitedBy,
      status: inv.status,
      expiresAt,
      acceptedAt: undefined,
      createdAt: inv.createdAt,
    });
    logAction("membership.invited", undefined, undefined, {  invitationId: id, email: input.email, workspaceId: input.workspaceId, organizationId: input.organizationId  });
    return inv;
  }

  async acceptInvitation(input: AcceptInvitationInput): Promise<MembershipResult> {
    const inv = await this.getInvitationByToken(input.token);
    if (!inv) return { success: false, error: "Invitation not found" };
    if (inv.status !== "pending") return { success: false, error: "Invitation is not pending" };
    if (inv.expiresAt < new Date()) {
      await db.update(invitation).set({ status: "expired" }).where(eq(invitation.id, inv.id));
      return { success: false, error: "Invitation expired" };
    }
    const now = new Date();
    await db.update(invitation).set({ status: "accepted", acceptedAt: now }).where(eq(invitation.id, inv.id));
    if (inv.workspaceId) {
      await db.insert(workspaceMember).values({
        id: `wm_${randomUUID()}`,
        workspaceId: inv.workspaceId,
        userId: input.userId,
        roleId: inv.roleId ?? undefined,
        status: "active",
        joinedAt: now,
        invitedBy: inv.invitedBy,
        leftAt: undefined,
      });
    }
    if (inv.organizationId) {
      await db.insert(organizationMember).values({
        id: `om_${randomUUID()}`,
        organizationId: inv.organizationId,
        userId: input.userId,
        roleId: inv.roleId ?? undefined,
        status: "active",
        joinedAt: now,
      });
    }
    logAction("membership.accepted", undefined, undefined, {  invitationId: inv.id, userId: input.userId  });
    return { success: true, invitation: inv };
  }

  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
    const now = new Date();
    await db.update(workspaceMember).set({ status: "removed", leftAt: now }).where(and(eq(workspaceMember.workspaceId, workspaceId), eq(workspaceMember.userId, userId)));
    logAction("membership.removed", undefined, undefined, {  workspaceId, userId  });
  }

  async removeOrganizationMember(organizationId: string, userId: string): Promise<void> {
    await db.update(organizationMember).set({ status: "removed" }).where(and(eq(organizationMember.organizationId, organizationId), eq(organizationMember.userId, userId)));
    logAction("membership.removed", undefined, undefined, {  organizationId, userId  });
  }

  private mapInvitation(row: typeof invitation.$inferSelect): Invitation {
    return {
      id: row.id,
      email: row.email,
      workspaceId: row.workspaceId,
      organizationId: row.organizationId,
      roleId: row.roleId,
      token: row.token,
      invitedBy: row.invitedBy,
      status: row.status as Invitation["status"],
      expiresAt: row.expiresAt,
      acceptedAt: row.acceptedAt,
      createdAt: row.createdAt,
    };
  }

  private mapWorkspaceMember(row: typeof workspaceMember.$inferSelect): WorkspaceMember {
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      userId: row.userId,
      roleId: row.roleId,
      status: row.status as WorkspaceMember["status"],
      joinedAt: row.joinedAt,
      invitedBy: row.invitedBy,
      leftAt: row.leftAt,
    };
  }

  private mapOrganizationMember(row: typeof organizationMember.$inferSelect): OrganizationMember {
    return {
      id: row.id,
      organizationId: row.organizationId,
      userId: row.userId,
      roleId: row.roleId,
      status: row.status as OrganizationMember["status"],
      joinedAt: row.joinedAt,
    };
  }
}
