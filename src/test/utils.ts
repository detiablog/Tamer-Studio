import { vi } from 'vitest';

export function createMockDate(date: string | Date): Date {
  return new Date(date);
}

export function cleanup() {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
}
