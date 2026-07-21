export interface Permission {
  id: string;
  key: string;
  description: string | null;
  category: string | null;
  createdAt: Date;
}

export interface CreatePermissionInput {
  key: string;
  description?: string | null;
  category?: string | null;
}
