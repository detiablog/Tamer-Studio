# SCALE-01: Caching

## Scope

This document covers the caching strategy for Tamer Studio, including application-level caching, database query caching, session caching, and cache invalidation patterns.

## Architecture

Caching is implemented at multiple levels:

- **Application Cache**: In-memory LRU cache for frequently accessed configuration and metadata. TTL-based expiration.
- **Redis Cache**: Distributed cache for API responses, computed analytics, and shared state across instances.
- **Database Query Cache**: PostgreSQL query result caching for expensive queries.
- **CDN Cache**: Edge caching for static assets and cacheable API responses.

Cache patterns:
- **Cache-Aside**: Application checks cache first, falls back to database on miss, writes to cache.
- **Write-Through**: Cache updated synchronously with database writes for consistency.
- **Write-Behind**: Cache updated immediately, database updated asynchronously for performance.
- **Cache Invalidation**: Event-driven invalidation when underlying data changes.

Cache key conventions:
- `cache:{domain}:{id}` for entity caching.
- `cache:list:{domain}:{hash}` for list/query caching.
- `cache:config:{key}` for configuration caching.

## Configuration

```env
# Application cache
APP_CACHE_ENABLED=true
APP_CACHE_MAX_SIZE=10000
APP_CACHE_TTL=300000

# Redis cache
CACHE_REDIS_ENABLED=true
CACHE_REDIS_TTL=600000
CACHE_REDIS_MAX_ENTRIES=100000

# Cache invalidation
CACHE_INVALIDATION_ENABLED=true
CACHE_INVALIDATION_CHANNEL=tamer:cache-invalidation

# Warming
CACHE_WARMING_ENABLED=true
CACHE_WARMING_INTERVAL=3600000
```

## Commands

```bash
# View cache hit rates
pnpm cache:hit-rates

# Clear specific cache
pnpm cache:clear --domain projects

# Warm cache
pnpm cache:warm --domain users

# View cache memory usage
pnpm cache:memory

# Test cache performance
pnpm cache:benchmark --iterations 10000
```

## Verification

- Cache hit rate exceeds 90% for application cache.
- Redis cache hit rate exceeds 85% for API response caching.
- Cache invalidation propagates within 5 seconds across all instances.
- Cache warming completes within 60 seconds after deployment.
