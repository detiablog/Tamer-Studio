import type { Invitation, InviteInput, AcceptInvitationInput, MembershipResult, WorkspaceMember } from "./membership.types";
import { MembershipRepository } from "./membership.repository";
import { logAction } from "@/core/audit";

export class MembershipService {
  private repository = new MembershipRepository();

  async inviteToWorkspace(input: InviteInput): Promise<Invitation> {
    if (!input.workspaceId) {
      throw new Error("Must specify workspace");
    }
    const result = await this.repository.inviteToWorkspace(input);
    logAction("membership.invited", undefined, undefined, { invitationId: result.id, email: input.email, workspaceId: input.workspaceId });
    return result;
  }

  async acceptInvitation(input: AcceptInvitationInput): Promise<MembershipResult> {
    const result = await this.repository.acceptInvitation(input);
    if (result.success && result.invitation) {
      logAction("membership.accepted", undefined, undefined, { invitationId: result.invitation.id, userId: input.userId });
    }
    return result;
  }

  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
    await this.repository.removeWorkspaceMember(workspaceId, userId);
    logAction("membership.removed", undefined, undefined, { workspaceId, userId });
  }

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.repository.getWorkspaceMembers(workspaceId);
  }

  async getPendingInvitations(email: string): Promise<Invitation[]> {
    return this.repository.getPendingInvitations(email);
  }
}
