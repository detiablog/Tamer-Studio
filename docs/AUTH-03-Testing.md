# AUTH-03 Testing Checklist

## Overview

This document provides testing procedures for AUTH-03 features.

## Registration Testing

### Happy Path
- [ ] User can register with valid data
- [ ] Password requirements enforced
- [ ] Verification email sent
- [ ] Success message displayed
- [ ] User redirected to verification pending page

### Validation
- [ ] Reject empty name
- [ ] Reject invalid email format
- [ ] Reject password < 12 characters
- [ ] Reject password without uppercase
- [ ] Reject password without lowercase
- [ ] Reject password without number
- [ ] Reject password without special character
- [ ] Reject mismatched passwords
- [ ] Reject missing terms acceptance

### Edge Cases
- [ ] Handle existing email (409 Conflict)
- [ ] Handle server errors gracefully
- [ ] Handle network failures
- [ ] Prevent duplicate submissions

## Email Verification Testing

### Happy Path
- [ ] Clicking valid link verifies email
- [ ] User status changes to "active"
- [ ] Email verified status set to true
- [ ] Redirect to dashboard after verification

### Error States
- [ ] Expired token shows error message
- [ ] Invalid token shows error message
- [ ] Already verified email shows appropriate message
- [ ] Resend verification works correctly

### Rate Limiting
- [ ] Maximum 3 resend requests per hour
- [ ] Rate limit error message displayed
- [ ] Rate limit resets after cooldown

## Admin Force Verify Testing

### Authentication
- [ ] Unauthenticated requests rejected (401)
- [ ] Non-admin users rejected (403)
- [ ] Invalid admin key rejected

### Happy Path
- [ ] Admin can force verify unverified user
- [ ] User status changes to "active"
- [ ] Email verified status set to true
- [ ] Audit log entry created
- [ ] Success message displayed
- [ ] User list refreshes

### UI Testing
- [ ] Force verify button visible for unverified users
- [ ] Force verify button hidden for verified users
- [ ] Confirmation dialog displayed
- [ ] Loading state shown during request
- [ ] Error message shown on failure

## Localization Testing

### English (en)
- [ ] All registration messages in English
- [ ] All verification messages in English
- [ ] All admin messages in English
- [ ] Error messages in English

### Indonesian (id)
- [ ] All registration messages in Indonesian
- [ ] All verification messages in Indonesian
- [ ] All admin messages in Indonesian
- [ ] Error messages in Indonesian

## Cross-browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Mobile Testing

- [ ] Responsive design works on mobile
- [ ] Touch interactions work correctly
- [ ] Form inputs accessible on mobile
- [ ] Buttons properly sized for touch

## Performance Testing

- [ ] Registration form loads quickly
- [ ] Verification email sent within 5 seconds
- [ ] Admin users page loads with 1000+ users
- [ ] Force verify completes within 2 seconds
