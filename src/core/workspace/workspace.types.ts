export interface Workspace {
  id: string;
  name: string;
  slug: string;
  type: "personal" | "team";
  ownerId: string;
  organizationId: string | null;
  settings: Record<string, unknown>;
  limits: Record<string, unknown>;
  status: "active" | "suspended" | "deleted";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkspaceInput {
  name: string;
  slug: string;
  type: "personal" | "team";
  ownerId: string;
  organizationId?: string | null;
  settings?: Record<string, unknown>;
  limits?: Record<string, unknown>;
}

export interface UpdateWorkspaceInput {
  name?: string;
  settings?: Record<string, unknown>;
  limits?: Record<string, unknown>;
  status?: "active" | "suspended" | "deleted";
}
