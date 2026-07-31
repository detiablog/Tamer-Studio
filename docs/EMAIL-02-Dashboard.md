# EMAIL-02: Dashboard Widgets

## Overview

The email dashboard provides a centralized view of email system health, delivery metrics, and recent activity. It includes various widgets for monitoring and analysis.

## Dashboard Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Email Dashboard                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Summary Cards                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │   │
│  │  │ Emails   │ │ Success  │ │ Failed   │        │   │
│  │  │ Sent     │ │ Rate     │ │ Rate     │        │   │
│  │  │ Today    │ │          │ │          │        │   │
│  │  └──────────┘ └──────────┘ └──────────┘        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Charts Section                      │   │
│  │  ┌──────────────────┐ ┌──────────────────┐      │   │
│  │  │  Volume Chart    │ │  Provider Chart  │      │   │
│  │  │  (Line/Bar)      │ │  (Pie/Donut)     │      │   │
│  │  └──────────────────┘ └──────────────────┘      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Details Section                     │   │
│  │  ┌──────────────────┐ ┌──────────────────┐      │   │
│  │  │  Recent Activity │ │  Top Templates   │      │   │
│  │  │  (Table)         │ │  (List)          │      │   │
│  │  └──────────────────┘ └──────────────────┘      │   │
│  │  ┌──────────────────┐ ┌──────────────────┐      │   │
│  │  │  Failure Reasons │ │  SMTP Health     │      │   │
│  │  │  (List)          │ │  (Status)        │      │   │
│  │  └──────────────────┘ └──────────────────┘      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Widget Descriptions

### 1. Summary Cards

#### Emails Sent Today
- **Data Source**: `email_logs` table
- **Query**: Count of emails with `sent_at` = today
- **Display**: Number with comparison to yesterday
- **Localization**: `email.emailsSentToday` - "Emails Sent Today"

#### Success Rate
- **Data Source**: `email_logs` table
- **Query**: (Count of status='delivered') / (Total sent) * 100
- **Display**: Percentage with color indicator
- **Localization**: `email.successRate` - "Success Rate"

#### Failed Rate
- **Data Source**: `email_logs` table
- **Query**: (Count of status='failed') / (Total sent) * 100
- **Display**: Percentage with color indicator
- **Localization**: `email.failedRate` - "Failed Rate"

#### Queue Size
- **Data Source**: `email_queue` table
- **Query**: Count of status='pending'
- **Display**: Number with trend indicator
- **Localization**: `email.queueSize` - "Queue Size"

#### Avg Send Time
- **Data Source**: `email_logs` table
- **Query**: Average of `latency_ms`
- **Display**: Milliseconds with comparison
- **Localization**: `email.avgSendTime` - "Avg Send Time"

### 2. Volume Chart

#### Chart Types
1. **Line Chart**: Daily volume over time
2. **Bar Chart**: Volume comparison by period
3. **Area Chart**: Cumulative volume

#### Data Sources
- **Daily Volume**: Last 7 days
- **Weekly Volume**: Last 4 weeks
- **Monthly Volume**: Last 12 months

#### Localization
- `email.dailyVolume` - "Daily Volume"
- `email.weeklyVolume` - "Weekly Volume"
- `email.monthlyVolume` - "Monthly Volume"
- `email.last7Days` - "Last 7 Days"
- `email.last4Weeks` - "Last 4 Weeks"
- `email.last12Months` - "Last 12 Months"

#### Chart Data Schema
```typescript
interface VolumeData {
  date: string;
  sent: number;
  delivered: number;
  failed: number;
  bounced: number;
}
```

### 3. Provider Breakdown Chart

#### Chart Types
1. **Pie Chart**: Distribution by provider
2. **Donut Chart**: Distribution with center stats
3. **Horizontal Bar**: Comparison by provider

#### Data Sources
- Provider delivery counts
- Provider success rates
- Provider latency averages

#### Localization
- `email.perProvider` - "Per Provider"
- `email.providerBreakdown` - "Provider Breakdown"

#### Chart Data Schema
```typescript
interface ProviderData {
  providerId: string;
  providerName: string;
  sent: number;
  delivered: number;
  failed: number;
  successRate: number;
  avgLatency: number;
}
```

### 4. Recent Activity Table

#### Table Columns
1. **Time**: When the email was sent
2. **Recipient**: Email address
3. **Subject**: Email subject line
4. **Provider**: Which provider sent it
5. **Status**: Delivery status
6. **Latency**: Time to deliver

#### Localization
- `email.recentActivity` - "Recent Activity"
- `email.time` - "Time"
- `email.recipient` - "Recipient"
- `email.subject` - "Subject"
- `email.provider` - "Provider"
- `email.status` - "Status"
- `email.latency` - "Latency"

#### Table Schema
```typescript
interface ActivityRow {
  id: string;
  sentAt: Date;
  recipientEmail: string;
  subject: string;
  providerName: string;
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  latencyMs: number;
}
```

### 5. Most Used Templates

#### Display
- Template name
- Usage count (last 30 days)
- Success rate
- Last used

#### Localization
- `email.mostUsedTemplates` - "Most Used Templates"
- `email.uses` - "{0} uses"

