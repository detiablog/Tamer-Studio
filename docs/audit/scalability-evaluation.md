# Scalability Evaluation

**Date:** 2026-08-03
**Scope:** Readiness for 10K, 100K, 1M users, multi-region, queue workers, microservices

---

## Current Architecture Profile

| Metric | Value |
|--------|-------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL (via Drizzle ORM) |
| Cache | Redis (Upstash) + In-memory |
| Deployment | Docker (standalone output) |
| Process Model | Single Node.js process |
| Real-time | Socket.io |

---

## 10K Users Assessment

### Readiness: GREEN

| Concern | Status | Notes |
|---------|--------|-------|
| Database connections | OK | Pool size 10, idle timeout 30s |
| Auth sessions | OK | Better-Auth with Redis sessions |
| File storage | OK | R2/S3/Local with proper abstractions |
| API throughput | OK | Rate limiting in place |
| Cache hit ratio | OK | Redis + memory fallback |

### Bottlenecks at 10K

- Database connection pool may need tuning (current: 10 max)
- In-memory rate limiting won't work across instances
- Single-process Socket.io limits real-time scalability

---

## 100K Users Assessment

### Readiness: AMBER

| Concern | Status | Action Needed |
|---------|--------|---------------|
| Database | AMBER | Need connection pooling (PgBouncer), read replicas |
| Cache | AMBER | Redis already in place, but fallback to memory won't scale |
| Rate limiting | RED | In-memory rate limiting won't work across instances |
| Job queue | AMBER | Current queue is in-memory, need Redis-backed queue |
| File storage | OK | R2/S3 already supported |
| Auth | AMBER | Session store needs Redis (already configured) |
| Email | RED | 7 providers but no queue worker for async sending |
| Real-time | RED | Socket.io single-process won't scale |

### Bottlenecks at 100K

1. **In-memory rate limiting** — `core/security/rate-limit.ts` uses `Map` which doesn't share state across instances
2. **In-memory job queue** — `core/jobs/` uses in-memory store, not persistent
3. **Single-process Socket.io** — Needs Redis adapter (already installed as dependency)
4. **Database connections** — Pool of 10 is insufficient for 100K concurrent users
5. **No read replicas** — All queries hit primary database

---

## 1M Users Assessment

### Readiness: RED

| Concern | Status | Action Needed |
|---------|--------|---------------|
| Database | RED | Need sharding, read replicas, connection pooling |
| Cache | RED | Need Redis Cluster |
| Rate limiting | RED | Need distributed rate limiting |
| Job queue | RED | Need dedicated job workers (BullMQ, etc.) |
| File storage | OK | R2/S3 scales horizontally |
| Auth | RED | Need distributed session store |
| Email | RED | Need async email workers with retry |
| Real-time | RED | Need Socket.io Redis adapter + sticky sessions |
| API | RED | Need load balancer, health checks |
| Monitoring | AMBER | Observability exists but not production-tested |

### Bottlenecks at 1M

1. **Single database** — PostgreSQL won't handle 1M concurrent without sharding
2. **No queue workers** — Background jobs need dedicated processes
3. **No CDN strategy** — Static assets need edge caching
4. **No rate limiting distribution** — In-memory won't work across 10+ instances
5. **No health checks** — Basic health endpoint exists but no deep checks

---

## Multi-Region Assessment

### Readiness: RED

| Concern | Status | Action Needed |
|---------|--------|---------------|
| Database | RED | Need multi-region PostgreSQL or CockroachDB |
| Cache | RED | Need Redis Cluster with geo-replication |
| File storage | OK | R2/S3 already multi-region |
| Auth | RED | Need distributed session store |
| Rate limiting | RED | Need region-aware rate limiting |
| Localization | OK | i18n already implemented |
| Currency | OK | Multi-currency support exists |

---

## Queue Workers Assessment

### Current State

The project has:
- `core/jobs/` — In-memory job dispatcher and scheduler
- `core/automation/` — Rule engine with queue
- `core/orchestrator/` — Task orchestration with queue
- `modules/email/email.queue.ts` — Email queue (database-backed)

### Readiness: AMBER

| Concern | Status | Action Needed |
|---------|--------|---------------|
| Job persistence | AMBER | Database-backed queue exists but most jobs are in-memory |
| Retry logic | OK | Dead letter queue and retry queue exist |
| Cron scheduling | OK | `node-cron` integration exists |
| Worker processes | RED | No dedicated worker processes |
| Job monitoring | OK | Metrics aggregation exists |

### Recommendation

For 100K+ users, migrate to a dedicated job queue (BullMQ with Redis) and run workers as separate Docker containers.

---

## Microservices Readiness (If Ever Needed)

### Current Monolith Assessment

The current architecture is a well-structured monolith with clear domain boundaries. Microservices would only be needed if:
- Different scaling requirements per domain
- Different technology stacks per domain
- Team size exceeds 20+ developers
- Deployment independence is required

### Module Boundaries That Could Become Services

| Domain | Boundary Clarity | Service Candidate |
|--------|------------------|-------------------|
| Auth | High | Yes |
| AI Gateway | High | Yes |
| Commerce | High | Yes |
| Email | High | Yes |
| CMS | Medium | Maybe |
| Analytics | Medium | Maybe |

### Readiness: GREEN (for monolith)

The current architecture is well-suited for a monolith. No immediate need for microservices.

---

## Scalability Score

| Scale | Readiness |
|-------|-----------|
| 10K users | 8/10 |
| 100K users | 4/10 |
| 1M users | 2/10 |
| Multi-region | 2/10 |
| Queue workers | 5/10 |
| **Overall** | **4.2/10** |
