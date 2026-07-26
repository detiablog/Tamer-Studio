import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET_KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.EMAIL_ENCRYPTION_KEY;
  if (!key) {
    const fallback = process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET;
    if (!fallback) {
      throw new Error("EMAIL_ENCRYPTION_KEY or AUTH_SECRET must be set");
    }
    return crypto.pbkdf2Sync(fallback, "tamer-email-encryption", 100000, SECRET_KEY_LENGTH, "sha256");
  }
  if (key.length === SECRET_KEY_LENGTH) {
    return Buffer.from(key, "hex");
  }
  return crypto.pbkdf2Sync(key, "tamer-email-encryption", 100000, SECRET_KEY_LENGTH, "sha256");
}

export function encrypt(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString("base64");
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`, { cause: error });
  }
}

export function decrypt(ciphertext: string): string {
  try {
    const key = getEncryptionKey();
    const decoded = Buffer.from(ciphertext, "base64");
    const iv = decoded.subarray(0, IV_LENGTH);
    const authTag = decoded.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = decoded.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : "Unknown error"} (invalid key or corrupted data)`, { cause: error });
  }
}

export function maskSensitive(value: string, visibleChars = 4): string {
  if (!value || value.length <= visibleChars) return "*".repeat(value.length || 4);
  const masked = "*".repeat(Math.max(0, value.length - visibleChars));
  return value.slice(0, visibleChars) + masked;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

export function generateId(prefix = "email"): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString("hex");
  return `${prefix}_${timestamp}_${random}`;
}