#### Data Schema
```typescript
interface TemplateUsage {
  templateId: string;
  templateName: string;
  usageCount: number;
  successRate: number;
  lastUsed: Date;
}
```

### 6. Top Failure Reasons

#### Display
- Error code/message
- Occurrence count
- Affected templates
- Last occurrence

#### Localization
- `email.topFailureReasons` - "Top Failure Reasons"

#### Data Schema
```typescript
interface FailureReason {
  errorCode: string;
  errorMessage: string;
  count: number;
  affectedTemplates: string[];
  lastOccurrence: Date;
}
```

### 7. SMTP Health Status

#### Health Indicators
- **Operational**: All systems normal
- **Degraded**: Some issues detected
- **Down**: Service unavailable
- **Maintenance**: Scheduled maintenance

#### Localization
- `email.smtpHealth` - "SMTP Health"
- `email.operational` - "Operational"
- `email.degraded` - "Degraded"
- `email.down` - "Down"
- `email.maintenance` - "Maintenance"

#### Health Schema
```typescript
interface SMTPHealth {
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  providers: {
    providerId: string;
    providerName: string;
    status: 'healthy' | 'warning' | 'offline';
    lastCheck: Date;
    latencyMs: number;
  }[];
  uptime: number; // Percentage
  lastIncident?: Date;
}
```

## Data Sources

### Primary Queries

#### Emails Sent Today
```sql
SELECT COUNT(*) as count
FROM email_logs
WHERE sent_at >= CURRENT_DATE
  AND sent_at < CURRENT_DATE + INTERVAL '1 day';
```

#### Success Rate
```sql
SELECT 
  COUNT(CASE WHEN status = 'delivered' THEN 1 END)::float / 
  NULLIF(COUNT(*), 0) * 100 as success_rate
FROM email_logs
WHERE sent_at >= CURRENT_DATE - INTERVAL '7 days';
```

#### Queue Depth
```sql
SELECT COUNT(*) as count
FROM email_queue
WHERE status = 'pending';
```

#### Volume Data
```sql
SELECT 
  DATE(sent_at) as date,
  COUNT(*) as sent,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced
FROM email_logs
WHERE sent_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(sent_at)
ORDER BY date;
```

#### Provider Breakdown
```sql
SELECT 
  p.id as provider_id,
  p.name as provider_name,
  COUNT(*) as sent,
  COUNT(CASE WHEN l.status = 'delivered' THEN 1 END) as delivered,
  COUNT(CASE WHEN l.status = 'failed' THEN 1 END) as failed,
  AVG(l.latency_ms) as avg_latency
FROM email_logs l
JOIN email_providers p ON l.provider_id = p.id
WHERE l.sent_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY p.id, p.name;
```

### Caching Strategy

#### Cache Keys
- `email:dashboard:summary:{date}` - Summary cards (1 hour)
- `email:dashboard:volume:{period}` - Volume chart (30 minutes)
- `email:dashboard:providers:{date}` - Provider breakdown (30 minutes)
- `email:dashboard:activity:{page}` - Recent activity (5 minutes)
- `email:dashboard:health` - SMTP health (1 minute)

#### Cache Invalidation
- On new email sent: Invalidate summary, activity
- On provider change: Invalidate provider breakdown, health
- On queue update: Invalidate queue size

## Refresh Intervals

| Widget | Refresh Interval | Manual Refresh |
|--------|------------------|----------------|
| Summary Cards | 5 minutes | Yes |
| Volume Chart | 15 minutes | Yes |
| Provider Chart | 15 minutes | Yes |
| Recent Activity | 1 minute | Yes |
| Most Used Templates | 1 hour | Yes |
| Top Failures | 1 hour | Yes |
| SMTP Health | 1 minute | Yes |

## Localization Keys

### Dashboard
- `email.monitoringDashboard` - "Monitoring Dashboard"
- `email.emailsSentToday` - "Emails Sent Today"
- `email.vsYesterday` - "vs yesterday"
- `email.successRate` - "Success Rate"
- `email.failedRate` - "Failed Rate"
- `email.queueSize` - "Queue Size"
- `email.avgSendTime` - "Avg Send Time"

### Charts
- `email.dailyVolume` - "Daily Volume"
- `email.weeklyVolume` - "Weekly Volume"
- `email.monthlyVolume` - "Monthly Volume"
- `email.last7Days` - "Last 7 Days"
- `email.last4Weeks` - "Last 4 Weeks"
- `email.last12Months` - "Last 12 Months"
- `email.perProvider` - "Per Provider"
- `email.providerBreakdown` - "Provider Breakdown"

### Health
- `email.smtpHealth` - "SMTP Health"
- `email.operational` - "Operational"
- `email.degraded` - "Degraded"
- `email.down` - "Down"
- `email.maintenance` - "Maintenance"

### Activity
- `email.recentActivity` - "Recent Activity"
- `email.mostUsedTemplates` - "Most Used Templates"
- `email.topFailureReasons` - "Top Failure Reasons"

### Actions
- `email.refresh` - "Refresh"
- `email.autoRefresh` - "Auto Refresh"
- `email.autoRefreshActive` - "Auto refresh active"
- `email.exportCsv` - "Export CSV"
- `email.csvExported` - "CSV exported"
- `email.exportFailed` - "Export failed"
