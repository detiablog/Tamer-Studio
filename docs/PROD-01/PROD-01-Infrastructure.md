# PROD-01: Production Infrastructure Overview

**Document ID:** PROD-01-Infrastructure  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines the production infrastructure architecture for Tamer Studio, including all services, their dependencies, communication patterns, and scaling strategy.

---

## Architecture Diagram

```
                    +------------------+
                    |   Internet/CDN   |
                    +--------+---------+
                             |
                    +--------v---------+
                    |     Nginx        |
                    |  (SSL/TLS/Proxy) |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+       +----------v----------+
    |    Tamer Studio   |       |    Tamer Worker     |
    |   (Next.js App)   |       |  (Background Jobs)  |
    +---------+---------+       +----------+----------+
              |                             |
              +--------------+--------------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+       +----------v----------+
    |   PostgreSQL 16   |       |      Redis 7        |
    |   (Primary DB)    |       |  (Cache/Queue/Rate)  |
    +-------------------+       +---------------------+
              |
    +---------v---------+
    |  Object Storage   |
    |  (R2/S3/MinIO)    |
    +-------------------+
```

---

## Services

### 1. Tamer Studio Application (Next.js)

| Property | Value |
|----------|-------|
| Runtime | Node.js 20 (Alpine) |
| Framework | Next.js 16 (Standalone mode) |
| Port | 3000 |
| Mode | `NODE_ENV=production` |
| Health Check | `GET /health` |
| Container | `tamer-studio` |

### 2. Tamer Worker

| Property | Value |
|----------|-------|
| Runtime | Node.js 20 (Alpine) |
| Purpose | Background job processing (AI, publishing, email) |
| Mode | `WORKER_MODE=true` |
| Restart Policy | `unless-stopped` |
| Container | `tamer-worker` |

### 3. PostgreSQL 16

| Property | Value |
|----------|-------|
| Image | `postgres:16-alpine` |
| Port | 5432 |
| Data Volume | `postgres-data` |
| Health Check | `pg_isready` every 10s |
| Container | `tamer-db` |

### 4. Redis 7

| Property | Value |
|----------|-------|
| Image | `redis:7-alpine` |
| Port | 6379 |
| Persistence | AOF (`appendonly yes`) |
| Memory Limit | 256MB |
| Eviction | `allkeys-lru` |
| Data Volume | `redis-data` |
| Container | `tamer-redis` |

### 5. Nginx (Reverse Proxy)

| Property | Value |
|----------|-------|
| Image | `nginx:alpine` |
| Ports | 80 (HTTP), 443 (HTTPS) |
| Config | `config/nginx/nginx.conf` |
| SSL | `config/nginx/ssl/` |
| Cache Volume | `nginx-cache` |
| Container | `tamer-nginx` |

---

## Service Dependencies

```
Nginx --> App (HTTP 3000)
App --> PostgreSQL (TCP 5432)
App --> Redis (TCP 6379)
Worker --> PostgreSQL (TCP 5432)
Worker --> Redis (TCP 6379)
App --> Object Storage (HTTPS)
Worker --> Object Storage (HTTPS)
Worker --> SMTP Server (TLS 587)
```

Startup order enforced via Docker Compose `depends_on` with health check conditions:
1. PostgreSQL (must be healthy)
2. Redis (must be healthy)
3. Application (depends on db + redis)
4. Worker (depends on db + redis)
5. Nginx (depends on app)

---

## Networking

All services communicate over a bridge network:

```yaml
networks:
  tamer-network:
    driver: bridge
```

Internal DNS resolution uses container names:
- `db` resolves to PostgreSQL
- `redis` resolves to Redis
- `app` resolves to Next.js application
- `nginx` resolves to Nginx proxy

---

## Volumes

| Volume | Purpose | Persistence |
|--------|---------|-------------|
| `postgres-data` | PostgreSQL data directory | Persistent |
| `redis-data` | Redis AOF persistence | Persistent |
| `app-data` | Application uploads/cache | Persistent |
| `nginx-cache` | Nginx proxy cache | Persistent |

---

## Scaling Strategy

### Horizontal Scaling

| Service | Strategy | Notes |
|---------|----------|-------|
| App | Multiple replicas behind load balancer | Stateless; session in Redis |
| Worker | Multiple replicas with job locking | Redis-based job distribution |
| Nginx | Single instance or HA pair | Load balancer upstream |
| PostgreSQL | Single primary + read replicas | Streaming replication |
| Redis | Single instance + Sentinel | Failover support |

### Vertical Scaling Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 75% | > 90% |
| Disk Usage | > 70% | > 85% |
| DB Connections | > 80 | > 95 |
| Redis Memory | > 200MB | > 240MB |

### Resource Recommendations

**Minimum (Production):**
- App: 2 vCPU, 2GB RAM
- Worker: 2 vCPU, 2GB RAM
- PostgreSQL: 4 vCPU, 8GB RAM, 50GB SSD
- Redis: 1 vCPU, 1GB RAM

**Recommended (High Traffic):**
- App: 4 vCPU, 4GB RAM (x2 replicas)
- Worker: 4 vCPU, 4GB RAM (x2 replicas)
- PostgreSQL: 8 vCPU, 16GB RAM, 200GB SSD
- Redis: 2 vCPU, 4GB RAM

---

## Configuration

### docker-compose.yml Location

```
D:\Project AI Website Affiliate\Tamer\Tamer-Studio\docker-compose.yml
```

### Key Environment Variables

```bash
# Application
APP_URL=https://yourdomain.com
APP_PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://tamer:password@db:5432/tamer_studio
POSTGRES_DB=tamer_studio
POSTGRES_USER=tamer
POSTGRES_PASSWORD=<secure-password>

# Redis
REDIS_URL=redis://redis:6379

# Auth
BETTER_AUTH_SECRET=<secure-secret>
SESSION_SECRET=<secure-secret>
JWT_SECRET=<secure-secret>
```

---

## Commands

### Start All Services

```bash
docker compose up -d
```

### View Service Status

```bash
docker compose ps
```

### View Logs

```bash
docker compose logs -f app
docker compose logs -f worker
docker compose logs -f db
docker compose logs -f redis
docker compose logs -f nginx
```

### Stop All Services

```bash
docker compose down
```

### Rebuild and Restart

```bash
docker compose up -d --build
```

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| All containers running | `docker compose ps` | All status "Up" |
| App healthy | `curl http://localhost/health` | HTTP 200 |
| DB responsive | `docker compose exec db pg_isready` | accepting connections |
| Redis responsive | `docker compose exec redis redis-cli ping` | PONG |
| Nginx proxying | `curl -I https://yourdomain.com` | HTTP 200 |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| App won't start | `docker compose logs app` | Check env vars, DB connectivity |
| DB connection refused | `docker compose logs db` | Verify POSTGRES_PASSWORD matches DATABASE_URL |
| Redis connection refused | `docker compose logs redis` | Verify REDIS_URL, check memory limits |
| Nginx 502 Bad Gateway | `docker compose logs nginx` | Verify app container is running on port 3000 |
| Worker not processing | `docker compose logs worker` | Check WORKER_MODE=true, verify Redis connection |
| High memory usage | `docker stats` | Scale vertically or add replicas |
| Disk full | `df -h` | Clean old backups, prune Docker images |
