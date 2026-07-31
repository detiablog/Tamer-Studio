# EMAIL-02: Log Structure

## Overview

The email logging system records all email delivery events with detailed metadata, filtering capabilities, export functionality, and detailed view options.

## Log Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Log System                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Log       │  │   Filter    │  │   Export    │     │
│  │   Store     │  │   Engine    │  │   Manager   │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         ▼                ▼                ▼             │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Log Query Engine                    │   │
│  │  - Full-text search                              │   │
│  │  - Date range filtering                          │   │
│  │  - Status filtering                              │   │
│  │  - Provider filtering                            │   │
│  │  - Type filtering                                │   │
│  └─────────────────────────────────────────────────┘   │
│         │                                               │
│         ▼                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Log Storage                         │   │
│  │  - PostgreSQL (primary)                          │   │
│  │  - Elasticsearch (search)                        │   │
│  │  - S3 (raw logs)                                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Log Schema

```typescript
interface EmailLog {
  id: string;
  queueId: string;
  providerId: string;
  status: 'sent' | 'delivered' | 'bounced' | 'failed' | 'opened' | 'clicked';
  
  // Recipient information
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  
  // Provider information
  providerName: string;
  messageId: string; // Provider message ID
  providerResponse?: string;
  
  // Delivery metadata
  responseCode: number;
  responseMessage: string;
  latencyMs: number;
  
  // Error information
  errorCode?: string;
  errorMessage?: string;
  errorDetails?: Record<string, any>;
  
  // Tracking
  openedAt?: Date;
  clickedAt?: Date;
  clickUrl?: string;
  
  // Timestamps
  sentAt: Date;
  deliveredAt?: Date;
  bouncedAt?: Date;
  failedAt?: Date;
  createdAt: Date;
}
```

## Log Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| INFO | Successful operations | Email sent, delivered |
| WARN | Warnings | Rate limit approaching, slow response |
| ERROR | Errors | Send failed, bounced |
| DEBUG | Debug information | Provider response details |

## Filtering Options

### Filter Types

1. **Status Filter**
   - Sent
   - Delivered
   - Bounced
   - Failed
   - Opened
   - Clicked

2. **Date Range Filter**
   - Today
   - Last 7 days
   - Last 30 days
   - Last 90 days
   - Custom range

3. **Provider Filter**
   - SendGrid
   - Resend
   - Mailgun
   - Postmark
   - Amazon SES
   - Brevo
   - SparkPost
   - SMTP

4. **Type Filter**
   - Verification
   - Reset Password
   - Payment Success
   - Welcome
   - Notification
   - Marketing

5. **Search Filter**
   - Recipient email
   - Subject
   - Message ID
   - Error message

### Filter Schema
```typescript
interface LogFilter {
  status?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  providerId?: string[];
  type?: string[];
  search?: string;
  sortBy?: 'sentAt' | 'latency' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
```

### Filter Implementation
```typescript
const applyFilters = (logs: EmailLog[], filter: LogFilter): EmailLog[] => {
  let filtered = [...logs];
  
  // Status filter
  if (filter.status?.length) {
    filtered = filtered.filter(log => filter.status!.includes(log.status));
  }
  
  // Date range filter
  if (filter.dateRange) {
    filtered = filtered.filter(log => 
      log.sentAt >= filter.dateRange!.start && 
      log.sentAt <= filter.dateRange!.end
    );
  }
  
  // Provider filter
  if (filter.providerId?.length) {
    filtered = filtered.filter(log => filter.providerId!.includes(log.providerId));
  }
  
  // Search filter
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter(log =>
      log.recipientEmail.toLowerCase().includes(searchLower) ||
      log.subject.toLowerCase().includes(searchLower) ||
      log.messageId.toLowerCase().includes(searchLower)
    );
  }
  
  // Sorting
  if (filter.sortBy) {
    filtered.sort((a, b) => {
      const aVal = a[filter.sortBy!];
      const bVal = b[filter.sortBy!];
      const order = filter.sortOrder === 'asc' ? 1 : -1;
      return aVal > bVal ? order : -order;
    });
  }
  
  return filtered;
};
```

## Export Functionality

### Export Formats
1. **CSV**: Standard comma-separated values
2. **JSON**: Structured JSON format
3. **Excel**: XLSX format with formatting

### Export Schema
```typescript
interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  filter?: LogFilter;
  columns?: string[];
  includeHeaders?: boolean;
  filename?: string;
}

interface ExportResult {
  downloadUrl: string;
  filename: string;
  fileSize: number;
  recordCount: number;
  exportedAt: Date;
}
```

### Export Process
```
1. Apply filters to log data
2. Select columns for export
3. Generate export file
4. Upload to temporary storage
5. Return download URL
6. Cleanup after download
```

