export type AdminRole = "admin" | "super_admin";

export interface AdminCredentials {
  email: string;
  password: string;
  adminKey: string;
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

export type AdminLoginFailureReason = "invalid_master_key" | "invalid_credentials" | "account_inactive";

export interface AdminLoginResult {
  success: boolean;
  session?: AdminSession;
  reason?: AdminLoginFailureReason;
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
