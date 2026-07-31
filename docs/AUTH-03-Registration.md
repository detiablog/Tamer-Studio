# AUTH-03 Registration Flow

## Overview

This document describes the user registration flow in Tamer Studio.

## Registration Steps

### 1. Form Submission

User fills out the registration form with:
- Full name
- Email address
- Password (with strength requirements)
- Password confirmation
- Terms and conditions acceptance

### 2. Client-side Validation

Before submission, the form validates:
- All required fields are present
- Email format is valid
- Password meets strength requirements (12+ characters, uppercase, lowercase, number, special character)
- Passwords match
- Terms and conditions are accepted

### 3. API Processing

The registration API:
1. Validates input with Zod schema
2. Checks for existing email in database
3. Hashes password with bcrypt (12 rounds)
4. Creates user record with `status: "pending_verification"`
5. Generates verification token
6. Sends verification email
7. Returns success response

### 4. Post-Registration

After successful registration:
- User sees success message
- Instructions to check email for verification link
- User redirected to verification pending page

## Password Requirements

| Requirement | Minimum |
|-------------|---------|
| Length | 12 characters |
| Uppercase | 1 letter |
| Lowercase | 1 letter |
| Numbers | 1 digit |
| Special characters | 1 character |

## Error Handling

- **Email already exists**: Returns 409 Conflict
- **Invalid input**: Returns 422 Validation Error
- **Server error**: Returns 500 Internal Server Error

## Localization

All registration messages support English and Indonesian (id) locales.
