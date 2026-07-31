# AUTH-04 Security

## Security Measures

### 1. Tokens Hashed Before Storage (SHA-256)

- Plain tokens are never stored in the database
- Only the SHA-256 hash is persisted
- Prevents token exposure if database is compromised
- Hashing is performed in `email.encryption.ts` via `hashToken()`

### 2. Single-Use Tokens

- After successful password reset, `usedAt` is set to current timestamp
- Subsequent attempts with the same token are rejected
- Prevents replay attacks

### 3. 30-Minute Token Expiration

- Tokens expire 30 minutes after creation
- Expired tokens are excluded from database queries via `expiresAt > NOW()`
- Limits the window for token interception and misuse

### 4. Rate Limiting on Forgot-Password

- **Endpoint**: `POST /api/auth/forgot-password`
- **Window**: 1 hour (60 minutes)
- **Limit**: 5 requests per window
- **Key prefix**: `auth:forgot-password`
- Prevents email flooding and abuse

### 5. Session Revocation After Password Change

- All active sessions for the user are deleted from the `session` table
- Ensures any potentially compromised sessions are terminated
- User must re-authenticate with new password

### 6. No Account Enumeration

- Forgot-password endpoint returns identical response for existing and non-existing emails
- Response: `"If an account exists for this email, you will receive a password reset link shortly."`
- Prevents attackers from discovering valid email addresses

### 7. Password Policy Enforcement

The reset endpoint enforces the following password requirements:

| Requirement | Rule |
|-------------|------|
| Minimum length | 12 characters |
| Maximum length | 128 characters |
| Uppercase letter | At least one `[A-Z]` |
| Lowercase letter | At least one `[a-z]` |
| Number | At least one `[0-9]` |
| Special character | At least one `[^A-Za-z0-9]` |

Validation is performed server-side via Zod schema.

### 8. Bcrypt Password Hashing

- Passwords are hashed using bcrypt with 12 rounds
- Ensures passwords are not stored in plaintext
- Compatible with existing account records

### 9. Token Validation Endpoint

- Separate `GET /api/auth/reset-password/validate` endpoint
- Validates token before showing the password form
- Prevents users from reaching the form with invalid tokens

### 10. Secure Token Generation

- Tokens generated using `crypto.randomBytes(32)`
- Produces 64-character hex strings with 256 bits of entropy
- cryptographically secure random number generator

## Threat Model

### Mitigated Threats

| Threat | Mitigation |
|--------|------------|
| Token theft from database | SHA-256 hashing |
| Replay attacks | Single-use tokens |
| Brute force | Token expiration + rate limiting |
| Email enumeration | Uniform responses |
| Session hijacking post-reset | Session revocation |
| Weak passwords | Password policy enforcement |
| Token interception | 30-minute expiration window |

### Remaining Considerations

- Email delivery is subject to the user's email provider security
- The reset link is transmitted over HTTPS (TLS)
- Consider implementing CSRF protection on the reset form if not already present
- Consider adding audit logging for password reset events
