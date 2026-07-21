export type AdminRole = "admin" | "super_admin";

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface AdminSession {
  id: string;
  token: string;
  adminId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AdminLoginResult {
  success: boolean;
  session?: AdminSession;
  requiresMasterKey?: boolean;
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
