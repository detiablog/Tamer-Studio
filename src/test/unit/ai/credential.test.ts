import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultCredentialResolver } from '@/core/ai/security/credential-resolver';

const createConfigService = (secrets: Record<string, string | undefined> = {}) => ({
  getSecret: async (key: string): Promise<string | undefined> => secrets[key],
  getProviderBaseUrl: async (_providerType: string): Promise<string | undefined> => undefined,
  setSecret: async () => {},
});

describe('DefaultCredentialResolver', () => {
  it('returns workspace key first when available', async () => {
    const configService = createConfigService({
      'workspace:ws-1:provider:openai:apikey': 'workspace-key',
      'user:u-1:provider:openai:apikey': 'user-key',
      'platform:provider:openai:apikey': 'platform-key',
    });
    const resolver = new DefaultCredentialResolver(configService as any);

    const result = await resolver.resolve('prov-1', 'openai', { workspaceId: 'ws-1' });

    expect(result.apiKey).toBe('workspace-key');
    expect(result.providerType).toBe('openai');
  });

  it('falls back to user BYOK when no workspace key', async () => {
    const configService = createConfigService({
      'user:u-1:provider:openai:apikey': 'user-key',
      'platform:provider:openai:apikey': 'platform-key',
    });
    const resolver = new DefaultCredentialResolver(configService as any);

    const result = await resolver.resolve('prov-1', 'openai', { userId: 'u-1' });

    expect(result.apiKey).toBe('user-key');
  });

  it('falls back to platform key last', async () => {
    const configService = createConfigService({
      'platform:provider:openai:apikey': 'platform-key',
    });
    const resolver = new DefaultCredentialResolver(configService as any);

    const result = await resolver.resolve('prov-1', 'openai');

    expect(result.apiKey).toBe('platform-key');
  });

  it('throws when no key is available', async () => {
    const configService = createConfigService({});
    const resolver = new DefaultCredentialResolver(configService as any);

    await expect(resolver.resolve('prov-1', 'openai')).rejects.toThrow('No API key found');
  });

  it('masks secrets correctly', () => {
    const configService = createConfigService({});
    const resolver = new DefaultCredentialResolver(configService as any);

    expect(resolver.maskSecret('short')).toBe('***hort');
    expect(resolver.maskSecret('abcdefghijklmnop')).toBe('***mnop');
  });
});
