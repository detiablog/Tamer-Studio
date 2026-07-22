import type { Workspace } from '@/core/workspace/workspace.types';

export function createWorkspaceFixture(overrides?: Partial<Workspace>): Workspace {
  return {
    id: 'ws_test_001',
    name: 'Test Workspace',
    slug: 'test-workspace',
    type: 'personal',
    ownerId: 'user_001',
    organizationId: null,
    settings: {},
    limits: {},
    status: 'active',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  };
}
