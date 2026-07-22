import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateEnv, getEnv, getOptionalEnv } from '@/core/config/env';

describe('config', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  it('validates env when required vars are present', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
    process.env.BETTER_AUTH_SECRET = 'secret123';
    process.env.ADMIN_MASTER_KEY = 'master123';
    expect(() => validateEnv()).not.toThrow();
  });

  it('throws when required env vars are missing', () => {
    delete process.env.DATABASE_URL;
    delete process.env.BETTER_AUTH_SECRET;
    delete process.env.ADMIN_MASTER_KEY;
    expect(() => validateEnv()).toThrow('Missing required environment variables: DATABASE_URL, BETTER_AUTH_SECRET, ADMIN_MASTER_KEY');
  });

  it('reads env var value via getEnv', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
    process.env.BETTER_AUTH_SECRET = 'secret123';
    process.env.ADMIN_MASTER_KEY = 'master123';
    expect(getEnv('DATABASE_URL')).toBe('postgresql://user:pass@localhost:5432/test');
  });

  it('returns default for missing optional env var', () => {
    expect(getOptionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')).toBe('http://localhost:3000');
  });

  it('returns existing value for optional env var', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3001';
    expect(getOptionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')).toBe('http://localhost:3001');
  });

  it('loads config with required env vars present', async () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
    process.env.BETTER_AUTH_SECRET = 'secret123';
    process.env.ADMIN_MASTER_KEY = 'master123';
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();
    const { loadConfig } = await import('@/core/config/config');
    const config = loadConfig();
    expect(config.database.url).toBe('postgresql://user:pass@localhost:5432/test');
    expect(config.auth.secret).toBe('secret123');
    expect(config.admin.masterKey).toBe('master123');
    expect(config.app.env).toBe('development');
  });
});
