# SCALE-01: Load Balancing

## Scope

This document describes the load balancing configuration for Tamer Studio, covering traffic distribution, health checking, session affinity, and SSL termination.

## Architecture

Load balancing is implemented at multiple levels:

- **External Load Balancer**: HTTPS termination, SSL offloading, and global traffic distribution. Routes external requests to internal application servers.
- **Internal Load Balancer**: Distributes traffic across application instances within the same availability zone. Uses least-connections algorithm for long-running AI requests.
- **Worker Load Balancer**: Distributes background jobs across available workers based on worker capacity and current load.

Algorithms:
- **Round Robin**: Default for short API requests. Distributes requests sequentially across instances.
- **Least Connections**: Used for AI generation endpoints. Routes to the instance with fewest active connections.
- **Weighted Round Robin**: Used during canary deployments. Routes a percentage of traffic to new versions.

Health checking:
- TCP check on application port every 10 seconds.
- HTTP health check on `/api/health` every 10 seconds.
- 3 consecutive failures mark instance as unhealthy and remove from pool.

## Configuration

```env
# Load balancer
LB_ALGORITHM=round-robin
LB_HEALTH_CHECK_PATH=/api/health
LB_HEALTH_CHECK_INTERVAL=10000
LB_HEALTH_CHECK_TIMEOUT=5000
LB_HEALTH_CHECK_FAIL_THRESHOLD=3
LB_HEALTH_CHECK_PASS_THRESHOLD=2

# SSL
SSL_CERT_PATH=/etc/ssl/certs/tamer.pem
SSL_KEY_PATH=/etc/ssl/private/tamer.key
SSL_REDIRECT=true
HSTS_MAX_AGE=31536000

# Session affinity
SESSION_AFFINITY=false
```

## Commands

```bash
# View load balancer status
pnpm lb:status

# Check instance health
pnpm lb:health

# Test routing algorithm
pnpm lb:test-routing --requests 1000

# View connection counts per instance
pnpm lb:connections
```

## Verification

- Traffic distributes evenly across all healthy instances within 5% variance.
- Unhealthy instances are removed from the pool within 30 seconds of failure detection.
- SSL termination occurs at the load balancer level with valid certificates.
- No connection drops during health check transitions.
