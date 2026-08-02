# SCALE-01: High Availability

## Scope

This document defines the high availability (HA) strategy for Tamer Studio, ensuring the platform maintains uptime and continues serving requests even when individual components fail.

## Architecture

High availability is achieved through redundancy at every layer:

- **Application Layer**: Minimum 2 instances across availability zones. Load balancer removes unhealthy instances automatically.
- **Database Layer**: Primary-replica PostgreSQL with automatic failover via PgBouncer. WAL streaming ensures data consistency.
- **Cache Layer**: Redis Sentinel with 1 primary and 2 replicas. Automatic failover on primary failure.
- **Queue Layer**: Redis Cluster with distributed partitions. Queue data replicated across 3 nodes.
- **Storage Layer**: Object storage with cross-region replication for critical assets.
- **DNS Layer**: Multi-region DNS with health-based routing.

Failover behavior:
- Application: Load balancer drains connections from failing instance (10s) then reroutes.
- Database: Sentinel promotes replica to primary within 10 seconds.
- Cache: Sentinel promotes replica within 5 seconds.
- Queue: Cluster elects new primary partition leader within 3 seconds.

## Configuration

```env
# High availability
HA_MIN_INSTANCES=2
HA_FAILOVER_TIMEOUT=10000
HEALTH_CHECK_PATH=/api/health
HEALTH_CHECK_INTERVAL=10000
HEALTH_CHECK_FAIL_THRESHOLD=3

# Database HA
DB_POOL_SIZE=20
DB_REPLICA_ENABLED=true
DB_FAILOVER_MODE=automatic

# Redis HA
REDIS_SENTINEL_ENABLED=true
REDIS_SENTINEL_MASTER=tamer-redis
REDIS_SENTINEL_NODES=redis-sentinel-1:26379,redis-sentinel-2:26379,redis-sentinel-3:26379
```

## Commands

```bash
# Check HA status
pnpm ha:status

# Verify failover readiness
pnpm ha:verify-failover

# Simulate component failure
pnpm ha:simulate-failure --component app --instance 1

# View failover history
pnpm ha:failover-history --days 30
```

## Verification

- Platform remains available when a single application instance is terminated.
- Database failover completes within 10 seconds with zero data loss.
- Redis failover completes within 5 seconds with minimal cache misses.
- End-to-end request succeeds during any single-component failure scenario.
