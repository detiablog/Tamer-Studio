interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = { maxRequests: 100, windowMs: 60 * 1000 };

export function checkRateLimit(key: string, config: Partial<RateLimitConfig> = {}): { allowed: boolean; remaining: number; resetAt: number } {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + cfg.windowMs });
    return { allowed: true, remaining: cfg.maxRequests - 1, resetAt: now + cfg.windowMs };
  }
  if (entry.count >= cfg.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count++;
  return { allowed: true, remaining: cfg.maxRequests - entry.count, resetAt: entry.resetAt };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}

export function getRateLimitStats(): { totalKeys: number; activeKeys: number } {
  const now = Date.now();
  let activeKeys = 0;
  for (const entry of store.values()) {
    if (now <= entry.resetAt) activeKeys++;
  }
  return { totalKeys: store.size, activeKeys };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60000);
