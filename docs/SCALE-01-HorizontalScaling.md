# SCALE-01: Horizontal Scaling

## Scope

This document covers the horizontal scaling strategy for Tamer Studio application servers, API workers, and background job processors, enabling the platform to handle increasing load by adding more instances.

## Architecture

Horizontal scaling adds additional instances of the same component rather than increasing the resources of a single instance. Tamer Studio uses:

- **Application Servers**: Stateless Node.js processes behind a load balancer. Each instance handles an equal share of API traffic.
- **AI Runtime Workers**: Dedicated workers for AI generation tasks. Scale independently based on queue depth.
- **Media Workers**: Handle image, video, and audio processing. Scale based on render queue length.
- **Publishing Workers**: Process content publishing jobs. Scale based on scheduled publication volume.

Scaling triggers:
- CPU utilization exceeds 75% for 60 seconds.
- Memory utilization exceeds 80% for 60 seconds.
- Queue depth exceeds 100 pending jobs.
- Response time p95 exceeds 3 seconds.

## Configuration

```env
# Horizontal scaling
APP_INSTANCES_MIN=2
APP_INSTANCES_MAX=10
APP_CPU_THRESHOLD=75
APP_MEMORY_THRESHOLD=80
APP_RESPONSE_TIME_THRESHOLD=3000

# Worker scaling
AI_WORKER_MIN=1
AI_WORKER_MAX=10
AI_QUEUE_THRESHOLD=100

MEDIA_WORKER_MIN=1
MEDIA_WORKER_MAX=8
MEDIA_QUEUE_THRESHOLD=50
```

## Commands

```bash
# Scale application servers
pnpm scaling:app-scale --instances 4

# Scale AI workers
pnpm scaling:ai-workers --count 6

# Scale media workers
pnpm scaling:media-workers --count 4

# View scaling history
pnpm scaling:history --component app --days 7
```

## Verification

- New application instances register with the load balancer within 30 seconds.
- All instances serve traffic successfully after scaling.
- No dropped connections during scale-up or scale-down events.
- Worker scaling maintains job processing throughput proportional to instance count.
