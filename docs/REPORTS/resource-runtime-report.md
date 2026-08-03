# Resource Runtime Report

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-02C

---

## External Resource Lifecycle

### Redis (Upstash)

| Phase | Implementation | Notes |
|-------|----------------|-------|
| Create | Lazy getter on first use | `getRedisClient()` |
| Reuse | Singleton pattern | Same instance reused |
| Reconnect | Automatic (Upstash REST) | Stateless HTTP |
| Shutdown | N/A (REST API) | No persistent connection |
| Memory | ~1KB client object | Minimal |

### Rate Limiters (Upstash Ratelimit)

| Phase | Implementation | Notes |
|-------|----------------|-------|
| Create | Lazy getter on first use | 3 limiters: auth, api, production |
| Reuse | Singleton pattern | Same instance reused |
| Reconnect | Automatic (uses Redis client) | Delegates to Redis |
| Shutdown | N/A | No cleanup needed |
| Memory | ~1KB per limiter | Minimal |

### Storage (LocalStorage)

| Phase | Implementation | Notes |
|-------|----------------|-------|
| Create | Lazy getter on first use | `getDefaultStorage()` |
| Reuse | Singleton pattern | Same instance reused |
| Reconnect | N/A (filesystem) | No connection |
| Shutdown | N/A | No cleanup needed |
| Memory | ~1KB instance | Minimal |

### AssetService

| Phase | Implementation | Notes |
|-------|----------------|-------|
| Create | Lazy getter on first use | `getAssetService()` |
| Reuse | Singleton pattern | Same instance reused |
| Reconnect | N/A | Wraps storage |
| Shutdown | N/A | No cleanup needed |
| Memory | ~1KB instance | Minimal |

### StripeGateway

| Phase | Implementation | Notes |
|-------|----------------|-------|
| Create | Lazy getter on first use | `getStripe()` internal |
| Reuse | Singleton pattern | Same instance reused |
| Reconnect | Automatic (HTTP client) | Stateless |
| Shutdown | N/A | No cleanup needed |
| Memory | ~1KB instance | Minimal |

---

## Configuration Source

All external resources read configuration from environment variables:

| Resource | Config Source | Variables |
|----------|--------------|-----------|
| Redis | `process.env` | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Stripe | `process.env` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Storage | `process.env` | `ASSET_STORAGE_DIR` |

No hardcoded values found.
