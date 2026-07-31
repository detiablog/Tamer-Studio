# CORE-SECURITY-01 — Testing Checklist

## Security Headers
- [ ] CSP header present
- [ ] HSTS header present
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy blocks trackers

## Rate Limiting
- [ ] Registration rate limited (5/hr)
- [ ] Forgot password rate limited (5/hr)
- [ ] Resend verification rate limited (3/hr)
- [ ] 429 response when exceeded
- [ ] Rate limit resets after window

## Input Sanitization
- [ ] HTML injection prevented
- [ ] Script tags stripped
- [ ] Event handlers removed
- [ ] JavaScript protocol blocked

## CSRF Protection
- [ ] Token generation works
- [ ] Token validation works

## Security Dashboard
- [ ] Overview tab loads
- [ ] Events tab shows events
- [ ] Incidents tab shows incidents
- [ ] Audit log tab shows entries
- [ ] Rate limits tab shows stats

## Permissions
- [ ] Admin-only access to security endpoints
- [ ] All mutations logged in audit

## Build
- [ ] TypeScript passes
- [ ] Build succeeds
- [ ] No runtime errors
