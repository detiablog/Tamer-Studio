# AUTH-03 Email Verification Flow

## Overview

This document describes the email verification flow in Tamer Studio.

## Verification Steps

### 1. Token Generation

When a user registers:
1. Unique token generated using cryptographic random
2. Token stored in database with expiry (24 hours)
3. Verification URL constructed with token

### 2. Email Delivery

Verification email contains:
- Welcome message
- Verification link with token
- Link expiration notice (24 hours)
- Fallback instructions if link doesn't work

### 3. Token Validation

When user clicks verification link:
1. API extracts token from URL
2. Token looked up in database
3. Expiry checked
4. If valid: `emailVerified = true`, `status = "active"`
5. If invalid/expired: Error message displayed

### 4. Resend Verification

Users can request new verification email:
1. Rate limited (max 3 per hour)
2. Previous tokens invalidated
3. New token generated and emailed

## Admin Force Verify

Admins can bypass email verification:
1. Navigate to admin users page
2. Click "Force Verify" button (ShieldCheck icon)
3. Confirm action in dialog
4. User's `emailVerified` set to `true`
5. User's `status` set to `"active"`
6. Action logged in audit trail

## Error States

| State | Description | User Action |
|-------|-------------|-------------|
| Token valid | Email verified successfully | Redirect to dashboard |
| Token expired | Link has expired | Request new verification email |
| Token invalid | Invalid verification link | Request new verification email |
| Email not verified | Account pending verification | Check inbox for email |

## Localization

All verification messages support English and Indonesian (id) locales.
