export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  settings: Record<string, unknown>;
  status: "active" | "suspended" | "deleted";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  ownerId: string;
  settings?: Record<string, unknown>;
}

export interface UpdateOrganizationInput {
  name?: string;
  settings?: Record<string, unknown>;
  status?: "active" | "suspended" | "deleted";
}
