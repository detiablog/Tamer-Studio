import type { UserProfile } from '@/core/users/user.types';

export function createUserFixture(overrides?: Partial<UserProfile>): UserProfile {
  return {
    userId: 'user_001',
    avatar: null,
    timezone: 'UTC',
    language: 'en',
    country: 'US',
    status: 'active',
    verificationStatus: 'verified',
    suspendedAt: null,
    suspendedBy: null,
    deletedAt: null,
    deletedBy: null,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  };
}
