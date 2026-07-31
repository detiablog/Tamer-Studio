# EMAIL-02: Queue Architecture

## Overview

The email queue system manages email delivery with priority-based scheduling, bulk operations, rate limiting, and retry mechanisms.

## Queue Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Queue System                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Priority  │  │  Scheduler  │  │   Worker    │     │
│  │   Manager   │  │             │  │   Pool      │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         ▼                ▼                ▼             │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Queue Store                         │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │  Priority Queue (Heap)                    │   │   │
│  │  │  - PENDING items by priority/schedule     │   │   │
│  │  │  - PROCESSING items by worker assignment  │   │   │
│  │  │  - COMPLETED items for cleanup            │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│         │                                               │
│         ▼                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Rate Limiter                        │   │
│  │  - Per-provider rate limits                      │   │
│  │  - Daily/monthly caps                            │   │
│  │  - Burst protection                              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Priority System

### Priority Levels

| Priority | Value | Description | Use Case |
|----------|-------|-------------|----------|
| Critical | 1 | System-critical emails | Security alerts, account recovery |
| High | 2 | Time-sensitive emails | Verification, password reset |
| Normal | 3 | Standard emails | Welcome, notifications |
| Low | 4 | Non-urgent emails | Marketing, announcements |
| Bulk | 5 | Batch processing | Newsletter, campaigns |

### Priority Assignment Rules
1. **System templates** default to High (2)
2. **User-triggered** actions default to Normal (3)
3. **Scheduled** emails default to Low (4)
4. **Manual override** available for all items

### Priority Queue Implementation
```typescript
interface QueueItem {
  id: string;
  templateId: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  variables: Record<string, any>;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  priority: number; // 1-5
  scheduledAt: Date;
  sentAt?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Priority comparator
const priorityComparator = (a: QueueItem, b: QueueItem) => {
  // Lower priority number = higher priority
  if (a.priority !== b.priority) return a.priority - b.priority;
  // Earlier scheduled time = higher priority
  return a.scheduledAt.getTime() - b.scheduledAt.getTime();
};
```

## Scheduling

### Schedule Types
1. **Immediate**: Process as soon as possible
2. **Delayed**: Process after specified delay
3. **Scheduled**: Process at specific time
4. **Recurring**: Process on recurring schedule

### Schedule Schema
```typescript
interface Schedule {
  type: 'immediate' | 'delayed' | 'scheduled' | 'recurring';
  delayMs?: number; // For delayed
  scheduledAt?: Date; // For scheduled
  cron?: string; // For recurring
  timezone?: string;
}
```

### Schedule Processing
```
1. Check pending items
2. Filter by scheduled time <= now
3. Sort by priority
4. Assign to available workers
5. Update status to PROCESSING
6. Execute send
7. Update status to SENT/FAILED
8. Log result
```

## Bulk Operations

### Supported Operations
1. **Bulk Retry**: Retry multiple failed items
2. **Bulk Cancel**: Cancel multiple pending items
3. **Bulk Delete**: Delete multiple items
4. **Bulk Export**: Export multiple items to CSV

### Bulk Operation Schema
```typescript
interface BulkOperation {
  operation: 'retry' | 'cancel' | 'delete' | 'export';
  itemIds: string[];
  filters?: {
    status?: string[];
    priority?: number[];
    dateRange?: { start: Date; end: Date };
    providerId?: string;
  };
}
```

### Bulk Operation Limits
- Maximum items per operation: 1000
- Maximum concurrent operations: 5
- Operation timeout: 300 seconds

## Rate Limiting

### Rate Limit Types
1. **Per-Provider**: Limits per email provider
2. **Per-Recipient**: Limits per recipient email
3. **Global**: System-wide limits
4. **Time-based**: Per second/minute/hour/day

