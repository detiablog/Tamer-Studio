# PROD-01: Docker Setup

**Document ID:** PROD-01-Docker  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines the Docker configuration for Tamer Studio, including the multi-stage Dockerfile, Docker Compose services, volumes, networks, health checks, and optimization strategies.

---

## Dockerfile (Multi-Stage Build)

### Stage 1: Dependencies

```dockerfile
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod=false
```

### Stage 2: Builder

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build
```

### Stage 3: Runner

```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

---

## Docker Compose Services

### Application (`app`)

```yaml
app:
  build:
    context: .
    dockerfile: Dockerfile
  container_name: tamer-studio
  restart: unless-stopped
  ports:
    - "${APP_PORT:-3000}:3000"
  env_file:
    - .env
  depends_on:
    db:
      condition: service_healthy
    redis:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
    interval: 30s
    timeout: 5s
    retries: 3
    start_period: 10s
  volumes:
    - app-data:/app/data
  networks:
    - tamer-network
```

### Database (`db`)

```yaml
db:
  image: postgres:16-alpine
  container_name: tamer-db
  restart: unless-stopped
  environment:
    POSTGRES_DB: ${POSTGRES_DB:-tamer_studio}
    POSTGRES_USER: ${POSTGRES_USER:-tamer}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  ports:
    - "${DB_PORT:-5432}:5432"
  volumes:
    - postgres-data:/var/lib/postgresql/data
    - ./scripts/backup-db.sh:/docker-entrypoint-initdb.d/backup.sh
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-tamer}"]
    interval: 10s
    timeout: 5s
    retries: 5
  networks:
    - tamer-network
```

### Redis (`redis`)

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

### Worker (`worker`)

```yaml
worker:
  build:
    context: .
    dockerfile: Dockerfile
  container_name: tamer-worker
  restart: unless-stopped
  command: ["node", "worker.js"]
  env_file:
    - .env
  environment:
    - WORKER_MODE=true
  depends_on:
    db:
      condition: service_healthy
    redis:
      condition: service_healthy
  networks:
    - tamer-network
```

### Nginx (`nginx`)

```yaml
nginx:
  image: nginx:alpine
  container_name: tamer-nginx
  restart: unless-stopped
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./config/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - ./config/nginx/ssl:/etc/nginx/ssl:ro
    - nginx-cache:/var/cache/nginx
  depends_on:
    - app
  networks:
    - tamer-network
```

---

## Volumes

| Volume | Container Path | Purpose |
|--------|---------------|---------|
| `postgres-data` | `/var/lib/postgresql/data` | PostgreSQL data |
| `redis-data` | `/data` | Redis AOF persistence |
| `app-data` | `/app/data` | Application uploads/cache |
| `nginx-cache` | `/var/cache/nginx` | Nginx proxy cache |

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect tamer-studio_postgres-data

# Backup volume
docker run --rm -v tamer-studio_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-data.tar.gz -C /data .

# Restore volume
docker run --rm -v tamer-studio_postgres-data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-data.tar.gz -C /data
```

---

## Networks

```yaml
networks:
  tamer-network:
    driver: bridge
```

All services communicate over the `tamer-network` bridge network using container names as hostnames.

---

## Health Checks

| Service | Check | Interval | Timeout | Retries | Start Period |
|---------|-------|----------|---------|---------|--------------|
| App | `wget http://localhost:3000/health` | 30s | 5s | 3 | 10s |
| DB | `pg_isready -U tamer` | 10s | 5s | 5 | - |
| Redis | `redis-cli ping` | 10s | 5s | 5 | - |
| Worker | Inherited from app | 30s | 5s | 3 | 10s |

---

## Optimization

### Build Cache

```bash
# Use BuildKit for better caching
DOCKER_BUILDKIT=1 docker compose build

# Build without cache (fresh build)
docker compose build --no-cache

# Build specific service
docker compose build app
```

### Image Size Reduction

- Alpine base images (5MB vs 900MB for full Debian)
- Multi-stage build excludes dev dependencies
- Only copies production artifacts (`.next/standalone`)
- `pnpm install --prod=false` in deps stage, production deps only in runner

### Resource Limits

```yaml
# Add to docker-compose.yml for production
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## Commands

### Build All Services

```bash
docker compose build
```

### Start All Services

```bash
docker compose up -d
```

### Start Specific Service

```bash
docker compose up -d app
docker compose up -d worker
```

### Stop All Services

```bash
docker compose down
```

### Stop and Remove Volumes

```bash
docker compose down -v  # WARNING: Deletes all data
```

### View Running Containers

```bash
docker compose ps
```

### View Logs

```bash
docker compose logs -f
docker compose logs -f app
docker compose logs --tail=100 app
```

### Execute Command in Container

```bash
docker compose exec app sh
docker compose exec db psql -U tamer -d tamer_studio
docker compose exec redis redis-cli
```

### Clean Up

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| All containers running | `docker compose ps` | All status "Up" |
| App health | `curl http://localhost:3000/health` | HTTP 200 |
| DB health | `docker compose exec db pg_isready` | accepting connections |
| Redis health | `docker compose exec redis redis-cli ping` | PONG |
| Image sizes | `docker images \| grep tamer` | < 200MB for app |
| Volumes exist | `docker volume ls \| grep tamer` | 4 volumes listed |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| Build fails | Check Dockerfile syntax | Verify base image, COPY paths |
| Container exits immediately | `docker compose logs <service>` | Check env vars, resource limits |
| Port already in use | `netstat -tlnp \| grep <port>` | Change port mapping or stop conflicting service |
| Health check fails | `docker compose inspect <service>` | Increase start_period, check logs |
| Out of memory | `docker stats` | Increase memory limits, optimize application |
| Disk space low | `docker system df` | Prune images/volumes, clean backups |
| Network issues | `docker network inspect tamer-network` | Verify containers are on same network |
