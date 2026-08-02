# SCALE-01: CDN

## Scope

This document covers the CDN configuration for Tamer Studio, including static asset delivery, cache invalidation, edge caching, and performance optimization for global users.

## Architecture

The CDN layer accelerates content delivery for Tamer Studio:

- **Static Assets**: JavaScript bundles, CSS, images, and fonts served from CDN edge nodes.
- **Generated Media**: AI-generated images and videos cached at the edge after first request.
- **API Caching**: Cacheable API responses (GET requests with cache headers) served from edge.
- **SSL Termination**: CDN handles TLS termination, reducing load on origin servers.

CDN strategy:
- **Cache-Control Headers**: Set appropriate `max-age` and `s-maxage` for different asset types.
- **Cache Invalidation**: On-demand invalidation via API for content updates.
- **Purge**: Full purge capability for emergency cache clearing.
- **Edge Rules**: Custom rules for cache behavior per URL pattern.

## Configuration

```env
# CDN
CDN_ENABLED=true
CDN_PROVIDER=cloudflare
CDN_ZONE_ID=your_zone_id
CDN_API_TOKEN=your_api_token
CDN_ORIGIN=tamer-studio.com

# Cache
CDN_CACHE_STATIC_MAX_AGE=31536000
CDN_CACHE_API_MAX_AGE=300
CDN_CACHE_MEDIA_MAX_AGE=86400
CDN_CACHE_HTML_MAX_AAGE=0

# Purge
CDN_PURGE_ON_DEPLOY=true
CDN_PURGE_API_KEY=your_purge_key
```

## Commands

```bash
# Purge CDN cache
pnpm cdn:purge --type all

# Purge specific URLs
pnpm cdn:purge --urls "https://tamer-studio.com/assets/*"

# View CDN analytics
pnpm cdn:analytics --period 7d

# Check cache hit ratio
pnpm cdn:cache-ratio

# Test CDN performance
pnpm cdn:perf-test --region global
```

## Verification

- Static assets load from CDN edge within 50ms for global users.
- Cache hit ratio exceeds 95% for static assets.
- Cache invalidation propagates to all edge nodes within 30 seconds.
- Generated media cached at edge serves within 100ms after first request.