### Export Rate Limits
- Maximum records per export: 10,000
- Maximum concurrent exports: 3
- Export file retention: 24 hours

## Details View

### Log Details Schema
```typescript
interface LogDetails {
  // Basic information
  id: string;
  status: string;
  subject: string;
  
  // Recipient
  recipient: {
    email: string;
    name?: string;
  };
  
  // Provider
  provider: {
    id: string;
    name: string;
    type: string;
  };
  
  // Delivery
  delivery: {
    messageId: string;
    responseCode: number;
    responseMessage: string;
    latencyMs: number;
  };
  
  // Timing
  timing: {
    createdAt: Date;
    sentAt: Date;
    deliveredAt?: Date;
    openedAt?: Date;
    clickedAt?: Date;
  };
  
  // Error (if failed)
  error?: {
    code: string;
    message: string;
    details: Record<string, any>;
  };
  
  // Tracking
  tracking?: {
    opened: boolean;
    clicked: boolean;
    clickUrl?: string;
    userAgent?: string;
    ipAddress?: string;
  };
  
  // Metadata
  metadata: {
    templateId?: string;
    variables?: Record<string, any>;
    tags?: string[];
  };
}
```

### Details View Sections
1. **Summary**: Status, recipient, subject, time
2. **Provider**: Provider name, message ID, response
3. **Delivery**: Status timeline, latency, response code
4. **Error**: Error code, message, stack trace (if failed)
5. **Tracking**: Open/click tracking, user agent, IP
6. **Metadata**: Template, variables, custom tags

## Log Retention

### Retention Policy
- **Hot storage**: 30 days (fast access)
- **Warm storage**: 90 days (slower access)
- **Cold storage**: 1 year (archive)
- **Purge**: After 1 year

### Retention Configuration
```typescript
interface RetentionConfig {
  hotStorageDays: number; // Default: 30
  warmStorageDays: number; // Default: 90
  coldStorageDays: number; // Default: 365
  autoPurge: boolean; // Default: true
  purgeBatchSize: number; // Default: 1000
}
```

## Performance Optimization

### Indexing Strategy
```sql
-- Primary indexes
CREATE INDEX idx_logs_sent_at ON email_logs(sent_at);
CREATE INDEX idx_logs_status ON email_logs(status);
CREATE INDEX idx_logs_provider_id ON email_logs(provider_id);
CREATE INDEX idx_logs_recipient_email ON email_logs(recipient_email);

-- Composite indexes
CREATE INDEX idx_logs_status_date ON email_logs(status, sent_at);
CREATE INDEX idx_logs_provider_date ON email_logs(provider_id, sent_at);
CREATE INDEX idx_logs_recipient_date ON email_logs(recipient_email, sent_at);

-- Full-text search
CREATE INDEX idx_logs_subject_search ON email_logs USING gin(to_tsvector('english', subject));
CREATE INDEX idx_logs_message_search ON email_logs USING gin(to_tsvector('english', message_id));
```

### Query Optimization
- Pagination with cursor-based approach
- Selective column loading
- Connection pooling
- Query result caching

## Localization Keys

### Log View
- `email.logs` - "Logs"
- `email.logsDescription` - "View email delivery logs and history"
- `email.logDetails` - "Log Details"
- `email.noLogs` - "No email logs found"
- `email.recentActivity` - "Recent Activity"
- `email.entries` - "entries"

### Log Fields
- `email.time` - "Time"
- `email.type` - "Type"
- `email.recipient` - "Recipient"
- `email.subject` - "Subject"
- `email.provider` - "Provider"
- `email.status` - "Status"
- `email.latency` - "Latency"
- `email.error` - "Error"
- `email.messageId` - "Message ID"
- `email.sentAt` - "Sent At"

### Log Status
- `email.sent` - "Sent"
- `email.delivered` - "Delivered"
- `email.failed` - "Failed"
- `email.bounce` - "Bounce"
- `email.emailOpened` - "Email Opened"
- `email.emailClicked` - "Email Clicked"

### Log Actions
- `email.exportCsv` - "Export CSV"
- `email.exportCSV` - "Export CSV"
- `email.logsExported` - "Logs exported"
- `email.exportFailed` - "Export failed"

### Log Filtering
- `email.dateRange` - "Date Range"
- `email.from` - "From"
- `email.to` - "To"
- `email.filter` - "Filter"
- `email.clearFilters` - "Clear filters"
- `email.advancedFilters` - "Advanced Filters"
- `email.dateFilter` - "Date Filter"
- `email.statusFilter` - "Status Filter"
- `email.typeFilter` - "Type Filter"
- `email.providerFilter` - "Provider Filter"
