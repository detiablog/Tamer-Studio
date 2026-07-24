import { verifySecret } from "@/core/security/crypto";
import crypto from "crypto";

/**
 * Verify admin master key
 * Supports both plain text (development) and hashed (production)
 */
export async function verifyMasterKey(masterKey: string): Promise<boolean> {
  // Try plain text first (development)
  const plainKey = process.env.ADMIN_MASTER_KEY;
  if (plainKey && masterKey === plainKey) {
    console.log("[DEV] Admin key verified via plain text match");
    return true;
  }

  // Then try hash (production)
  const expectedHash = process.env.ADMIN_MASTER_KEY_HASH;
  if (!expectedHash) {
    return false;
  }

  // Try scrypt format
  if (expectedHash.startsWith("scrypt:")) {
    return verifySecret(masterKey, expectedHash);
  }

  // Try SHA256 format
  if (/^[a-fA-F0-9]{64}$/.test(expectedHash)) {
    const actualHash = crypto.createHash("sha256").update(masterKey).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(actualHash, "utf8"), Buffer.from(expectedHash, "utf8"));
    } catch {
      return false;
    }
  }

  return false;
}
