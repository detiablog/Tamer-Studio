# Import Side Effects V2

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-02C

---

## Changes Made

This sprint converted module-level external resource creation to lazy initialization patterns.

### Pattern Used

```typescript
// Before (BAD)
const redis = new Redis({ url: ..., token: ... });
export const limiter = new Ratelimit({ redis, ... });

// After (GOOD)
let redisClient: Redis | null = null;
let limiterInstance: Ratelimit | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({ url: ..., token: ... });
  }
  return redisClient;
}

export function getLimiter(): Ratelimit {
  if (!limiterInstance) {
    limiterInstance = new Ratelimit({ redis: getRedisClient(), ... });
  }
  return limiterInstance;
}

// Backward compatibility proxy
export const limiter = new Proxy({} as Ratelimit, {
  get(_, prop) {
    return (getLimiter() as any)[prop];
  },
});
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/core/security/ratelimit.ts` | Redis and 3 Ratelimit instances converted to lazy |
| `src/core/storage/storage-engine.ts` | LocalStorage and AssetService converted to lazy |
| `src/core/media/media.service.ts` | AssetService converted to lazy singleton |
| `src/core/commerce/commerce-runtime.ts` | 4 services converted to lazy |
| `src/app/api/payment/webhook/route.ts` | StripeGateway converted to lazy |
| `src/app/api/commerce/webhook/route.ts` | StripeGateway converted to lazy |

---

## Import Side Effect Matrix

| Module | Before | After | External Resource |
|--------|--------|-------|-------------------|
| `@/core/security/ratelimit` | Creates Redis + 3 Ratelimit at import | Lazy getters | Redis |
| `@/core/storage/storage-engine` | Creates LocalStorage + AssetService at import | Lazy getters | Storage |
| `@/core/media/media.service` | Creates AssetService per instance | Lazy singleton | Storage |
| `@/core/commerce/commerce-runtime` | Creates 4 services at import | Lazy getters | Stripe |
| `@/app/api/payment/webhook` | Creates StripeGateway at import | Lazy getter | Stripe |
| `@/app/api/commerce/webhook` | Creates StripeGateway at import | Lazy getter | Stripe |

---

## Backward Compatibility

All changes maintain backward compatibility through:
1. Lazy getter functions
2. Proxy objects for existing exports
3. Same API surface

Existing code like `authLimiter.limit()` continues to work without changes.
