/**
 * Admin Roles — synchronized with RBAC architecture
 * 
 * Two admin-level roles:
 *   Admin    — Email/password authentication, database-driven permissions
 *   Founder  — Created during installation only, unique, requires Master Key for login
 */

export type AdminRole = "admin" | "founder";

export interface AdminCredentials {
  email: string;
  password: string;
  adminKey: string;
}

export interface AdminSession {
  id: string;
  token: string;
  adminId: string;
  role: AdminRole;
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
