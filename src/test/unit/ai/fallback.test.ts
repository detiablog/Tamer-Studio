import { describe, it, expect } from 'vitest';
import { DefaultFallbackManager } from '@/core/ai/fallback/fallback-manager';

describe('DefaultFallbackManager', () => {
  const manager = new DefaultFallbackManager();

  it('returns fallback chain excluding failed provider', () => {
    const chain = ['prov-a', 'prov-b', 'prov-c'];
    const result = manager.getFallbackChain('prov-b', chain);
    expect(result).toEqual(['prov-a', 'prov-c']);
  });

  it('returns first available provider', () => {
    const result = manager.selectFallback('prov-a', ['prov-b', 'prov-c']);
    expect(result).toBe('prov-b');
  });

  it('returns undefined when all providers are excluded', () => {
    const result = manager.selectFallback('prov-a', ['prov-a']);
    expect(result).toBeUndefined();
  });
});
