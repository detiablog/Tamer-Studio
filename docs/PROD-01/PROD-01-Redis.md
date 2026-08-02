# PROD-01: Redis Setup

**Document ID:** PROD-01-Redis  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines the Redis configuration for Tamer Studio, including caching, sessions, queue management, rate limiting, persistence, and memory management.

---

## Architecture

```
App/Worker --> Redis 7 (Single Instance)
                    |
              +-----+-----+
              |           |
           Primary    AOF Persistence
           (RDB)      (appendonly)
```

---

## Configuration

### Docker Compose

```yaml
redis:
  image: redis:7-alpine
  container_name: tamer-redis
  restart: unless-stopped
  command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
  ports:
    - "${REDIS_PORT:-6379}:6379"
  volumes:
    - redis-data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5
  networks:
    - tamer-network
```

### Connection String

```bash
REDIS_URL=redis://redis:6379
```

### Upstash (Cloud Redis)

```bash
UPSTASH_REDIS_REST_URL=https://<token>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>
```

---

## Use Cases

### 1. Caching

```typescript
// src/core/cache/redis-cache.ts
import { Redis } from "redis";

const redis = new Redis(process.env.REDIS_URL);

// Cache with TTL
async function cacheGetOrSet<T>(
  key: string,
  factory: () => Promise<T>,
  ttlMs: number = 60000
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const value = await factory();
  await redis.setEx(key, Math.ceil(ttlMs / 1000), JSON.stringify(value));
  return value;
}
```

**Cache Keys:**

| Pattern | TTL | Purpose |
|---------|-----|---------|
| `monitoring:health:all` | 60s | Health check results |
| `monitoring:stats:overview` | 60s | Monitoring statistics |
| `user:<id>:profile` | 300s | User profile cache |
| `translation:<locale>` | 600s | Translation cache |

### 2. Sessions

```typescript
// Session storage via Better Auth
import { redis } from "@/lib/redis";

// Session data stored in Redis
await redis.setEx(`session:${sessionId}`, 86400, JSON.stringify(sessionData));
```

### 3. Rate Limiting

```typescript
// Using @upstash/ratelimit
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  analytics: true,
});

// Apply rate limit
const { success, limit, remaining } = await ratelimit.limit(identifier);
```

**Rate Limit Configuration:**

| Endpoint | Window | Max Requests |
|----------|--------|--------------|
| General API | 15 min | 100 |
| Authentication | 15 min | 10 |
| AI Generation | 1 hour | 50 |

### 4. Queue Management

```typescript
// Job queue via Redis
import { redis } from "@/lib/redis";

// Enqueue job
await redis.lPush("job:queue", JSON.stringify(job));

// Dequeue job
const jobData = await redis.rPop("job:queue");
```

### 5. WebSocket Adapter

```typescript
// Socket.IO Redis adapter
import { createAdapter } from "@socket.io/redis-adapter";
import { redis } from "@/lib/redis";

io.adapter(createAdapter(pubClient, subClient));
```

---

## Persistence

### AOF (Append-Only File)

```bash
# Enabled via command line
redis-server --appendonly yes

# AOF configuration
appendonly yes
appendfsync everysec
```

### RDB Snapshots

```bash
# Add to redis.conf for production
save 900 1      # Save if at least 1 key changed in 900 seconds
save 300 10     # Save if at least 10 keys changed in 300 seconds
save 60 10000   # Save if at least 10000 keys changed in 60 seconds
```

---

## Memory Management

### Configuration

```bash
--maxmemory 256mb
--maxmemory-policy allkeys-lru
```

### Eviction Policies

| Policy | Description |
|--------|-------------|
| `allkeys-lru` | Evict least recently used keys (default) |
| `volatile-lru` | Evict LRU keys with expiry set |
| `allkeys-random` | Evict random keys |
| `noeviction` | Return errors when memory full |

### Memory Monitoring

```bash
# Check memory usage
docker compose exec redis redis-cli info memory

# Check key count
docker compose exec redis redis-cli dbsize

# Monitor commands
docker compose exec redis redis-cli monitor
```

---

## Commands

### Connect to Redis

```bash
# Via Docker
docker compose exec redis redis-cli

# Via Redis CLI (if installed locally)
redis-cli -h localhost -p 6379
```

### Common Operations

```bash
# Ping
docker compose exec redis redis-cli ping

# Info
docker compose exec redis redis-cli info

# Key count
docker compose exec redis redis-cli dbsize

# Flush all (WARNING: destructive)
docker compose exec redis redis-cli FLUSHALL

# Monitor real-time commands
docker compose exec redis redis-cli monitor

# Check memory
docker compose exec redis redis-cli info memory
```

### Debugging

```bash
# List all keys
docker compose exec redis redis-cli KEYS "*"

# Get specific key
docker compose exec redis redis-cli GET "key:name"

# Check TTL
docker compose exec redis redis-cli TTL "key:name"

# Delete key
docker compose exec redis redis-cli DEL "key:name"
```

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| Redis responding | `redis-cli ping` | PONG |
| Memory within limits | `redis-cli info memory` | used_memory < 256MB |
| AOF enabled | `redis-cli config get appendonly` | 1 |
| Connection from app | `curl http://localhost/health` | HTTP 200 (includes Redis check) |
| Rate limiting active | Send 100+ requests to `/api/*` | 429 after limit |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| Connection refused | `docker compose logs redis` | Verify REDIS_URL, check container status |
| Memory full | `redis-cli info memory` | Increase maxmemory, check for key leaks |
| Slow commands | `redis-cli slowlog get 10` | Optimize queries, avoid KEYS in production |
| AOF corruption | Check redis logs | Restart with `redis-check-aof --fix` |
| Data loss | Check AOF/RDB persistence | Verify appendonly=yes, check volume mounts |
| High latency | `redis-cli --latency` | Check network, resource limits |
