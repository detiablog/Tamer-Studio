# AUTH-04 Database

## Overview

The password reset feature uses the existing `email_token` table for reset token storage. No new tables are required.

## Table: `email_token`

The `email_token` table stores all token types including verification and reset password tokens.

### Schema

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR | Token record ID (format: `token_{timestamp}_{random}`) |
| type | VARCHAR | Token type (`reset_password` or `verification`) |
| token | VARCHAR | SHA-256 hash of the plain token |
| email | VARCHAR | User's email address |
| userId | VARCHAR | Associated user ID |
| payload | JSONB | Optional additional data |
| expiresAt | TIMESTAMP | Token expiration time |
| usedAt | TIMESTAMP | Timestamp when token was used (null if unused) |
| createdAt | TIMESTAMP | Token creation time |

### Indexes

- Primary key on `id`
- Lookup index on `token` + `type` for fast validation queries
- Expiration check via `expiresAt > NOW()` in WHERE clause

## Token Operations

### Create Token

```sql
INSERT INTO email_token (id, type, token, email, userId, payload, expiresAt, createdAt)
VALUES ($1, 'reset_password', $2, $3, $4, $5, $6, $7);
```

- `token` field stores the SHA-256 hash of the plain token
- `expiresAt` is set to 30 minutes from creation time

### Find Valid Token

```sql
SELECT * FROM email_token
WHERE token = $1
  AND type = 'reset_password'
  AND expiresAt > NOW()
LIMIT 1;
```

- Only returns tokens that haven't expired
- Token is matched by SHA-256 hash (not plain text)

### Invalidate Token

```sql
UPDATE email_token
SET usedAt = NOW()
WHERE token = $1;
```

- Marks the token as used
- Prevents reuse of the same token

## Token Hashing

- **Algorithm**: SHA-256
- **Implementation**: `crypto.createHash("sha256").update(token).digest("hex")`
- **Location**: `src/modules/email/email.encryption.ts`

### Why SHA-256

- Tokens are generated as cryptographically random 32-byte values
- SHA-256 provides sufficient collision resistance for random tokens
- Hashing prevents token leakage from database exposure
- Hash is deterministic, enabling lookup without decrypting

## No New Tables Needed

The existing `email_token` table already supports:

- Multiple token types via the `type` column
- Token expiration via `expiresAt`
- Single-use enforcement via `usedAt`
- User association via `userId` and `email`

This design reuses the token infrastructure from AUTH-03 (email verification) and extends it for password reset.
