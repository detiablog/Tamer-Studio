# EMAIL-01: Database Schema

## Tables

### email_provider
Stores email provider configurations (SMTP, SendGrid, etc.)

| Column | Type | Description |
|--------|------|-------------|
| id | text (PK) | Provider ID |
| name | text | Provider name |
| type | text | Provider type (smtp, sendgrid, etc.) |
| description | text | Description |
| is_active | boolean | Whether provider is enabled |
| priority | integer | Routing priority |
| routing_mode | text | Routing mode |
| config | jsonb | Provider config |
| credentials_encrypted | text | AES-256 encrypted credentials |
| sender_name | text | Default sender name |
| sender_email | text | Default sender email |
| reply_to | text | Reply-to email |
| daily_limit | integer | Daily send limit |
| monthly_limit | integer | Monthly send limit |
| timeout | integer | Connection timeout (seconds) |
| retry_count | integer | Max retry attempts |
| last_tested_at | timestamp | Last test time |
| last_test_status | text | Last test result |
| last_test_error | text | Last test error |

### email_queue
Email delivery queue with retry support.

| Column | Type | Description |
|--------|------|-------------|
| id | text (PK) | Queue item ID |
| type | text | Email type |
| to | text | Recipient |
| subject | text | Subject |
| html | text | HTML body |
| text | text | Plain text body |
| status | text | queued/processing/sent/failed |
| priority | integer | Priority |
| attempts | integer | Current attempt count |
| max_attempts | integer | Max attempts |
| error | text | Last error message |
| provider_id | text | FK to email_provider |

### email_log
Delivery log for all sent emails.

| Column | Type | Description |
|--------|------|-------------|
| id | text (PK) | Log ID |
| queue_id | text | FK to email_queue |
| type | text | Email type |
| to | text | Recipient |
| subject | text | Subject |
| status | text | Delivery status |
| attempts | integer | Attempt count |
| latency_ms | integer | Response time |
| error_message | text | Error details |
| created_at | timestamp | Created time |

### email_template
Email template definitions.

### email_statistics
Daily per-provider statistics.

### email_provider_health
Provider health check records.

### email_token
Verification and reset tokens.
