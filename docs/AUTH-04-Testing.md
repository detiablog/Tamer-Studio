# AUTH-04 Testing Checklist

## Forgot Password Flow

- [ ] Submit forgot-password form with valid email returns success message
- [ ] Submit forgot-password form with non-existent email returns same success message (no enumeration)
- [ ] Submit forgot-password form with invalid email format returns validation error
- [ ] Rate limiting triggers after 5 requests within 1 hour
- [ ] Rate-limited requests return HTTP 429
- [ ] Reset email is sent to existing user's email address
- [ ] No email is sent for non-existent users

## Token Validation

- [ ] Validate endpoint returns `{ valid: true }` for valid, unexpired tokens
- [ ] Validate endpoint returns 400 for expired tokens
- [ ] Validate endpoint returns 400 for invalid tokens
- [ ] Validate endpoint returns 400 when token is missing

## Reset Password Form

- [ ] Page renders loading state while validating token
- [ ] Invalid/expired token shows "Invalid reset link" card
- [ ] Valid token shows password form
- [ ] "Request a new reset link" link navigates to `/forgot-password`
- [ ] "Remember your password? Sign in" link navigates to `/login`

## Password Reset Submission

- [ ] Submit with valid token and valid password succeeds
- [ ] Submit with valid token and short password (< 12 chars) fails
- [ ] Submit with valid token and missing uppercase fails
- [ ] Submit with valid token and missing lowercase fails
- [ ] Submit with valid token and missing number fails
- [ ] Submit with valid token and missing special character fails
- [ ] Submit with mismatched passwords shows error
- [ ] Submit with expired token returns error
- [ ] Submit with already-used token returns error
- [ ] Submit with invalid token returns error

## Session Revocation

- [ ] After successful reset, all existing sessions for the user are deleted
- [ ] User cannot access protected routes with old session cookies
- [ ] User must re-authenticate with new password

## Localization

- [ ] All error messages display in English (en locale)
- [ ] All error messages display in Indonesian (id locale)
- [ ] Form labels and placeholders are translated
- [ ] Success/error toasts are translated

## Edge Cases

- [ ] Multiple rapid reset requests for same email work correctly
- [ ] Reset link with token that was already used shows appropriate error
- [ ] Network error during submission shows appropriate error toast
- [ ] Browser back button after successful reset behaves correctly
- [ ] Token validation works with URL-encoded tokens

## Security

- [ ] Tokens are hashed before database storage
- [ ] Plain tokens are never logged or exposed
- [ ] Password is hashed with bcrypt before storage
- [ ] Old password cannot be used after reset
- [ ] Rate limiting is enforced per IP/session
