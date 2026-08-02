# SCALE-01: Queue Scaling

## Scope

This document covers the scaling strategy for Tamer Studio job queues, including queue partitioning, worker allocation, backpressure handling, and dead letter queue management.

## Architecture

Tamer Studio uses BullMQ backed by Redis for job queue management:

- **Queue Partitioning**: Separate queues for different job types (AI generation, media processing, publishing, email) to prevent head-of-line blocking.
- **Worker Allocation**: Workers subscribe to specific queues based on their capabilities. Each queue scales independently.
- **Concurrency Control**: Each worker has configurable concurrency limits per queue to prevent resource exhaustion.
- **Backpressure**: When queue depth exceeds threshold, new jobs are rate-limited or queued with delay.
- **Dead Letter Queue**: Jobs that exceed max retry attempts move to a dead letter queue for manual review.

Queue types:
- `ai-generation`: AI text, image, video, and audio generation jobs.
- `media-processing`: Image resizing, video transcoding, audio normalization.
- `publishing`: Content publishing to external platforms.
- `email`: Email delivery and notifications.

## Configuration

```env
# Queue configuration
QUEUE_AI_GENERATION_CONCURRENCY=5
QUEUE_MEDIA_PROCESSING_CONCURRENCY=3
QUEUE_PUBLISHING_CONCURRENCY=2
QUEUE_EMAIL_CONCURRENCY=4

# Backpressure
QUEUE_BACKPRESSURE_THRESHOLD=500
QUEUE_BACKPRESSURE_DELAY=5000

# Dead letter
QUEUE_MAX_ATTEMPTS=3
QUEUE_DLQ_ENABLED=true
QUEUE_DLQ_RETENTION_DAYS=30

# Redis
REDIS_CLUSTER_ENABLED=true
REDIS_QUEUE_PREFIX=tamer:
```

## Commands

```bash
# View queue depths
pnpm queue:depths

# Pause a queue
pnpm queue:pause --name ai-generation

# Retry dead letter jobs
pnpm queue:retry-dlq --queue ai-generation

# View worker allocation
pnpm queue:workers
```

## Verification

- Queue depth remains below 500 under normal load.
- Jobs process within SLA: AI generation within 60s, media within 30s, publishing within 15s.
- Dead letter queue captures failed jobs after 3 retry attempts.
- Backpressure activates when queue depth exceeds 500 and releases when below 200.
