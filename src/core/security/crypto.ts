import crypto from "crypto";

const ARGON2_MEMORY_COST = 65536;
const ARGON2_TIME_COST = 3;
const ARGON2_PARALLELISM = 4;
const ARGON2_HASH_LENGTH = 64;
const ARGON2_SALT_LENGTH = 32;

export function generateSecret(length = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

export function hashSecret(secret: string): string {
  const salt = crypto.randomBytes(ARGON2_SALT_LENGTH).toString("hex");
  const hash = crypto.pbkdf2Sync(secret, salt, ARGON2_TIME_COST, ARGON2_HASH_LENGTH, "sha256");
  return `scrypt:${salt}:${hash.toString("hex")}`;
}

export async function verifySecret(secret: string, storedHash: string): Promise<boolean> {
  if (!storedHash.startsWith("scrypt:")) {
    return false;
  }
  const parts = storedHash.split(":");
  if (parts.length !== 3) return false;
  const salt = parts[1];
  const expectedHash = parts[2];
  const actualHash = crypto.pbkdf2Sync(secret, salt, ARGON2_TIME_COST, ARGON2_HASH_LENGTH, "sha256").toString("hex");
  return timingSafeEqual(actualHash, expectedHash);
}

export function validateSecretFormat(secret: string, minLength = 32): boolean {
  return secret.length >= minLength && /^[a-zA-Z0-9]+$/.test(secret);
}

export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  try {
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
