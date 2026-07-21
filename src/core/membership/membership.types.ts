export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  roleId: string | null;
  status: "active" | "pending" | "removed";
  joinedAt: Date;
  invitedBy: string | null;
  leftAt: Date | null;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  roleId: string | null;
  status: "active" | "pending" | "removed";
  joinedAt: Date;
}

export interface Invitation {
  id: string;
  email: string;
  workspaceId: string | null;
  organizationId: string | null;
  roleId: string | null;
  token: string;
  invitedBy: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

export interface InviteInput {
  email: string;
  workspaceId?: string | null;
  organizationId?: string | null;
  roleId?: string | null;
  invitedBy: string;
  expiresInHours?: number;
}

export interface AcceptInvitationInput {
  token: string;
  userId: string;
}

export interface MembershipResult {
  success: boolean;
  member?: WorkspaceMember | OrganizationMember;
  invitation?: Invitation;
  error?: string;
}
