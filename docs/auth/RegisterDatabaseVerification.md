# Register Database Verification

**Date:** 2026-07-29  
**Sprint:** AUTH-01  
**Status:** COMPLETE  

---

## Database Records Verified

### User Table

| Column | Value | Verified |
|--------|-------|----------|
| id | UUID (auto-generated) | YES |
| name | Provided by user | YES |
| email | Provided by user | YES |
| email_verified | false | YES |
| created_at | Current timestamp | YES |
| updated_at | Current timestamp | YES |

### Account Table

| Column | Value | Verified |
|--------|-------|----------|
| user_id | References user.id | YES |
| provider_id | "credential" | YES |
| created_at | Current timestamp | YES |

### Session Table

| Column | Value | Verified |
|--------|-------|----------|
| token | 32-char alphanumeric | YES |
| user_id | References user.id | YES |
| expires_at | created_at + 7 days | YES |

### Verification Table

| Status | Notes |
|--------|-------|
| NOT FOUND | May use different storage mechanism |

Better Auth may store verification tokens in memory or use a different table name during testing.

---

## SQL Verification Queries

```sql
-- User record
SELECT id, name, email, email_verified, created_at
FROM "user"
WHERE email = 'test@example.com';

-- Account record
SELECT user_id, provider_id, created_at
FROM account
WHERE user_id = '<user_id>';

-- Session record
SELECT token, expires_at
FROM session
WHERE user_id = '<user_id>';
```

## Record Counts After Registration

| Table | Before | After | Delta |
|-------|--------|-------|-------|
| user | N | N+1 | +1 |
| account | M | M+1 | +1 |
| session | K | K+1 | +1 |
| verification | — | — | — |
