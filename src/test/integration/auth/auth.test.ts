import { describe, it, expect, beforeAll, vi } from 'vitest';

describe('integration: auth', () => {
  const originalEnv = { ...process.env };

  beforeAll(() => {
    process.env = { ...originalEnv };
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
    process.env.BETTER_AUTH_SECRET = 'secret123';
    process.env.ADMIN_MASTER_KEY = 'master123';
    vi.resetModules();
  });

  it('validates environment and loads auth config', async () => {
    const { validateEnv } = await import('@/core/config/env');
    const { loadConfig } = await import('@/core/config/config');
    expect(() => validateEnv()).not.toThrow();
    const config = loadConfig();
    expect(config.auth.secret).toBe('secret123');
    expect(config.auth.url).toBe('http://localhost:3000');
  });

  it('validates register schema in integration context', async () => {
    const { registerSchema } = await import('@/features/auth/schemas/register.schema');
    const result = registerSchema.safeParse({ name: 'Integration User', email: 'integ@test.com', password: 'securepass123' });
    expect(result.success).toBe(true);
  });

  it('validates login schema in integration context', async () => {
    const { loginSchema } = await import('@/features/auth/schemas/login.schema');
    const result = loginSchema.safeParse({ email: 'integ@test.com', password: 'securepass123' });
    expect(result.success).toBe(true);
  });
});
