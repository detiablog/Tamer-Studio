import { describe, it, expect } from 'vitest';

describe('integration: routing', () => {
  it('resolves landing page', async () => {
    const mod = await import('@/app/page');
    expect(mod.default).toBeDefined();
  });

  it('resolves login page', async () => {
    const mod = await import('@/app/(auth)/login/page');
    expect(mod.default).toBeDefined();
  });

  it('resolves register page', async () => {
    const mod = await import('@/app/(auth)/register/page');
    expect(mod.default).toBeDefined();
  });

  it('resolves dashboard page', async () => {
    const mod = await import('@/app/dashboard/page');
    expect(mod.default).toBeDefined();
  });

  it('resolves health API route', async () => {
    const mod = await import('@/app/api/health/route');
    expect(mod.GET).toBeDefined();
  });

  it('resolves auth API route', async () => {
    const mod = await import('@/app/api/auth/[...all]/route');
    expect(mod.GET).toBeDefined();
    expect(mod.POST).toBeDefined();
  });
});
