import type { Invitation, InviteInput, AcceptInvitationInput, MembershipResult, WorkspaceMember, OrganizationMember } from "./membership.types";
import { MembershipRepository } from "./membership.repository";

export class MembershipService {
  private repository = new MembershipRepository();

  async inviteToWorkspace(input: InviteInput): Promise<Invitation> {
    if (!input.workspaceId && !input.organizationId) {
      throw new Error("Must specify workspace or organization");
    }
    return this.repository.inviteToWorkspace(input);
  }

  async acceptInvitation(input: AcceptInvitationInput): Promise<MembershipResult> {
    return this.repository.acceptInvitation(input);
  }

  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
    return this.repository.removeWorkspaceMember(workspaceId, userId);
  }

  async removeOrganizationMember(organizationId: string, userId: string): Promise<void> {
    return this.repository.removeOrganizationMember(organizationId, userId);
  }

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.repository.getWorkspaceMembers(workspaceId);
  }

  async getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
    return this.repository.getOrganizationMembers(organizationId);
  }

  async getPendingInvitations(email: string): Promise<Invitation[]> {
    return this.repository.getPendingInvitations(email);
  }
}