### Rate Limit Schema
```typescript
interface RateLimit {
  providerId: string;
  limits: {
    perSecond: number;
    perMinute: number;
    perHour: number;
    perDay: number;
    perMonth: number;
  };
  current: {
    sent: number;
    lastSentAt: Date;
  };
}
```

### Rate Limit Enforcement
```
1. Check provider rate limit
2. Check global rate limit
3. Check recipient rate limit
4. If any limit exceeded:
   a. Queue item for later
   b. Set retry-after header
   c. Log rate limit event
5. If within limits:
   a. Process send
   b. Update rate counters
```

## Retry Mechanism

### Retry Strategy
1. **Immediate retry**: On transient failures
2. **Exponential backoff**: For repeated failures
3. **Scheduled retry**: For rate-limited sends
4. **Manual retry**: User-triggered retry

### Retry Configuration
```typescript
interface RetryConfig {
  maxRetries: number; // Default: 3
  baseDelayMs: number; // Default: 1000
  maxDelayMs: number; // Default: 60000
  backoffMultiplier: number; // Default: 2
  retryableErrors: string[]; // Error codes that trigger retry
}
```

### Retry Delay Calculation
```typescript
const calculateRetryDelay = (retryCount: number, config: RetryConfig): number => {
  const delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, retryCount);
  return Math.min(delay, config.maxDelayMs);
};
```

## Worker Pool

### Worker Configuration
```typescript
interface WorkerPoolConfig {
  minWorkers: number; // Minimum workers
  maxWorkers: number; // Maximum workers
  idleTimeout: number; // Idle timeout (ms)
  taskTimeout: number; // Task timeout (ms)
}
```

### Worker Lifecycle
```
1. Worker starts
2. Poll queue for pending items
3. Claim item (atomic operation)
4. Process send
5. Update item status
6. Release worker
7. Repeat from step 2
```

### Worker Monitoring
- Active workers count
- Idle workers count
- Tasks processed per worker
- Average processing time
- Error rate per worker

## Queue Monitoring

### Queue Metrics
- **Queue Depth**: Total pending items
- **Processing Rate**: Items processed per minute
- **Success Rate**: Percentage of successful sends
- **Average Wait Time**: Time from creation to processing
- **Error Rate**: Percentage of failed sends

### Health Indicators
- Queue depth > threshold: Warning
- Processing rate < threshold: Warning
- Error rate > threshold: Critical
- Worker count = 0: Critical

## Timeline Tracking

### Queue Timeline
```
Created → Scheduled → Processing → Sent/Failed
   │           │           │           │
   ▼           ▼           ▼           ▼
timestamp1  timestamp2  timestamp3  timestamp4
```

### Delivery Timeline
```
Queued → Processing → Provider Accepted → Delivered → Bounced
  │          │              │               │          │
  ▼          ▼              ▼               ▼          ▼
time1      time2          time3           time4      time5
```

## Localization Keys

### Queue Management
- `email.queueDepth` - "Queue Depth"
- `email.queued` - "Queued"
- `email.processing` - "Processing"
- `email.cancelQueue` - "Cancel Queue Item"
- `email.deleteQueue` - "Delete Queue Item"
- `email.retryQueue` - "Retry Queue Item"
- `email.bulkRetry` - "Bulk Retry"
- `email.bulkCancel` - "Bulk Cancel"
- `email.bulkDelete` - "Bulk Delete"
- `email.selectedItems` - "Selected Items"
- `email.noItemsSelected` - "No items selected"
- `email.confirmBulkAction` - "Are you sure you want to perform this action on selected items?"

### Timeline
- `email.queueTimeline` - "Queue Timeline"
- `email.deliveryTimeline` - "Delivery Timeline"
- `email.created` - "Created"
- `email.started` - "Started"
- `email.completed` - "Completed"
- `email.scheduledFor` - "Scheduled For"
- `email.processingTime` - "Processing Time"

### History
- `email.queueHistory` - "Queue History"
- `email.retryHistory` - "Retry History"
