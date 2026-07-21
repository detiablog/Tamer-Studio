export interface Role {
  id: string;
  name: string;
  description: string | null;
  level: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleInput {
  name: string;
  description?: string | null;
  level?: string;
  isSystem?: boolean;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string | null;
  level?: string;
  isSystem?: boolean;
}
