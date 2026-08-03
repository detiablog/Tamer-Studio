# Resource Lifecycle

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-02C

---

## Resource Lifecycle Documentation

### Redis (Upstash REST)

```
Application Start
    ↓
No Redis client created
    ↓
First rate limit check
    ↓
getRedisClient() called
    ↓
new Redis({ url, token })
    ↓
Client stored in singleton
    ↓
Subsequent calls reuse client
```

**Connection Management:**
- Stateless HTTP REST API
- No persistent connections
- Automatic retry on failure
- Fail-open on timeout

**Memory:**
- ~1KB client object
- No connection pooling needed

---

### Rate Limiters

```
Application Start
    ↓
No limiters created
    ↓
First rate limit check
    ↓
getAuthLimiter() / getApiLimiter() / getProductionLimiter()
    ↓
new Ratelimit({ redis: getRedisClient(), ... })
    ↓
Limiter stored in singleton
    ↓
Subsequent calls reuse limiter
```

**Configuration:**
- Auth: 5 requests per 15 minutes
- API: 100 requests per minute
- Production: 20 requests per hour

---

### Storage (LocalStorage)

```
Application Start
    ↓
No storage created
    ↓
First storage operation
    ↓
getDefaultStorage() called
    ↓
new LocalStorage()
    ↓
Storage stored in singleton
    ↓
Subsequent calls reuse storage
```

**File System:**
- Base directory from `ASSET_STORAGE_DIR` env var
- Default: `/tmp/tamer-assets`
- Automatic directory creation on store

---

### AssetService

```
Application Start
    ↓
No AssetService created
    ↓
First asset operation
    ↓
getAssetService() called
    ↓
new AssetService(getDefaultStorage())
    ↓
Service stored in singleton
    ↓
Subsequent calls reuse service
```

**Wraps:**
- LocalStorage (default)
- R2Storage (optional)
- S3Storage (optional)

---

### StripeGateway

```
Application Start
    ↓
No Stripe client created
    ↓
First payment operation
    ↓
getGateway() called
    ↓
new StripeGateway()
    ↓
Gateway stored in singleton
    ↓
First Stripe API call
    ↓
getStripe() called (internal)
    ↓
new Stripe(key, { apiVersion })
    ↓
Client stored in singleton
    ↓
Subsequent calls reuse client
```

**API Version:** `2025-05-28.basil`

---

## Error Handling

All resources implement graceful degradation:

| Resource | Error Behavior | Fallback |
|----------|---------------|----------|
| Redis | Catch and log | Fail open |
| Rate Limiters | Catch and log | Allow request |
| Storage | Catch and log | Return null |
| Stripe | Throw error | Caller handles |

---

## Shutdown

| Resource | Shutdown Required | Implementation |
|----------|-------------------|----------------|
| Redis | No (REST API) | N/A |
| Rate Limiters | No | N/A |
| Storage | No | N/A |
| Stripe | No (HTTP client) | N/A |

All resources are stateless HTTP clients or filesystem wrappers. No explicit shutdown is required.
