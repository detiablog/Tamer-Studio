# AUTH-03 Database Schema Changes

## Overview

This document describes database schema changes for the AUTH-03 sprint.

## Users Table Updates

### New Columns

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| emailVerified | BOOLEAN | false | Email verification status |
| status | VARCHAR | "pending_verification" | Account status |

### Status Values

| Status | Description |
|--------|-------------|
| active | Fully verified and active account |
| pending_verification | Awaiting email verification |
| suspended | Account suspended by admin |

### Migration

```sql
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT false,
ADD COLUMN status VARCHAR(50) DEFAULT 'pending_verification';

CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email_verified ON users(email_verified);
```

## Verification Tokens Table

### Schema

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| token | VARCHAR | Verification token |
| expires_at | TIMESTAMP | Token expiration time |
| created_at | TIMESTAMP | Token creation time |

### Migration

```sql
CREATE TABLE verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_expires_at ON verification_tokens(expires_at);
```

## Audit Log Updates

### New Action Types

| Action | Description |
|--------|-------------|
| user.force_verify | Admin force-verified user email |
| user.email_verified | User verified email via link |

## Rollback

To rollback these changes:

```sql
DROP TABLE IF EXISTS verification_tokens;
ALTER TABLE users DROP COLUMN IF EXISTS email_verified;
ALTER TABLE users DROP COLUMN IF EXISTS status;
DROP INDEX IF EXISTS idx_users_status;
DROP INDEX IF EXISTS idx_users_email_verified;
```
