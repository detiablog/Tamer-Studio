import { verifySecret } from "@/core/security/crypto";
import { logger } from "@/core/logger";
import crypto from "crypto";

/**
 * Verify admin master key
 * Supports: plain text key OR SHA256 hash OR scrypt hash
 */
export async function verifyMasterKey(masterKey: string): Promise<boolean> {
  // 1. Try plain text match
  const plainKey = process.env.ADMIN_MASTER_KEY;
  if (plainKey && masterKey === plainKey) {
    logger.debug("Admin key verified via plain text match");
    return true;
  }

  const expectedHash = process.env.ADMIN_MASTER_KEY_HASH;
  if (!expectedHash) {
    return false;
  }

  // 2. Try scrypt format
  if (expectedHash.startsWith("scrypt:")) {
    return verifySecret(masterKey, expectedHash);
  }

  // 3. Try SHA256 format
  if (/^[a-fA-F0-9]{64}$/.test(expectedHash)) {
    // Direct hash comparison: user might send the hash itself
    if (masterKey === expectedHash) {
      logger.debug("Admin key verified via direct hash match");
      return true;
    }

    // Or user might send the original key — hash it and compare
    const actualHash = crypto.createHash("sha256").update(masterKey).digest("hex");
    try {
      if (crypto.timingSafeEqual(Buffer.from(actualHash, "utf8"), Buffer.from(expectedHash, "utf8"))) {
        logger.debug("Admin key verified via hash comparison");
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}
