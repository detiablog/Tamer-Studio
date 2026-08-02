# SCALE-01: Redis Scaling

## Scope

This document covers the Redis scaling strategy for Tamer Studio, including cluster configuration, memory management, persistence, and high availability through Sentinel.

## Architecture

Redis serves multiple roles in Tamer Studio:

- **Session Store**: User sessions and authentication tokens.
- **Cache Layer**: API response caching, query result caching, and computed data caching.
- **Queue Backend**: BullMQ job queues for background processing.
- **Rate Limiter**: Token bucket rate limiting for API endpoints.
- **Pub/Sub**: Real-time notifications and event broadcasting.

Scaling strategy:
- **Vertical**: Increase Redis instance memory as data volume grows.
- **Horizontal**: Use Redis Cluster for queue data distribution across shards.
- **Sentinel**: Automatic failover for standalone Redis instances.

Memory management:
- TTL-based eviction for cache entries.
- All keys use structured prefixes for organized memory usage.
- Max memory policy: `allkeys-lru` for cache, `noeviction` for queues.

## Configuration

```env
# Redis standalone
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_password
REDIS_DB=0
REDIS_KEY_PREFIX=tamer:

# Redis cluster
REDIS_CLUSTER_ENABLED=false
REDIS_CLUSTER_NODES=node1:6379,node2:6379,node3:6379

# Redis sentinel
REDIS_SENTINEL_ENABLED=false
REDIS_SENTINEL_MASTER=tamer-redis

# Memory
REDIS_MAX_MEMORY=2gb
REDIS_MAX_MEMORY_POLICY=allkeys-lru

# Persistence
REDIS_RDB_ENABLED=true
REDIS_RDB_SAVE_INTERVAL=900
REDIS_AOF_ENABLED=false
```

## Commands

```bash
# Check Redis memory usage
pnpm redis:memory

# View connected clients
pnpm redis:clients

# Monitor Redis operations
pnpm redis:monitor --duration 30

# Run Redis flush (development only)
pnpm redis:flush --confirm

# Check replication status
pnpm redis:replication
```

## Verification

- Redis memory usage stays below 80% of configured max memory.
- Cache hit rate exceeds 90% for API response caching.
- Queue data persists across Redis restarts when AOF or RDB is enabled.
- Sentinel failover completes within 5 seconds with zero data loss for queues.
