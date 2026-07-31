# EMAIL-01: Architecture

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                   UI Layer                       │
│  Settings Page → SMTP Config → Test/Send/Preview │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                 API Layer                        │
│  /api/admin/email/smtp/settings                  │
│  /api/admin/email/smtp/test                      │
│  /api/admin/email/smtp/send-test                 │
│  /api/admin/email/smtp/preview                   │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              Service Layer                       │
│  EmailAdminService → EmailAdminRepository        │
│  DatabaseEmailQueue → DefaultEmailWorker          │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              lib/email Runtime                   │
│  smtp.ts → transport.ts → templates.ts           │
│  queue.ts → logs.ts                              │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              Database (PostgreSQL)                │
│  email_provider → email_queue → email_log        │
│  email_template → email_statistics               │
└─────────────────────────────────────────────────┘
```

## Email Flow

1. **Configuration**: Admin configures SMTP settings in Settings page
2. **Settings stored**: Encrypted credentials saved to `email_provider` table
3. **Email queued**: When email is needed, item created in `email_queue`
4. **Worker processes**: Email worker picks up queued items
5. **Transport created**: SMTP transport built from encrypted credentials
6. **Email sent**: Nodemailer sends via SMTP server
7. **Status updated**: Queue item status updated, log entry created

## Security

- SMTP password encrypted with AES-256-GCM
- Password never returned in API responses (masked)
- Admin authentication required for all email APIs
- Credentials decrypted only at transport creation time
