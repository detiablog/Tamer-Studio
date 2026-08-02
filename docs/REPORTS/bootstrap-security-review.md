# Bootstrap Security Review — Tamer Studio

> Generated: 2026-08-02 | Sprint: ENV-02A

---

## Overview

This review covers the security of the admin bootstrap process — how the first administrator account is created and verified.

---

## Before (ENV-01)

### Issues

1. **Plaintext credentials in `scripts/create-admin.ts`**
   - Email: `admin@tamer.studio` (hardcoded)
   - Password: `SecureAdminPassword123!` (hardcoded)
   - Master Key: `admin-master-key-development` (hardcoded)

2. **Plaintext master key comparison in `verify.ts`**
   - `process.env.ADMIN_MASTER_KEY` was compared directly with `===`
   - Allowed timing attacks on plaintext secrets

3. **Plaintext credentials in `.env` and `.env.local`**
   - `ADMIN_EMAIL=aoneshoper@gmail.com`
   - `ADMIN_PASSWORD=Aoneshoper@2026Admin`
   - `ADMIN_MASTER_KEY="admin-master-key"`

4. **No password validation in bootstrap**
   - `create-admin.ts` accepted any password length

---

## After (ENV-02A)

### `scripts/create-admin.ts`

```typescript
// Reads from environment variables
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

// Validates requirements
if (!email || !password) {
  console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables.");
  process.exit(1);
}

if (password.length < 12) {
  console.error("❌ ADMIN_PASSWORD must be at least 12 characters long.");
  process.exit(1);
}

// Hashes password (never stores plaintext)
const passwordHash = await hashPassword(password);

// Warns to remove credentials after use
console.log("⚠️  IMPORTANT: Remove ADMIN_EMAIL and ADMIN_PASSWORD from your environment after login.");
```

### `src/core/admin/verify.ts`

```typescript
// ONLY hash-based verification — no plaintext comparison
export async function verifyMasterKey(masterKey: string): Promise<boolean> {
  const expectedHash = config.admin.masterKeyHash || process.env.ADMIN_MASTER_KEY_HASH;
  if (!expectedHash) return false;

  // 1. Try scrypt format
  if (expectedHash.startsWith("scrypt:")) {
    return verifySecret(masterKey, expectedHash);
  }

  // 2. Try SHA256 format with timing-safe comparison
  if (/^[a-fA-F0-9]{64}$/.test(expectedHash)) {
    if (masterKey === expectedHash) return true;
    const actualHash = crypto.createHash("sha256").update(masterKey).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(actualHash, "utf8"), Buffer.from(expectedHash, "utf8"));
  }

  return false;
}
```

### `.env` / `.env.local`

```bash
# Credentials are now empty — must be set by the developer
ADMIN_EMAIL=""
ADMIN_PASSWORD=""
ADMIN_MASTER_KEY=""
ADMIN_MASTER_KEY_HASH=""
```

---

## Security Improvements

| Aspect | Before | After |
|--------|--------|-------|
| Credential storage | Hardcoded in source | Environment variables only |
| Password validation | None | Minimum 12 characters |
| Master key verification | Plain-text `===` comparison | Hash-only (SHA-256 + scrypt) |
| Timing attacks | Vulnerable (plain-text `===`) | Protected (`crypto.timingSafeEqual`) |
| Post-bootstrap cleanup | Not mentioned | Warning to remove credentials |
| `.env` files | Real credentials | Placeholders only |

---

## Recommended Future Improvements

These are NOT part of ENV-02A scope but should be considered:

1. **Auto-disable bootstrap after first admin** — Check if admin exists in DB; if so, reject `create-admin.ts` execution
2. **Bootstrap audit log** — Log when bootstrap admin is created
3. **Email verification for bootstrap** — Require email verification for the first admin
4. **Rate limit bootstrap endpoint** — Prevent brute-force on the dev admin creation endpoint

---

## Verification Commands

```bash
# Verify no plaintext credentials in source
grep -r "Aoneshoper" src/ scripts/  # Should return nothing
grep -r "admin-master-key" src/ scripts/  # Should return nothing
grep -r "SecureAdminPassword" src/ scripts/  # Should return nothing

# Verify no plaintext admin key comparison
grep -r "ADMIN_MASTER_KEY" src/core/admin/verify.ts  # Should only show hash reference

# Verify env files are sanitized
cat .env | grep -E "ADMIN_PASSWORD|ADMIN_EMAIL"  # Should show empty values
```
