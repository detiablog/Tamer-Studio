# EMAIL-02: System Architecture Overview

## Overview

The EMAIL-02 sprint introduces a comprehensive email management system for the Tamer Studio admin panel. This document covers the system architecture, component relationships, data flow, and API endpoints.

## Component Relationships

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Panel                           │
├─────────────────────────────────────────────────────────┤
│  AdminSidebar                                            │
│    └── Email Section                                     │
│         ├── Dashboard (NEW)                              │
│         ├── Providers                                    │
│         ├── Templates                                    │
│         ├── Queue                                        │
│         ├── Logs                                         │
│         ├── Health                                       │
│         └── Statistics                                   │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                  Email Subsystem                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Dashboard   │  │  Builder    │  │  Queue      │     │
│  │  (Widgets)  │  │  (Visual)   │  │  (Manager)  │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         ▼                ▼                ▼             │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Email Service Layer                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │  │ Provider │  │ Template │  │  Log     │      │   │
│  │  │ Router   │  │ Engine   │  │  Store   │      │   │
│  │  └──────────┘  └──────────┘  └──────────┘      │   │
│  └─────────────────────────────────────────────────┘   │
│         │                │                │             │
│         ▼                ▼                ▼             │
│  ┌─────────────────────────────────────────────────┐   │
│  │              External Providers                  │   │
│  │  SendGrid | Resend | Mailgun | Postmark | SMTP  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Email Sending Flow

```
1. User Action (API / Admin UI)
       │
       ▼
2. Template Rendering
   - Variable substitution
   - HTML generation
   - Validation check
       │
       ▼
3. Queue Insertion
   - Priority assignment
   - Schedule calculation
   - Status: PENDING
       │
       ▼
4. Queue Worker Processing
   - Provider selection (priority/failover)
   - Rate limit check
   - Send attempt
       │
       ▼
5. Provider Delivery
   - SMTP/API call
   - Response handling
   - Status update (SENT/FAILED/BOUNCED)
       │
       ▼
6. Log Recording
   - Delivery metadata
   - Response codes
   - Timing data
```

### Template Rendering Flow

```
Template Source (HTML + Variables)
       │
       ▼
Variable Validation
   - Check {{variable}} syntax
   - Validate against schema
   - Flag unknown variables
       │
       ▼
HTML Rendering
   - Variable substitution
   - Conditional blocks
   - Loop handling
       │
       ▼
Output (Rendered HTML)
   - Desktop version
   - Mobile version (responsive)
   - Text fallback
```

## API Endpoint Summary

### Dashboard API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/email/dashboard` | Dashboard stats and metrics |
| GET | `/api/admin/email/dashboard/chart` | Chart data for volume trends |
| GET | `/api/admin/email/dashboard/activity` | Recent email activity |

### Provider API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/email/providers` | List all providers |
| POST | `/api/admin/email/providers` | Create provider |
| PUT | `/api/admin/email/providers/:id` | Update provider |
| DELETE | `/api/admin/email/providers/:id` | Delete provider |
| POST | `/api/admin/email/providers/:id/test` | Test connection |
| PUT | `/api/admin/email/providers/:id/priority` | Update priority |

### Template API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/email/templates` | List all templates |
| POST | `/api/admin/email/templates` | Create template |
| PUT | `/api/admin/email/templates/:id` | Update template |
| DELETE | `/api/admin/email/templates/:id` | Delete template |
| POST | `/api/admin/email/templates/:id/preview` | Preview template |
| POST | `/api/admin/email/templates/:id/send-test` | Send test email |

### Queue API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/email/queue` | List queue items |
| POST | `/api/admin/email/queue/:id/retry` | Retry queue item |
| POST | `/api/admin/email/queue/:id/cancel` | Cancel queue item |
| DELETE | `/api/admin/email/queue/:id` | Delete queue item |
| POST | `/api/admin/email/queue/bulk-retry` | Bulk retry |
| POST | `/api/admin/email/queue/bulk-cancel` | Bulk cancel |

### Logs API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/email/logs` | List email logs |
| GET | `/api/admin/email/logs/:id` | Get log details |
| GET | `/api/admin/email/logs/export` | Export logs (CSV) |

### Health API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/email/health` | Provider health status |
| POST | `/api/admin/email/health/check` | Run health check |
| GET | `/api/admin/email/health/history` | Health check history |

### Statistics API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/email/stats` | Overall statistics |
| GET | `/api/admin/email/stats/volume` | Volume data (daily/weekly/monthly) |
| GET | `/api/admin/email/stats/providers` | Per-provider breakdown |

## Database Schema

### email_providers
- `id` (UUID, PK)
- `name` (VARCHAR)
- `type` (ENUM: smtp, sendgrid, resend, mailgun, postmark, brevo, sparkpost, amazonses)
- `config` (JSONB) - Encrypted credentials
- `priority` (INTEGER)
- `routing_mode` (ENUM: priority, failover, round_robin, manual)
- `enabled` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

### email_templates
- `id` (UUID, PK)
- `name` (VARCHAR)
- `type` (ENUM: verification, reset_password, payment_success, welcome, etc.)
- `html_body` (TEXT)
- `variables` (JSONB)
- `version` (INTEGER)
- `is_system` (BOOLEAN)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

### email_queue
- `id` (UUID, PK)
- `template_id` (UUID, FK)
- `recipient_email` (VARCHAR)
- `recipient_name` (VARCHAR)
- `subject` (VARCHAR)
- `variables` (JSONB)
- `status` (ENUM: pending, processing, sent, failed, cancelled)
- `priority` (INTEGER)
- `scheduled_at` (TIMESTAMP)
- `sent_at` (TIMESTAMP)
- `error` (TEXT)
- `retry_count` (INTEGER)
- `created_at` (TIMESTAMP)

### email_logs
- `id` (UUID, PK)
- `queue_id` (UUID, FK)
- `provider_id` (UUID, FK)
- `status` (ENUM: sent, delivered, bounced, failed)
- `message_id` (VARCHAR) - Provider message ID
- `response_code` (INTEGER)
- `response_message` (TEXT)
- `latency_ms` (INTEGER)
- `error_code` (VARCHAR)
- `error_message` (TEXT)
- `created_at` (TIMESTAMP)

## Security Considerations

- All provider credentials are encrypted using AES-256
- API endpoints require admin authentication
- Rate limiting applied to email sending
- Audit logging for all provider changes
- Webhook secrets stored securely

## Localization

All UI strings use the `email.*` namespace in localization files:
- `locales/en.json` - English translations
- `locales/id.json` - Indonesian translations

New keys added in EMAIL-02:
- Builder block labels
- Dashboard widget labels
- Queue management labels
- Template management labels
- Monitoring labels
