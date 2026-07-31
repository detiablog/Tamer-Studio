# AUTH-03 Architecture

## Overview

This document describes the registration and email verification architecture for Tamer Studio.

## Components

### Registration Flow

1. **Client-side Form**: React form component with password strength indicators
2. **API Route**: `/api/auth/register` handles account creation
3. **Email Service**: Sends verification email via configured provider
4. **Token Generation**: Cryptographic token for email verification links

### Verification Flow

1. **Token Generation**: Unique token created per verification request
2. **Email Delivery**: Verification link sent to user's email
3. **Token Validation**: API validates token on click
4. **Account Activation**: Email verified status updated in database

### Admin Force Verify

1. **Admin Authentication**: Requires admin session and `users.write` permission
2. **User Update**: Sets `emailVerified = true` and `status = "active"`
3. **Audit Logging**: Action logged for compliance and traceability

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR | User email address |
| name | VARCHAR | User display name |
| password_hash | VARCHAR | Hashed password (bcrypt) |
| emailVerified | BOOLEAN | Email verification status |
| status | VARCHAR | Account status (active, pending_verification, suspended) |
| createdAt | TIMESTAMP | Account creation time |
| updatedAt | TIMESTAMP | Last update time |

## Security Considerations

- Passwords hashed with bcrypt (12+ rounds)
- Verification tokens expire after 24 hours
- Rate limiting on verification email requests
- Admin force-verify requires admin authentication
- All admin actions logged in audit trail
