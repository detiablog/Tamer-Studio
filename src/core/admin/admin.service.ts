import { adminRepository } from "./admin.repository";

export class AdminService {
  async getAdminProfile(adminId: string): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
  } | undefined> {
    const record = await adminRepository.findById(adminId);
    if (!record) return undefined;
    return {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role,
      isActive: record.isActive,
      lastLoginAt: record.lastLoginAt ?? undefined,
      createdAt: record.createdAt,
    };
  }
}
